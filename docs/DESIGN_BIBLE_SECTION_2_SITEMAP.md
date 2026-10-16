# NEX LAPTECH
## Master UI/UX Design Bible & Enterprise Product Design Document (PDD)
### Section 2: Complete Site Map & Navigation Tree Architecture

***

## 1. Master Navigation Hierarchy

```
NEX LAPTECH ENTERPRISE PLATFORM
│
├── 1. PUBLIC WEBSITE (www.nexbyte.com)
│   ├── Homepage (/)
│   ├── Products Catalog (/products)
│   │   ├── Gaming PCs (/products?category=gaming_pcs)
│   │   ├── Business Laptops (/products?category=business_laptops)
│   │   ├── Premium Used Laptops (/products?category=second_hand_laptops)
│   │   ├── Desktop Systems (/products?category=desktop_systems)
│   │   ├── Computer Accessories (/products?category=accessories)
│   │   └── CCTV Surveillance (/products?category=cctv)
│   ├── Services Directory (/services)
│   │   ├── Laptop & Board Repair (/services#laptop-repair)
│   │   ├── Desktop Diagnostic (/services#desktop-repair)
│   │   ├── Annual Maintenance Contracts (/services#amc)
│   │   └── WiFi & Networking Setup (/services#networking)
│   ├── Training & Academy (/training)
│   ├── Internship Programs (/internship)
│   ├── Company Profile & About Us (/about)
│   ├── Contact Us & Branch Directory (/contact)
│   ├── Customer Reviews & Feedback (/reviews)
│   ├── Gallery & Projects Showcase (/feedback)
│   ├── Verify Certificate Portal (/verify)
│   └── Track Request & Live Status (/track)
│
├── 2. CUSTOMER PORTAL (/customer)
│   ├── Customer Login (/customer/login)
│   ├── Customer Dashboard (/customer)
│   ├── My Bookings & Orders (/customer#bookings)
│   ├── Live Support Chat & Timeline (/track)
│   ├── Certificate Downloads (/customer#certificates)
│   └── Profile & Preferences (/customer#profile)
│
└── 3. ADMIN CONSOLE (/admin)
    ├── Admin Login (/admin/login)
    ├── Overview Dashboard (/admin/dashboard)
    ├── Bookings Kanban Board (/admin/bookings)
    ├── Products & Catalog Manager (/admin/products)
    ├── IT Services Manager (/admin/services)
    ├── Reviews Moderation Feed (/admin/reviews)
    ├── Customers Directory (/admin/customers)
    ├── Internship Applications (/admin/internships)
    ├── Training Enrollments (/admin/training)
    ├── Contact & Enquiry Logs (/admin/contacts)
    ├── Laptop Enquiry Logs (/admin/laptop-enquiries)
    ├── Inventory & Low Stock Alerts (/admin/inventory)
    ├── Analytics & Revenue Charts (/admin/analytics)
    ├── System Reports & CSV Export (/admin/reports)
    ├── Realtime Notifications (/admin/notifications)
    ├── Storefront Gallery Manager (/admin/gallery)
    ├── Certificates & QR Manager (/admin/certificates)
    ├── QR Code Generator (/admin/qr-generator)
    ├── Admin Users & Permissions (/admin/users)
    ├── Branch Office Settings (/admin/branches)
    ├── Website CMS Editor (/admin/website-cms)
    └── System Settings (/admin/settings)
```

***

## 2. Page Navigation Routing Tree

| Route Path | Page Name | Access Level | Primary Purpose |
| :--- | :--- | :--- | :--- |
| `/` | Homepage | Public | Brand storefront, lead generation, quick service CTA |
| `/products` | Products Catalog | Public | Hardware store with category filter and search |
| `/services` | IT Services | Public | Comprehensive service menu and AMC booking |
| `/training` | Tech Training | Public | Student course listings and enrollment modal |
| `/internship` | IEEE Internships | Public | Domain selection and internship applications |
| `/about` | About Us | Public | Company history, team, and branch directory |
| `/contact` | Contact Us | Public | Branch maps, WhatsApp CTA, and contact form |
| `/reviews` | Customer Reviews | Public | Star ratings, customer quotes, and submit review |
| `/verify` | Verify Certificate | Public | QR code verification lookup portal |
| `/track` | Track Booking | Public / Customer | Ref ID lookup, status timeline, and 2-way chat |
| `/customer` | Customer Portal | Customer Auth | Personal dashboard, bookings, and certificates |
| `/admin/login` | Admin Login | Public | Administrator login authentication |
| `/admin/*` | Admin Console | Admin Auth | 21 Admin management modules |
