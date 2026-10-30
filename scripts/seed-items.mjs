// Single source of truth for sample auctions.
// `node scripts/generate-seed.mjs` turns this into pictures, preview data and SQL.
//
// cat: category slug (see supabase/seed.sql)
// start/current in EGP, endsInH = hours from now (null = open-ended)
// pics: how many gallery pictures to generate

export const ITEMS = [
  { slug: "iphone-13", title: "iPhone 13 128GB, battery 91%", cat: "phones", start: 14000, current: 16250, bids: 23, endsInH: 0.8, city: "Cairo", cond: "used", reserve: 15000, pics: 3, c1: "#1f3b4d", c2: "#4fa3a5", desc: "Midnight color, original box and charger. Battery health 91%, no cracks, tiny scuff on the frame. Face ID and cameras fully working. Unlocked, Egyptian warranty expired." },
  { slug: "nike-dunk-panda", title: "Nike Dunk Low Panda, size 43, deadstock", cat: "fashion", start: 3500, current: 4600, bids: 31, endsInH: 2.5, city: "Giza", cond: "new", pics: 2, c1: "#2b2b2b", c2: "#8a8a8a", desc: "Never worn, comes with original box and receipt. Size EU 43 / US 9.5. Verified purchase from an official retailer." },
  { slug: "ps5-bundle", title: "PlayStation 5 + 2 controllers", cat: "gaming", start: 18000, current: 21400, bids: 18, endsInH: 5, city: "Alexandria", cond: "like_new", reserve: 20000, pics: 3, c1: "#1b2a5c", c2: "#5b7bd6", desc: "Disc edition, 825GB. Two DualSense controllers, HDMI and power cables. Used for six months, still under shop warranty until March." },
  { slug: "omega-seamaster", title: "Vintage Omega Seamaster 1968", cat: "watches", start: 25000, current: 41500, bids: 44, endsInH: 9, city: "Cairo", cond: "used", reserve: 38000, pics: 3, c1: "#3a2d12", c2: "#c9a24a", desc: "Automatic, 34mm steel case, original dial with even patina. Serviced last year, keeps good time. Strap is not original." },
  { slug: "leather-sofa", title: "Leather sofa, 3 seater, barely used", cat: "home", start: 1, current: 3200, bids: 12, endsInH: 26, city: "Cairo", cond: "like_new", open: true, pics: 2, c1: "#4a2f22", c2: "#b9825f", desc: "Genuine brown leather, 210cm wide. Moving abroad so it must go. Buyer collects from Maadi. Open to the highest bidder, no reserve." },
  { slug: "samsung-qled", title: 'Samsung 55" QLED 4K TV', cat: "electronics", start: 9000, current: 9000, bids: 0, endsInH: 30, city: "Mansoura", cond: "like_new", pics: 2, c1: "#101820", c2: "#3d5a80", desc: "2023 model, 4K 120Hz, smart apps. Remote and wall mount included. Screen is perfect." },
  { slug: "silver-coin-1938", title: "Egyptian 1 pound silver coin, 1938", cat: "collectibles", start: 800, current: 2350, bids: 19, endsInH: 48, city: "Cairo", cond: "used", pics: 2, c1: "#3d3d45", c2: "#b9bcc7", desc: "King Farouk era silver pound, good detail on both faces. Kept in a coin album since the 1970s." },
  { slug: "mountain-bike", title: 'Mountain bike, 27.5", Shimano gears', cat: "sports", start: 4000, current: 4750, bids: 7, endsInH: 70, city: "Giza", cond: "used", pics: 2, c1: "#1e4d2b", c2: "#6dbb7b", desc: "Aluminium frame, 21 speed, front suspension, disc brakes. New tires this month. Suits riders 170 to 185cm." },
  { slug: "khan-plates", title: "Set of 6 hand-painted Khan el-Khalili plates", cat: "collectibles", start: 1, current: 640, bids: 15, endsInH: 3.2, city: "Cairo", cond: "new", open: true, pics: 2, c1: "#0f4c5c", c2: "#e36414", desc: "Hand-painted ceramic, 22cm each, signed by the artist. Each plate is slightly different. Starting at EGP 1." },
  { slug: "macbook-air-m1", title: "MacBook Air M1, 8GB / 256GB", cat: "electronics", start: 24000, current: 27800, bids: 29, endsInH: 12, city: "Cairo", cond: "used", reserve: 26000, pics: 3, c1: "#2c3340", c2: "#9aa5b8", desc: "Space grey, 212 battery cycles, no dents. Charger included. Fresh macOS install, ready to set up." },
  { slug: "corolla-2015", title: "Toyota Corolla 2015, one owner", cat: "cars", start: 380000, current: 405000, bids: 9, endsInH: null, city: "Alexandria", cond: "used", reserve: 420000, pics: 3, c1: "#2a3b4a", c2: "#7fa1bf", desc: "Automatic, 98,000 km, full service history at the agency. Licence valid until 2027. Open-ended: the seller will close when happy with the bid." },
  { slug: "adidas-samba", title: "Adidas Samba OG, size 42", cat: "fashion", start: 2200, current: 2200, bids: 0, endsInH: 20, city: "Tanta", cond: "new", pics: 2, c1: "#22313f", c2: "#d7d3c8", desc: "Cloud white and black, brand new in box. Bought the wrong size." },
  { slug: "galaxy-s23", title: "Samsung Galaxy S23 Ultra 256GB", cat: "phones", start: 30000, current: 33500, bids: 14, endsInH: 16, city: "Giza", cond: "like_new", pics: 3, c1: "#2d1f3d", c2: "#8e6bbf", desc: "Phantom black, S Pen included. Screen protector since day one. Box and fast charger included." },
  { slug: "rolex-style-watch", title: "Seiko 5 automatic, blue dial", cat: "watches", start: 3000, current: 3900, bids: 11, endsInH: 7, city: "Cairo", cond: "like_new", pics: 2, c1: "#12304a", c2: "#4a90c2", desc: "Stainless steel bracelet, 100m water resistance, automatic movement. Worn a handful of times." },
  { slug: "vinyl-umm-kulthum", title: "Umm Kulthum vinyl collection, 8 records", cat: "collectibles", start: 1, current: 1850, bids: 26, endsInH: 36, city: "Cairo", cond: "used", open: true, pics: 2, c1: "#4a1f2d", c2: "#d17a8c", desc: "Eight Egyptian-pressed LPs from the 1960s and 70s. Sleeves show age, records play cleanly. Open to highest bidder." },
  { slug: "gaming-chair", title: "Ergonomic gaming chair, red and black", cat: "gaming", start: 2500, current: 3100, bids: 8, endsInH: 22, city: "Alexandria", cond: "used", pics: 2, c1: "#3d1414", c2: "#d65a5a", desc: "Adjustable arms, tilt lock and lumbar pillow. Eight months old, no tears." },
  { slug: "dining-table", title: "Solid wood dining table with 6 chairs", cat: "home", start: 6000, current: 7400, bids: 10, endsInH: 52, city: "Giza", cond: "used", pics: 3, c1: "#3b2a1a", c2: "#c19a6b", desc: "Beech wood, 180 x 90cm. Chairs have fabric seats in good condition. Buyer arranges pickup." },
  { slug: "road-bike-helmet-set", title: "Cycling set: helmet, lights, bike computer", cat: "sports", start: 1200, current: 1200, bids: 0, endsInH: 44, city: "Cairo", cond: "like_new", pics: 2, c1: "#14313d", c2: "#3fb0b8", desc: "Giro helmet size M, front and rear USB lights, GPS bike computer. Barely used." },
  { slug: "ipad-pro", title: 'iPad Pro 11" (2021) + Apple Pencil 2', cat: "phones", start: 20000, current: 22600, bids: 17, endsInH: 28, city: "Cairo", cond: "used", reserve: 21000, pics: 3, c1: "#202a36", c2: "#7c8da6", desc: "128GB Wi-Fi, space grey. Pencil 2 works perfectly. Includes folio case." },
  { slug: "polaroid-camera", title: "Polaroid OneStep+ instant camera", cat: "electronics", start: 1800, current: 2250, bids: 6, endsInH: 18, city: "Mansoura", cond: "like_new", pics: 2, c1: "#3a3a1f", c2: "#d8c85a", desc: "Bluetooth app control, rechargeable battery. Two unopened film packs included." },
];

// Icon paths (24x24 viewBox), copied from components/Icon.tsx
export const ICONS = {
  phones: "M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zm4 15h.01",
  electronics: "M7 7h10v10H7zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4",
  fashion: "M8 3l-5 3 2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 01-8 0z",
  home: "M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3M3 11a2 2 0 012 2v2h14v-2a2 2 0 012-2M6 15v3M18 15v3",
  cars: "M5 16l1.5-5a2 2 0 011.9-1.4h7.2a2 2 0 011.9 1.4L19 16M4 16h16v3H4zM7 19v1M17 19v1",
  collectibles: "M6 3h12l4 6-10 12L2 9zM2 9h20M12 3l-3 6 3 12 3-12-3-6",
  watches: "M9 3h6l1 4H8zM9 21h6l1-4H8zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2v3l2 1",
  gaming: "M6 8h12a4 4 0 014 4v2a3 3 0 01-5.2 2L15 14H9l-1.8 2A3 3 0 012 14v-2a4 4 0 014-4zM8 10v3M6.5 11.5h3M16 11h.01M18 13h.01",
  sports: "M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12",
  other: "M3 12V4h8l10 10-8 8zM7.5 8h.01",
};
