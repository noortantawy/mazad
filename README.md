# Mazad (مزاد)

Online auctions for Egypt. Four tabs: Explore, Buy, Sell, Profile. Every bidder puts 1% of the starting price down on their first bid, refunded if they lose.

Stack: Next.js 15 (App Router), Tailwind 4, Supabase (Postgres, Auth, Storage, Realtime).

## Run it

```bash
npm install
npm run dev
```

With no Supabase keys the app runs in **preview mode**: sample auctions you can browse and filter, with sign-in, bidding and selling switched off.

## Turn on the backend

1. Create a free project at supabase.com.
2. In the SQL editor, run `supabase/migrations/0001_schema.sql`, then `supabase/seed.sql`.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key (Project settings, API).
4. For local testing, turn off "Confirm email" under Authentication, Providers, Email.
5. Close ended auctions every minute: enable the `pg_cron` extension and run the commented `cron.schedule` line at the bottom of the migration.

## How the rules are enforced

All money and bidding rules live in Postgres functions, not in the browser. Direct writes to auctions, bids, deposits and the wallet ledger are revoked.

| Function | What it does |
|---|---|
| `create_auction` | Validates price, reserve and duration. Deposit is 1% of the starting price. |
| `place_bid` | Locks the auction row, enforces minimum raise, holds the deposit on a bidder's first bid, extends the end by 2 minutes for bids in the last 2 minutes. |
| `close_auction` / `close_expired_auctions` | Picks the winner, applies the winner's deposit, refunds everyone else. A reserve that is not met means no sale. |
| `seller_close_auction`, `cancel_auction` | Seller accepts the top bid on an open-ended auction, or cancels (all deposits refunded). |
| `topup_wallet` | Test wallet. Replace with a Paymob or Fawry webhook later. |

The hidden reserve price is column-protected, so clients can see that a reserve exists but never its value.

## Not built yet

- Real payments (Paymob/Fawry) and delivery
- Arabic UI and RTL layout (category names already have Arabic)
- Push or email notifications for outbid and won
- Charging the winner the remaining balance and applying a strike for non-payment
- Seller and item verification
