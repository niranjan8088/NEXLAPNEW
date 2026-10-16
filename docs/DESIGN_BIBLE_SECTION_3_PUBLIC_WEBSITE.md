# NEXLAPTECH
## Master UI/UX Design Bible & Enterprise Product Design Document (PDD)
### Section 3: Public Website Detailed UI/UX Specifications

***

## 1. Homepage (`/`)

### 1. Purpose
Primary digital storefront capturing high-intent hardware buyers, repair leads, corporate AMC inquiries, and training enrollments.

### 2. Business Goal
Drive conversion via instant CTA triggers (`Book Repair Service`, `Explore Products`, `Get AMC Quote`) and build immediate trust using real customer metrics.

### 3. User Goal
Quickly locate products or repair services, view transparent pricing, check company credentials, and submit a booking in under 60 seconds.

### 4. Navigation Entry
Root domain URL (`https://www.nexbyte.com/` or `https://nexbyte.com/`).

### 5. Breadcrumb
`Home`

### 6. Complete Layout
Vertical stack: Navbar -> Hero Section -> Metric Trust Strip -> Category Showcase -> Featured Products Grid -> Services Matrix -> Why Choose Us -> Testimonials Slider -> FAQ Accordion -> Footer.

### 7. Wireframe Blueprint
```
+------------------------------------------------------------------------+
| [NEXLAPTECH LOGO]   Products   Services   Training   Contact   [Book Now] |
+------------------------------------------------------------------------+
|                                                                        |
|    ENGINEERING TOMORROW'S TECHNOLOGY, TODAY.                          |
|    Bengaluru's Trusted Destination for Premium Computers & Repairs     |
|                                                                        |
|    [ Explore Products ]             [ Book Repair Service ]            |
|                                                                        |
+------------------------------------------------------------------------+
| 2,500+ Clients | 8,000+ Serviced | 6+ Years Trust | 100% Warranty      |
+------------------------------------------------------------------------+
```

### 8. High Fidelity UI Specification
Dark mode background (`#0B1120`) with cyan glowing gradients (`#00D8F6`), glassmorphic panels (`backdrop-filter: blur(16px)`), radial glowing radial lights, and crisp white typography.

### 9. Desktop Design (1440px+)
Max-width 1280px container, 4-column product grid, 3-column service cards, sticky top header navbar.

### 10. Laptop Design (1024px)
Max-width 960px container, 3-column product grid, 3-column service cards.

### 11. Tablet Design (768px)
2-column product grid, 2-column service cards, collapsible FAQ accordion.

### 12. Mobile Design (375px)
1-column stack, full-width CTA buttons, hamburger slide-over navigation drawer.

### 13. Component Hierarchy
`Navbar` -> `Hero` -> `TrustBadges` -> `Counter` -> `ProductShowcase` -> `Services` -> `WhyChooseUs` -> `Testimonials` -> `FAQ` -> `Footer`.

### 14. Color Palette
- Background: `#0B1120` / `#0E1626`
- Primary Accent: `#1E5EFF` (Royal Blue)
- Secondary Accent: `#00D8F6` (Neon Cyan)
- Text Primary: `#F8FAFC`
- Text Secondary: `#94A3B8`

### 15. Typography
- Headings: `Outfit`, sans-serif (Bold / SemiBold)
- Body text: `Inter`, sans-serif (Regular / Medium)

### 16. Spacing
Sections: `py-20 md:py-28`, Gaps: `gap-6` or `gap-8`.

### 17. Icons
Lucide React icons: `Laptop`, `Cpu`, `Wrench`, `ShieldCheck`, `Star`, `Phone`, `Mail`, `MapPin`, `Calendar`, `ChevronRight`.

### 18. Illustrations
Glassmorphic circuit trace overlays and neon cyan glowing geometric shapes.

### 19. Images
WebP optimized product photography (`product-gaming-desktops.png`, `product-second-hand-laptops.png`, `product-cctv-systems.png`).

### 20. Cards
Glassmorphic card containers (`bg-nex-ink/90 border border-white/10 rounded-2xl p-6 shadow-glow-blue`).

### 21. Buttons
- Primary: `bg-nex-blue text-white hover:bg-nex-blueLight shadow-glow-blue`
- Secondary: `bg-white/10 text-white hover:bg-white/20 border border-white/10`

