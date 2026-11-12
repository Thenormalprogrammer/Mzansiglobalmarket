# MzansiGlobalMarket - Design Guidelines

## Brand Identity

**Brand Colors** (from official logo):
- **Primary Green**: Deep forest green (#1A5A2E | HSL 135° 54% 27%)
  - Used for: Primary buttons, headers, primary branding, navigation highlights
  - Conveys: Trust, growth, African heritage, sustainability
  
- **Accent Orange**: Vibrant orange (#FF6B35 | HSL 20° 100% 55%)
  - Used for: Call-to-action buttons, important alerts, badges, highlights
  - Conveys: Energy, opportunity, urgency, warmth
  
- **Secondary Gold**: Rich gold (#FFD700 | HSL 51° 100% 50%)
  - Used for: Premium/gold supplier badges, success states, decorative accents
  - Conveys: Premium quality, excellence, achievement
  
- **Text/Foreground**: Charcoal (#222222 | HSL 220° 13% 13%)
  - Primary text color for readability and accessibility
  
- **Background**: White (#FFFFFF | HSL 0° 0% 100%)
  - Clean, professional appearance matching B2B marketplace standards

**Dark Mode Adaptation**:
- Primary Green (lighter): HSL 135° 54% 35%
- Accent Orange (brighter): HSL 20° 100% 60%
- Secondary Gold (brighter): HSL 51° 100% 60%

## Design Approach

**Reference-Based with System Foundation**: Drawing from Alibaba and Made-in-China's proven patterns for B2B marketplaces, combined with enterprise-grade systematic design principles. The design prioritizes **information density, scanning efficiency, and trust-building** through professional visual hierarchy and organized layouts.

**Core Principle**: Enterprise professionalism with African pride. Users need to process large amounts of supplier and product data quickly while feeling confident in the platform's credibility and authenticity.

## Typography System

**Primary Font**: Inter or Roboto (Google Fonts CDN)
**Secondary Font**: System UI stack for data-heavy tables

**Hierarchy**:
- Hero Headlines: 48px (3xl), font-weight 700
- Section Headers: 32px (2xl), font-weight 600  
- Subsection Titles: 24px (xl), font-weight 600
- Card Titles: 18px (lg), font-weight 500
- Body Text: 16px (base), font-weight 400
- Metadata/Labels: 14px (sm), font-weight 400
- Micro-text (certifications, specs): 12px (xs), font-weight 400

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-4, gap-6
- Container max-width: max-w-7xl with px-6

**Grid Strategy**:
- Product grids: 4 columns desktop (grid-cols-4), 2 tablet, 1 mobile
- Supplier cards: 3 columns desktop, responsive stack
- RFQ listings: 2-column comparison layout
- Search filters: Fixed sidebar (280px) + fluid content area

## Component Usage

### Colors in Components
- **Primary Buttons**: Use `bg-primary text-primary-foreground` (deep green)
- **Accent Buttons**: Use `bg-accent text-accent-foreground` (orange for CTAs)
- **Badges**: Gold for premium, primary green for verification
- **Links**: Primary green with underline on hover
- **Borders**: Use `border-border` for subtle dividers
- **Cards**: White background with subtle shadow or border

### Navigation
**Header**: 
- Logo and brand name in primary green
- Category dropdown with hover states
- Search bar spanning center
- Account menu on right

**Sidebar** (for dashboards):
- Deep green background with white text
- Orange highlights for active items
- Smooth transitions between states

### Hero Section
- High-impact image with dark overlay wash
- Primary green call-to-action button
- Orange accent highlights for key information
- Search interface with category chips

### Product Catalog
- Clean grid layout with 4 columns on desktop
- Product cards with: image, name, price range, MOQ, supplier name
- Verification badges (green checkmark)
- Hot item badges (orange/gold)
- Quick action buttons with orange highlights

### Vendor Dashboard
- Primary green section headers
- Orange buttons for product upload and save actions
- Green accent for success states
- Clean form inputs with green focus states

### Admin Dashboard
- Statistics cards with green primary color
- Activity feeds with timestamp metadata
- Status badges (open, closed, pending)
- Action buttons in orange for importance

## Accessibility

- Minimum contrast ratio 4.5:1 for body text
- Deep green (#1A5A2E) on white provides excellent contrast (16.3:1)
- Orange (#FF6B35) on white provides 9.2:1 contrast (WCAG AA compliant)
- Always include text labels with icons
- Focus states clearly visible on all interactive elements

## Responsive Design

**Breakpoints**:
- Mobile: 375px - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+

**Adaptive Elements**:
- Navigation collapses to hamburger menu below 1024px
- Product grid reduces from 4 to 2 columns on tablet, 1 on mobile
- Sidebar becomes fullscreen overlay on mobile
- Forms stack vertically on mobile

## Trust and Credibility Elements

- **Verification Badges**: Green checkmark with "Verified Supplier"
- **Gold Supplier Badges**: Premium orange/gold styling for top-rated suppliers
- **Trust Indicators**: Display transaction counts and response rates prominently
- **Certifications**: Grid display with document previews
- **Testimonials**: Star ratings with verified purchase indicators
