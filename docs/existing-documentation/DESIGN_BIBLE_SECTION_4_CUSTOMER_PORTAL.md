# NEXLAPTECH
## Master UI/UX Design Bible & Enterprise Product Design Document (PDD)
### Section 4: Customer Portal UI/UX Specifications

***

## 1. Customer Dashboard (`/customer`)

### 1. Purpose
Personal customer portal allowing registered customers to manage active hardware bookings, repair status, certificate downloads, and live messages.

### 2. Business Goal
Provide a centralized portal that drives repeat business, service loyalty, and easy certificate access.

### 3. User Goal
View all submitted bookings, inspect live step progress, message support, and download official certificates.

### 4. Navigation Entry
Header link -> `Customer Login` / `My Account` or URL `/customer`.

### 5. Breadcrumb
`Home` -> `Customer Portal` -> `Dashboard`

### 6. Sidebar Navigation
- Overview (`/customer`)
- My Bookings (`/customer#bookings`)
- Training & Internships (`/customer#training`)
- Certificates (`/customer#certificates`)
- Support & Live Chat (`/customer#support`)
- Profile & Settings (`/customer#profile`)

### 7. Core UI Components & Widgets
- **Active Booking Summary Card:** Displays active Reference ID (`NB-2026-XXXXXX`), product/service name, current status badge, and timeline progress bar.
- **Certificate Downloads Grid:** Renders issued training and internship certificates with a 1-click **Download PDF** button.
- **Support Chat Box:** Embedded 2-way live chat drawer linked to NexLapTech Support Desk.

### 8. Backend APIs & Database Tables Used
- `GET /api/bookings`
- `GET /api/certificates`
- Tables: `users`, `bookings`, `certificates`, `notifications`
