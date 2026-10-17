-- Categories. Sample auctions need a real seller, so they are created from the app (Sell tab) after you sign up.
insert into public.categories (slug, name_en, name_ar, icon) values
  ('phones',      'Phones & Tablets',   'موبايلات وتابلت',     'smartphone'),
  ('electronics', 'Electronics',        'إلكترونيات',          'cpu'),
  ('fashion',     'Fashion & Sneakers', 'موضة وأحذية',         'shirt'),
  ('home',        'Home & Furniture',   'أثاث ومنزل',          'sofa'),
  ('cars',        'Cars & Bikes',       'سيارات ودراجات',      'car'),
  ('collectibles','Collectibles',       'مقتنيات وتحف',        'gem'),
  ('watches',     'Watches & Jewelry',  'ساعات ومجوهرات',      'watch'),
  ('gaming',      'Gaming',             'ألعاب فيديو',         'gamepad'),
  ('sports',      'Sports & Outdoor',   'رياضة',               'dumbbell'),
  ('other',       'Other',              'أخرى',                'tag')
on conflict (slug) do nothing;
