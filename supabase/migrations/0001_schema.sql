-- Mazad MVP schema. Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ---------- tables ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  phone text,
  city text,
  avatar_url text,
  wallet_balance numeric(12,2) not null default 0 check (wallet_balance >= 0),
  wallet_held numeric(12,2) not null default 0 check (wallet_held >= 0),
  strikes int not null default 0,
  created_at timestamptz not null default now()
);

create table public.categories (
  id serial primary key,
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  icon text not null default 'tag'
);

create type auction_status as enum ('live', 'ended', 'cancelled');
create type auction_mode as enum ('timed', 'open_ended');
create type deposit_status as enum ('held', 'refunded', 'applied', 'forfeited');

create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles on delete cascade,
  category_id int not null references public.categories,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  images text[] not null default '{}',
  condition text not null default 'used' check (condition in ('new','like_new','used')),
  city text,
  start_price numeric(12,2) not null default 1 check (start_price >= 0),
  open_to_highest boolean not null default false,
  reserve_price numeric(12,2),
  has_reserve boolean generated always as (reserve_price is not null) stored,
  mode auction_mode not null default 'timed',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status auction_status not null default 'live',
  current_price numeric(12,2) not null default 0,
  bid_count int not null default 0,
  winner_id uuid references public.profiles,
  deposit_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  check (mode = 'open_ended' or ends_at is not null)
);
create index auctions_status_ends on public.auctions (status, ends_at);
create index auctions_category on public.auctions (category_id);
create index auctions_title_search on public.auctions using gin (to_tsvector('simple', title || ' ' || description));

create table public.bids (
  id bigserial primary key,
  auction_id uuid not null references public.auctions on delete cascade,
  bidder_id uuid not null references public.profiles on delete cascade,
  amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);
create index bids_auction on public.bids (auction_id, amount desc);
create index bids_bidder on public.bids (bidder_id);

create table public.deposits (
  auction_id uuid not null references public.auctions on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  amount numeric(12,2) not null,
  status deposit_status not null default 'held',
  created_at timestamptz not null default now(),
  primary key (auction_id, user_id)
);

create table public.wallet_tx (
  id bigserial primary key,
  user_id uuid not null references public.profiles on delete cascade,
  type text not null check (type in ('topup','hold','release','apply','forfeit')),
  amount numeric(12,2) not null,
  ref uuid,
  created_at timestamptz not null default now()
);

create table public.watchlist (
  user_id uuid not null references public.profiles on delete cascade,
  auction_id uuid not null references public.auctions on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, auction_id)
);

-- ---------- new user -> profile ----------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- helpers ----------
create function public.min_increment(p numeric) returns numeric
language sql immutable as $$
  select case when p < 500 then 5 when p < 5000 then 25 else 100 end
$$;

-- Trending score: bids and watchers in the last 24h.
create view public.auctions_trending as
select a.id, a.seller_id, a.category_id, a.title, a.description, a.images, a.condition, a.city, a.start_price,
  a.open_to_highest, a.has_reserve, a.mode, a.starts_at, a.ends_at, a.status, a.current_price, a.bid_count,
  a.winner_id, a.deposit_amount, a.created_at,
  (select count(*) from public.bids b where b.auction_id = a.id and b.created_at > now() - interval '24 hours') * 3
  + (select count(*) from public.watchlist w where w.auction_id = a.id and w.created_at > now() - interval '24 hours') as trend_score
from public.auctions a;

-- ---------- RPC: wallet top-up (mock, replace with Paymob webhook later) ----------
create function public.topup_wallet(p_amount numeric) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_amount <= 0 or p_amount > 100000 then raise exception 'invalid_amount'; end if;
  update profiles set wallet_balance = wallet_balance + p_amount where id = auth.uid();
  insert into wallet_tx (user_id, type, amount) values (auth.uid(), 'topup', p_amount);
end $$;

