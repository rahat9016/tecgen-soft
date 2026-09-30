# Tecgen Soft — Website & Demo Apps

One Next.js 16 project that hosts the Tecgen Soft agency website plus several demo apps.
Each app lives under its own URL prefix, with its own layout, header and footer.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server using `.env` |
| `npm run dev:sqa` / `dev:uat` / `dev:prod` | Dev server with that environment file |
| `npm run build` (`build:sqa` / `build:uat` / `build:prod`) | Production build (`output: "standalone"`) |
| `npm start` | Serve the production build |
| `npm run lint` / `npm run format` | ESLint / Prettier |

Environment variables (see `.env*`): `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_BASE_URL`,
`NEXT_PUBLIC_APPOINTMENT_URL`, `NEXT_PUBLIC_REPORT_URL`.

## Which route opens which app

| URL prefix | App | Data source | Code |
| --- | --- | --- | --- |
| `/` | **Agency website** (Tecgen Soft) | Static content | `src/app/page.tsx`, `src/components/agency` |
| `/solutions/[slug]`, `/work/[slug]` | Agency — solution & portfolio pages | `src/lib/solutions.ts`, `src/lib/projects.ts` | `src/app/solutions`, `src/app/work` |
| `/gadgets` | **Gadget store** (gadgethub) — customer shop | Browser localStorage (demo) | `src/app/(gadgets)/gadgets/(store)`, `src/components/gadgets` |
| `/gadgets/admin` | **Gadget store admin panel** | Browser localStorage (demo) | `src/app/(gadgets)/gadgets/admin`, `src/components/gadgets/admin` |
| `/ecommerce` | **Fashion e-commerce demo** (FitStore) | Static data + Redux cart | `src/app/(ecommerce)`, `src/components/store` |
| `/hotel-management` | **Hotel booking demo** | Static data | `src/app/(hotel-management)`, `src/components/hotel` |
| `/admin` | **Hospital admin dashboard** (login required) | Backend API (`NEXT_PUBLIC_API_BASE_URL`) | `src/app/admin` |
| `/auth/login`, `/auth/signup` | Login / sign-up for `/admin` | Backend API | `src/app/auth` |

Folders in brackets like `(gadgets)` are Next.js route groups: they organise code and layouts but
don't appear in the URL. `src/app/_hospital-backup` is a private folder (underscore prefix) and is
**not** routed.

## Agency website

| Route | Page |
| --- | --- |
| `/` | Home: hero, portfolio, solutions, process, about, testimonials, FAQ, contact |
| `/solutions/ecommerce` · `/solutions/hotel-booking` · `/solutions/business-website` · `/solutions/restaurant` | Solution detail pages |
| `/work/ecommerce-demo` · `/work/hotel-booking-demo` | Portfolio case studies (link to the live demos) |

## Gadget store — customer side (`/gadgets`)

| Route | Page |
| --- | --- |
| `/gadgets` | Home: hero banners, categories, pre-order / deals / brand product rows |
| `/gadgets/shop` | Product listing with filters. Query params: `category` (comma list), `brand`, `stock=in\|pre`, `sort=discount\|price-asc\|price-desc\|new` |
| `/gadgets/product/[slug]` | Product details: variants, EMI plans, specs, pre-order info |
| `/gadgets/pre-order` | Upcoming products open for pre-order |
| `/gadgets/cart` | Cart |
| `/gadgets/checkout` | Checkout. `?buy=<slug>&qty=&variant=` = Buy Now / pre-order for a single product |
| `/gadgets/track-order` | Track an order by order number + phone |
| `/gadgets/account` | Profile & delivery address |
| `/gadgets/account/orders` | Order history |
| `/gadgets/account/orders/[id]` | Order details with tracking timeline (`?placed=1` shows the success banner) |
| `/gadgets/account/pre-orders` | Customer's pre-orders |
| `/gadgets/account/wishlist` | Wishlist |
| `/gadgets/account/messages` | Chat with support (also available as a floating widget on every store page) |

## Gadget store — admin panel (`/gadgets/admin`)

