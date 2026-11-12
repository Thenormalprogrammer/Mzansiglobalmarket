# MzansiGlobalMarket - B2B Marketplace Platform

## Project Overview
A comprehensive B2B marketplace platform similar to Alibaba/Made-in-China built with Node.js, Express, React, and PostgreSQL. Supports dual user systems (suppliers/buyers), product catalogs, RFQ management, and real-time messaging.

## Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI components, Wouter routing, TanStack Query
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: JWT with bcrypt password hashing
- **File Uploads**: Multer with strict MIME filtering

## Current Status - MVP Complete
✅ Backend fully implemented with all core APIs
✅ Database schema with proper relationships
✅ JWT authentication system
✅ Image upload with file validation
✅ RFQ public marketplace with buyer anonymity
✅ Frontend structure with all pages
✅ Authentication flow (login/register)
✅ Supplier verification system with document uploads
✅ Admin verification panel for approving suppliers
✅ Multi-channel contact options (Email/WhatsApp/Website)
✅ Email notifications for new messages
✅ WordPress-style Admin CMS for managing website content
✅ FAQ management with ordering and categories
✅ Admin-only access control (Admin link hidden from regular users)
✅ Site settings for managing homepage images (hero, categories)
✅ Product moderation system (admin can restrict inappropriate products)
✅ Mobile-responsive design with drawer navigation
✅ Hierarchical category management with parent-child relationships
✅ Email verification system (6-digit codes with 15-minute expiry)
✅ Product view tracking for trending products
✅ Browsing history for authenticated users
✅ Trending products section on homepage
✅ Related products recommendations (collaborative filtering)
✅ My Account page with profile management
✅ Customs calculator tool for import duties
✅ Shipping quote request system
✅ Regional notice for non-South African users
✅ Forgot password feature with email reset codes
✅ Product upload fix with proper JWT authentication

## Architecture

### Backend Structure
- `server/routes.ts` - All API endpoints
- `server/auth.ts` - JWT and password hashing utilities
- `server/storage.ts` - Data access layer
- `server/db.ts` - Database initialization
- `shared/schema.ts` - Drizzle ORM schemas + Zod validation

### Frontend Structure
- `client/src/pages/` - Page components (Home, ProductCatalog, SupplierDirectory, SubmitRFQ, Login, Register)
- `client/src/components/` - Reusable UI components
- `client/src/hooks/useAuth` - Authentication hook
- `client/src/lib/authService` - API calls for auth
- `client/src/lib/queryClient` - TanStack Query configuration

## Database Schema
- **users**: Email-based authentication with userType (supplier/buyer)
- **suppliers**: Company profiles with verification status, ratings
- **products**: Product listings with images and pricing
- **rfqs**: Request for Quotations with specifications
- **messages**: Buyer-supplier communication

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset code
- `POST /api/auth/reset-password` - Reset password with code

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (supplier only)
- `PATCH /api/products/:id` - Update product with validation
- `DELETE /api/products/:id` - Delete product

### Suppliers
- `GET /api/suppliers` - List all suppliers
- `GET /api/suppliers/:id` - Get supplier details
- `POST /api/suppliers` - Create supplier profile
- `PATCH /api/suppliers/:id` - Update profile
- `POST /api/suppliers/:id/verify` - Admin verify/reject supplier
- `POST /api/suppliers/:id/documents` - Upload verification documents

### RFQs
- `GET /api/rfqs` - List RFQs (public for suppliers with buyer anonymity)
- `GET /api/rfqs/:id` - Get RFQ details
- `POST /api/rfqs` - Submit RFQ (buyers)
- `PATCH /api/rfqs/:id/status` - Update RFQ status

### Messages
- `GET /api/messages` - Get user conversations
- `POST /api/messages` - Send message
- `PATCH /api/messages/:id/read` - Mark as read

### CMS Pages (Admin)
- `GET /api/cms/:slug` - Public: Get page content by slug
- `GET /api/admin/cms` - Admin: List all CMS pages
- `POST /api/admin/cms` - Admin: Create new page
- `PATCH /api/admin/cms/:slug` - Admin: Update page
- `DELETE /api/admin/cms/:slug` - Admin: Delete page

### FAQ Management (Admin)
- `GET /api/faq` - Public: Get published FAQs
- `GET /api/admin/faq` - Admin: List all FAQs (including drafts)
- `POST /api/admin/faq` - Admin: Create FAQ
- `PATCH /api/admin/faq/:id` - Admin: Update FAQ
- `DELETE /api/admin/faq/:id` - Admin: Delete FAQ

### Site Settings (Admin)
- `GET /api/admin/settings` - Admin: Get all site settings
- `GET /api/admin/settings/:key` - Admin: Get specific setting
- `PUT /api/admin/settings/:key` - Admin: Update setting value
- `POST /api/admin/settings/upload` - Admin: Upload setting image