-- ---------- RPC: create auction ----------
create function public.create_auction(
  p_title text, p_description text, p_category int, p_images text[], p_condition text, p_city text,
  p_start_price numeric, p_open_to_highest boolean, p_reserve numeric, p_duration_hours int
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_start numeric; v_mode auction_mode; v_ends timestamptz;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  v_start := case when p_open_to_highest then 1 else p_start_price end;
  if v_start < 1 then raise exception 'invalid_start_price'; end if;
  if p_reserve is not null and p_reserve < v_start then raise exception 'reserve_below_start'; end if;
  if p_duration_hours is null then v_mode := 'open_ended'; v_ends := null;
  else
    if p_duration_hours < 1 or p_duration_hours > 24*14 then raise exception 'invalid_duration'; end if;
    v_mode := 'timed'; v_ends := now() + make_interval(hours => p_duration_hours);
  end if;
  insert into auctions (seller_id, category_id, title, description, images, condition, city, start_price,
    open_to_highest, reserve_price, mode, ends_at, current_price, deposit_amount)
  values (auth.uid(), p_category, p_title, p_description, coalesce(p_images,'{}'), p_condition, p_city, v_start,
    p_open_to_highest, p_reserve, v_mode, v_ends, v_start, round(v_start * 0.01, 2))
  returning id into v_id;
  return v_id;
end $$;

-- ---------- RPC: place bid ----------
create function public.place_bid(p_auction uuid, p_amount numeric) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a auctions%rowtype;
  v_uid uuid := auth.uid();
  v_min numeric;
  v_has_deposit boolean;
  v_bal numeric;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into a from auctions where id = p_auction for update;
  if not found then raise exception 'auction_not_found'; end if;
  if a.status <> 'live' or (a.ends_at is not null and a.ends_at <= now()) then raise exception 'auction_closed'; end if;
  if a.seller_id = v_uid then raise exception 'seller_cannot_bid'; end if;
  if (select strikes from profiles where id = v_uid) >= 3 then raise exception 'account_restricted'; end if;

  -- first bid ever on this auction takes the opening price; later bids must beat the current one
  v_min := case when a.bid_count = 0 then a.start_price else a.current_price + min_increment(a.current_price) end;
  if p_amount < v_min then raise exception 'bid_too_low:%', v_min; end if;

  select exists(select 1 from deposits where auction_id = a.id and user_id = v_uid and status = 'held') into v_has_deposit;
  if not v_has_deposit then
    select wallet_balance into v_bal from profiles where id = v_uid for update;
    if v_bal < a.deposit_amount then raise exception 'insufficient_wallet:%', a.deposit_amount; end if;
    update profiles set wallet_balance = wallet_balance - a.deposit_amount, wallet_held = wallet_held + a.deposit_amount where id = v_uid;
    insert into deposits (auction_id, user_id, amount) values (a.id, v_uid, a.deposit_amount)
      on conflict (auction_id, user_id) do update set status = 'held', amount = excluded.amount;
    insert into wallet_tx (user_id, type, amount, ref) values (v_uid, 'hold', a.deposit_amount, a.id);
  end if;

  insert into bids (auction_id, bidder_id, amount) values (a.id, v_uid, p_amount);
  update auctions set
    current_price = p_amount,
    bid_count = bid_count + 1,
    -- anti-sniping: a bid in the last 2 minutes pushes the end out by 2 minutes
    ends_at = case when ends_at is not null and ends_at - now() < interval '2 minutes' then now() + interval '2 minutes' else ends_at end
  where id = a.id;

  return jsonb_build_object('ok', true, 'current_price', p_amount);
end $$;

-- ---------- close one auction (idempotent) ----------
create function public.close_auction(p_auction uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  a auctions%rowtype;
  v_win_bid bids%rowtype;
  d record;
  v_sold boolean;
begin
  select * into a from auctions where id = p_auction for update;
  if not found or a.status <> 'live' then return; end if;
  select * into v_win_bid from bids where auction_id = a.id order by amount desc, created_at asc limit 1;
  v_sold := found and (a.reserve_price is null or v_win_bid.amount >= a.reserve_price);

  for d in select * from deposits where auction_id = a.id and status = 'held' loop
    if v_sold and d.user_id = v_win_bid.bidder_id then
      -- winner's deposit is credited toward the price
      update profiles set wallet_held = wallet_held - d.amount where id = d.user_id;
      update deposits set status = 'applied' where auction_id = a.id and user_id = d.user_id;
      insert into wallet_tx (user_id, type, amount, ref) values (d.user_id, 'apply', d.amount, a.id);
    else
      update profiles set wallet_held = wallet_held - d.amount, wallet_balance = wallet_balance + d.amount where id = d.user_id;
      update deposits set status = 'refunded' where auction_id = a.id and user_id = d.user_id;
      insert into wallet_tx (user_id, type, amount, ref) values (d.user_id, 'release', d.amount, a.id);
    end if;
  end loop;

  update auctions set status = 'ended', winner_id = case when v_sold then v_win_bid.bidder_id end where id = a.id;
end $$;

-- ---------- close all expired auctions (called by cron) ----------
create function public.close_expired_auctions() returns int
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  for r in select id from auctions where status = 'live' and ends_at is not null and ends_at <= now() loop
    perform close_auction(r.id); n := n + 1;
  end loop;
  return n;
end $$;

-- seller closes an open-ended auction (accepts the highest bid) or cancels a bid-less one
create function public.seller_close_auction(p_auction uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from auctions where id = p_auction and seller_id = auth.uid()) then raise exception 'forbidden'; end if;
  perform close_auction(p_auction);
end $$;

create function public.cancel_auction(p_auction uuid) returns void
language plpgsql security definer set search_path = public as $$
declare a auctions%rowtype; d record;
begin
  select * into a from auctions where id = p_auction and seller_id = auth.uid() for update;
  if not found then raise exception 'forbidden'; end if;
  if a.status <> 'live' then return; end if;
  for d in select * from deposits where auction_id = a.id and status = 'held' loop
    update profiles set wallet_held = wallet_held - d.amount, wallet_balance = wallet_balance + d.amount where id = d.user_id;
    update deposits set status = 'refunded' where auction_id = a.id and user_id = d.user_id;
    insert into wallet_tx (user_id, type, amount, ref) values (d.user_id, 'release', d.amount, a.id);
  end loop;
  update auctions set status = 'cancelled' where id = a.id;
end $$;

-- Optional: schedule closing every minute (enable pg_cron in Dashboard > Database > Extensions first)
-- select cron.schedule('close-expired-auctions', '* * * * *', $$select public.close_expired_auctions()$$);

-- ---------- row level security ----------
alter table profiles enable row level security;
alter table categories enable row level security;
alter table auctions enable row level security;
alter table bids enable row level security;
alter table deposits enable row level security;
alter table wallet_tx enable row level security;
alter table watchlist enable row level security;

create policy "profiles self read" on profiles for select using (auth.uid() = id);
create policy "profiles self update" on profiles for update using (auth.uid() = id)
  with check (auth.uid() = id and wallet_balance = (select wallet_balance from profiles where id = auth.uid())
              and wallet_held = (select wallet_held from profiles where id = auth.uid())
              and strikes = (select strikes from profiles where id = auth.uid()));
create policy "categories public" on categories for select using (true);
create policy "auctions public" on auctions for select using (true);
create policy "bids public" on bids for select using (true);
create policy "deposits own" on deposits for select using (auth.uid() = user_id);
create policy "wallet_tx own" on wallet_tx for select using (auth.uid() = user_id);
create policy "watchlist own" on watchlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public bidder display names without exposing wallets
create view public.public_profiles as select id, name, city, created_at from public.profiles;
grant select on public.public_profiles to anon, authenticated;

-- Direct table writes are blocked; all writes go through the RPCs above.
revoke insert, update, delete on public.auctions, public.bids, public.deposits, public.wallet_tx from anon, authenticated;
-- The hidden reserve price must never reach clients: revoke it at column level.
revoke select on public.auctions from anon, authenticated;
grant select (id, seller_id, category_id, title, description, images, condition, city, start_price, open_to_highest,
  has_reserve, mode, starts_at, ends_at, status, current_price, bid_count, winner_id, deposit_amount, created_at)
  on public.auctions to anon, authenticated;
grant select on public.auctions_trending to anon, authenticated;

revoke execute on function public.close_auction(uuid), public.close_expired_auctions() from anon, authenticated;

-- ---------- storage bucket for photos ----------
insert into storage.buckets (id, name, public) values ('auction-images', 'auction-images', true) on conflict do nothing;
create policy "images public read" on storage.objects for select using (bucket_id = 'auction-images');
create policy "images user upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'auction-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- realtime for live price updates
alter publication supabase_realtime add table public.auctions, public.bids;