| Route | Page |
| --- | --- |
| `/gadgets/admin` | Dashboard: sales, profit, daily sales chart, low stock, pending work |
| `/gadgets/admin/orders` | Online orders (`?status=pending` etc.) |
| `/gadgets/admin/orders/new` | Create an order for a customer (`?type=preorder` for a pre-order, `?c=<customerId>` to preselect the customer) |
| `/gadgets/admin/orders/[id]` | Order details: status workflow, record payment, print invoice |
| `/gadgets/admin/pre-orders` | Pre-orders + reservations per upcoming product |
| `/gadgets/admin/chat` | Customer chat inbox (`?c=<customerId>` opens a conversation) |
| `/gadgets/admin/cash-memo` | Counter sales list |
| `/gadgets/admin/cash-memo/new` | New cash memo (counter sale) |
| `/gadgets/admin/cash-memo/[id]` | Printable cash memo, collect due (`?print=1` opens the print dialog) |
| `/gadgets/admin/accounts` | Profit & loss, cash flow, receivables, expenses, CSV export |
| `/gadgets/admin/products` | Product list (`?stock=low` shows low stock) |
| `/gadgets/admin/products/new` · `/gadgets/admin/products/[id]` | Add / edit product (image upload, pricing, stock, variants, specs, pre-order) |
| `/gadgets/admin/categories` | Categories |
| `/gadgets/admin/brands` | Brands |
| `/gadgets/admin/customers` | Customers (shortcuts to create an order or pre-order, or open chat) |

**How the gadget store stores data:** there is no backend. The storefront and admin share one
client-side store (`src/lib/gadget-store`) saved in the browser's localStorage under
`gadgethub:db`, seeded with sample products, orders, memos, expenses and chats. So:

- Data is per browser: other people or devices don't see your changes.
- Store ⇄ admin updates (including chat) sync live between tabs of the **same** browser.
- "Reset demo data" in the admin sidebar restores the sample data.
- Changing `DB_VERSION` in `src/lib/gadget-store/seed.ts` resets everyone's demo data on next load.
- `/gadgets/admin` has **no login** — it's a demo.

## Fashion e-commerce demo (`/ecommerce`)

| Route | Page |
| --- | --- |
| `/ecommerce` | Storefront home |
| `/ecommerce/product/[slug]` | Product details |
| `/ecommerce/cart` | Cart |
| `/ecommerce/checkout` | Checkout |
| `/ecommerce/order-success` | Order confirmation |

## Hotel booking demo (`/hotel-management`)

| Route | Page |
| --- | --- |
| `/hotel-management` | Home |
| `/hotel-management/search` | Search results |
| `/hotel-management/hotel/[slug]` | Hotel details |
| `/hotel-management/hotel/[slug]/book` | Booking form |
| `/hotel-management/booking-success` | Booking confirmation |
| `/hotel-management/my-bookings` | Booking history |

## Hospital admin (`/admin`)

Protected by `src/proxy.ts`: visitors without an `accessToken` cookie are sent to `/auth/login`,
and non-admin roles are sent to `/`. Logged-in users who open `/auth/*` are redirected to `/admin`
(admins) or `/` (everyone else).

| Area | Routes |
| --- | --- |
| Dashboard | `/admin` |
| Appointments | `/admin/all-appointments`, `/admin/onsite-appointment`, `/admin/tele-online-appointment` |
| Doctors & departments | `/admin/doctors`, `/admin/doctors/add-update-doctor/[id]`, `/admin/departments` |
| Specialties | `/admin/specialties`, `/admin/add-speciality`, `/admin/update-specialties/[id]`, `/admin/specialties-darft` |
| Health packages | `/admin/health-packages`, `/admin/add-health-package`, `/admin/health-package-update/[id]` |
| Membership | `/admin/general-membership`, `/admin/corporate-membership` (+ `/[id]`), `/admin/add-general-membership`, `/admin/add-corporate-membership`, `/admin/packages`, `/admin/add-package` |
| Corporate | `/admin/corporate`, `/admin/corporate/add-corporate-services`, `/admin/corporate/update-corporate-services/[id]` |
| Careers | `/admin/job-list`, `/admin/add-job`, `/admin/update-career/[id]`, `/admin/applicant-list` |
| Blogs | `/admin/blogs`, `/admin/add-blog`, `/admin/blog/[id]` |
| Media | `/admin/image-gallery`, `/admin/video-gallery`, `/admin/add-media-image`, `/admin/add-media-video`, `/admin/update-media-image/[id]`, `/admin/update-media-video/[id]` |
| Site content | `/admin/hero-management`, `/admin/contact-info`, `/admin/contact-support-list` |

Next.js API routes used by these pages live under `src/app/api/*`.