### Product Moderation (Admin)
- `GET /api/admin/products` - Admin: List all products with moderation info
- `GET /api/admin/products/restricted` - Admin: List restricted products only
- `POST /api/admin/products/:id/restrict` - Admin: Restrict a product
- `POST /api/admin/products/:id/unrestrict` - Admin: Unrestrict a product

### Category Management (Admin)
- `GET /api/categories` - Public: Get active categories (hierarchical)
- `GET /api/admin/categories` - Admin: Get all categories
- `POST /api/admin/categories` - Admin: Create category
- `PATCH /api/admin/categories/:id` - Admin: Update category
- `DELETE /api/admin/categories/:id` - Admin: Delete category (protected if has subcategories)

### Product Analytics & Recommendations
- `GET /api/products/trending` - Get trending products (by views in last 7 days)
- `POST /api/products/:id/view` - Track product view (anonymous or authenticated)
- `GET /api/products/:id/related` - Get related products (collaborative filtering)
- `GET /api/user/browsing-history` - Get user's browsing history (authenticated)

### Shipping & Customs
- `GET /api/shipping/services` - Get active shipping services
- `POST /api/shipping/quote-request` - Request shipping quote (authenticated)
- `GET /api/shipping/my-quotes` - Get user's shipping quote requests
- `GET /api/customs/calculate` - Calculate customs duties (query params: value, hsCode, weight)
- `GET /api/customs/tariffs` - Get all customs tariffs

### Email Verification
- `POST /api/auth/send-verification` - Send verification code
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-verification` - Resend verification code

### User Profile
- `PATCH /api/user/profile` - Update user profile (name, contact details)

## Security Features
✅ JWT token-based authentication
✅ Bcrypt password hashing
✅ Ownership verification on updates/deletes
✅ File MIME type validation (no SVG uploads)
✅ Zod schema validation for all inputs
✅ updateProductSchema prevents supplierId changes
✅ RFQ buyer anonymity in marketplace listings
✅ Read status modification restricted to receiver only
✅ Supplier verification blocks product uploads until approved

## Supplier Verification System
New suppliers must complete verification before listing products:

1. **Required Documents** (4 uploads):
   - Business Registration Certificate
   - Tax Compliance Certificate
   - Proof of Residence
   - Bank Account Confirmation

2. **Verification Status Flow**:
   - `pending` → Initial state, no documents uploaded
   - `submitted` → Documents uploaded, awaiting admin review
   - `verified` → Admin approved, can list products
   - `rejected` → Admin rejected, must resubmit documents

3. **Product Upload Protection**:
   - Frontend: Form disabled with CTA overlay for unverified suppliers
   - Backend: POST /api/products returns 403 for unverified suppliers
   - Checks both isVerified boolean AND verificationStatus for consistency

4. **Admin Dashboard** (/admin):
   - View pending verification requests
   - Approve or reject with optional notes
   - See all document badges for uploaded files

## Content Management System (CMS)
Admin users can manage website content through a WordPress-style CMS:

1. **Page Types**:
   - Terms & Conditions (/terms)
   - Privacy Policy (/privacy)
   - About Us (/about)
   - Custom pages (/page/:slug)

2. **FAQ Management**:
   - Create/Edit/Delete FAQ items
   - Category support
   - Sort order control (move up/down)
   - Draft/Published status

3. **SEO Settings**:
   - Meta title for search engines
   - Meta description for search results
   - Publish/unpublish pages

4. **Admin Access**:
   - Access /admin for dashboard
   - Access /admin/cms for content management
   - Requires email containing "admin" OR userType === "admin"

## Marketplace Model
### Public B2B Marketplace (Current MVP)
- Suppliers can see all RFQ specifications to prepare quotes
- Buyer identity is protected (anonymized)
- Product specs, quantity, pricing visible to all suppliers
- Standard Alibaba/Made-in-China model

### Future Enhancement Options
1. **Private/Invitation-only**: Restrict RFQ visibility to selected suppliers
2. **Teaser Model**: Show limited specs first, full details after interest shown
3. **Paid Access**: Premium suppliers access more RFQ details
4. **Visibility Controls**: Buyers choose visibility level per RFQ

## Deployment
- Frontend builds to `client/dist`
- Backend serves frontend from `public` directory
- Express static file serving with fallback to index.html for SPA routing
- Upload directories auto-created on startup

## Environment Variables
Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWT tokens

Optional (auto-created):
- `SESSION_SECRET` - Session management (auto-generated)

## Development Workflow
1. Backend auto-restarts on code changes
2. Frontend hot-reloads via Vite
3. All changes automatically synced to database via Drizzle migrations
4. Uploads stored in `uploads/products/` directory