### 22. Forms
Search input bar and quick booking fields inside `UnifiedBookingModal`.

### 23. Tables
N/A on Homepage.

### 24. Charts
Counter metrics animation for Clients (2,500+), Devices Serviced (8,000+), and Trust Years (6+).

### 25. Animations
Framer Motion `fadeIn`, `slideUp`, and GSAP scroll-triggered reveal animations.

### 26. Transitions
`transition-all duration-300 ease-in-out`.

### 27. Loading State
Skeleton shimmer cards during data fetching.

### 28. Empty State
N/A on Homepage.

### 29. Error State
Toast alert on network error.

### 30. Validation
Form field validation inside modal (Phone regex, Name minimum length).

### 31. Accessibility (a11y)
Keyboard tab navigation, high contrast ratio (4.5:1+), ARIA labels on interactive icons.

### 32. Responsive Behaviour
Fluid grid layouts adapting seamlessly from 1 column on mobile to 4 columns on ultra-wide screens.

### 33. Backend APIs Used
- `GET /api/products`
- `GET /api/reviews`

### 34. Database Tables Used
`products`, `services`, `reviews`, `stats`.

### 35. Realtime Events
Listens to `nexbyte-realtime` for dynamic stock and review updates.

### 36. Notifications
Audio chime and toast alert when new reviews or products are published.

### 37. Security
DOMPurify sanitization and CSP headers.

### 38. Performance Notes
Image optimization via Next.js `<Image />` component, 0.8s LCP.

### 39. SEO
Meta title: `NEXLAPTECH | Gaming PCs, Laptop Repairs & IT Services Bengaluru`
Meta description: `Bengaluru's trusted destination for custom gaming PCs, refurbished laptops, board-level repair, CCTV setup, and AMC maintenance.`

### 40. Future Improvements
Integrated AI Chatbot widget for instant instant quote estimation.

---

## 2. Products Page (`/products`)

### 1. Purpose
Interactive catalog allowing customers to explore hardware items, filter by category (`gaming_pcs`, `business_laptops`, `cctv`, etc.), compare specs, and click "Book Now".

### 2. Business Goal
Increase high-margin hardware sales and custom PC inquiries.

### 3. User Goal
Filter products by budget and category, inspect exact technical specifications, and book items directly.

### 4. Navigation Entry
Header navigation link -> `Products` or URL `/products`.

### 5. Breadcrumb
`Home` -> `Products`

### 6. Complete Layout
Sticky filter bar -> Search Input -> Category Pills -> 3-Column Product Grid -> Pagination -> Quick View Drawer -> Booking Modal.

### 7. Responsive Breakdown
- Desktop: 3-column product grid with category sidebar.
- Mobile: 1-column product grid with filter drawer.

### 8. Backend APIs & Database Tables Used
- `GET /api/products`
- Tables: `products`, `inventory`

---

## 3. Verify Certificate Page (`/verify`)

### 1. Purpose
Public verification lookup portal allowing students, employers, and clients to verify issued certificates using a Registration ID or QR code scan.

### 2. Business Goal
Enhance institutional credibility and eliminate fake certificate issuance.

### 3. User Goal
Enter a Registration ID (e.g. `NBT-TR-2026-001`) and instantly view the official verified certificate record, issue date, and grade.

### 4. Navigation Entry
Footer link -> `Verify Certificate` or URL `/verify`.

### 5. Breadcrumb
`Home` -> `Verify Certificate`

### 6. Backend APIs & Database Tables Used
- `GET /api/certificates`
- Tables: `certificates`

---

## 4. Track Request Page (`/track`)

### 1. Purpose
Real-time tracking portal allowing customers to enter their Reference ID (`NB-2026-XXXXXX`) and phone number to inspect status timeline steps and chat with support.

### 2. Business Goal
Reduce support call volume by providing instant self-service status tracking.

### 3. User Goal
Track repair/order progress (`Submitted` -> `Contacted` -> `In Service` -> `Completed`) and send messages to NexLapTech technicians.

### 4. Navigation Entry
Header link -> `Track Request` or URL `/track`.

### 5. Breadcrumb
`Home` -> `Track Request`

### 6. Backend APIs & Database Tables Used
- `GET /api/bookings?phone=...&bookingId=...`
- `GET /api/track`
- Tables: `bookings`, `messages`
