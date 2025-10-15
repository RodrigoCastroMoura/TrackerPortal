# Design Guidelines: Vehicle Tracking Portal

## Design Approach

**Selected Framework:** Material Design 3 (Adapted)
**Rationale:** Enterprise fleet management application requiring robust data display patterns, clear hierarchy for role-based interfaces, and trusted professional appearance for security-sensitive operations.

---

## Core Design Principles

1. **Data Clarity First** - Information hierarchy prioritizes quick scanning and decision-making
2. **Role-Based Visual Separation** - Clear visual distinction between Admin and Technical Assistant interfaces
3. **Trust & Security** - Professional aesthetic that reinforces system reliability and data security
4. **Operational Efficiency** - Minimal cognitive load for repetitive tasks (customer/vehicle registration)

---

## Color Palette

### Dark Mode (Primary)
**Brand & Primary Colors:**
- Primary: `215 90% 50%` (Trust blue - professional tracking/logistics)
- Primary Variant: `215 80% 40%` (Darker blue for hierarchy)
- Background: `220 20% 12%` (Deep slate - reduces eye strain)
- Surface: `220 15% 16%` (Elevated cards/panels)
- Surface Variant: `220 12% 20%` (Modals, dropdowns)

**Functional Colors:**
- Success: `145 70% 45%` (Vehicle active/connected)
- Warning: `35 95% 55%` (Pending actions, alerts)
- Error: `5 80% 55%` (Vehicle blocked, critical issues)
- Info: `200 90% 50%` (Neutral information states)

**Text Colors:**
- Primary Text: `220 10% 95%`
- Secondary Text: `220 8% 70%`
- Disabled: `220 5% 50%`

### Light Mode (Secondary)
- Background: `220 20% 98%`
- Surface: `0 0% 100%`
- Primary: `215 85% 45%`
- Text Primary: `220 20% 15%`

---

## Typography

**Font Stack:** Inter (via Google Fonts) for optimal readability in data-dense interfaces

**Scale & Hierarchy:**
- **H1 - Dashboard Titles:** 32px / 2rem, font-weight: 700, letter-spacing: -0.5px
- **H2 - Section Headers:** 24px / 1.5rem, font-weight: 600
- **H3 - Card Titles:** 18px / 1.125rem, font-weight: 600
- **Body - Data/Forms:** 14px / 0.875rem, font-weight: 400, line-height: 1.5
- **Small - Labels/Meta:** 12px / 0.75rem, font-weight: 500
- **Mono - IDs/Plates:** JetBrains Mono 14px for vehicle plates, CPF, tracking IDs

---

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, gap-6, mb-8)

**Container Strategy:**
- **Dashboard Grid:** 12-column responsive grid, gap-6
- **Side Navigation:** Fixed 280px width (desktop), collapsible to 64px icons
- **Main Content:** max-w-screen-2xl with px-6 py-8
- **Cards/Panels:** Consistent p-6 padding, rounded-lg borders
- **Forms:** Two-column layout on desktop (grid-cols-2 gap-4), single column mobile

**Breakpoints:**
- Mobile: < 640px (single column, bottom nav)
- Tablet: 640px - 1024px (2-column forms, side nav visible)
- Desktop: > 1024px (full multi-column layouts)

---

## Component Library

### Navigation
**Top Bar (Admin/Tech Assistant):**
- Height: 64px, dark surface with slight border-b
- Left: Logo + breadcrumb navigation
- Right: User profile dropdown, notification bell (with badge), quick settings
- Role indicator badge (Admin/Técnico) next to username

**Side Navigation:**
- Collapsible sidebar with icon + label
- Active state: Primary color background with subtle glow
- Sections: Dashboard, Clientes, Veículos, Rastreadores (Admin: + Usuários, Permissões)

### Dashboard Cards
**Stat Cards (4-column grid desktop, 2 mobile):**
- Elevated surface with border
- Icon (32px) in primary/success/warning color
- Large number (28px bold) + label (12px)
- Trend indicator (arrow + percentage) in corner
- Min-height: 140px for consistency

**Chart Components:**
- Line charts for temporal data (day/month/year trends)
- Bar charts for user comparisons
- Use primary color gradients (opacity 80% to 20%)
- Dark grid lines (opacity 10%)

### Data Tables
**Customer/Vehicle Lists:**
- Zebra striping: even rows with surface-variant
- Header: Fixed, bold, uppercase 11px text, surface background
- Row height: 56px for comfortable touch targets
- Hover state: Subtle primary color tint (opacity 5%)
- Action buttons: Icon-only (24px) aligned right
- Pagination: Bottom-center, items per page selector

### Forms
**Customer/Vehicle Registration:**
- Grouped sections with h3 headers + divider
- Input fields: Dark surface-variant background, border on focus (primary color)
- Labels: Above inputs, 12px medium weight
- Required indicator: Red asterisk
- Inline validation: Real-time with icon + message below field
- Action buttons: Primary (Salvar) + Ghost (Cancelar) at bottom-right

### Map Interface (Vehicle Tracking)
**Real-time Tracking Screen:**
- Full-width map container (min-height: 600px)
- Vehicle markers: Color-coded (green=active, red=blocked, yellow=idle)
- Side panel (360px): Vehicle list with live status
- Bottom sheet (mobile): Draggable vehicle details
- Lock/Unlock controls: Large icon buttons with confirmation modal

### Testing Interface
**Tracker Testing Screen:**
- Command palette: Dark surface card with monospace input
- Real-time response log: Scrollable terminal-style output (Mono font, green text on dark)
- Status indicators: Large LED-style dots (connected/testing/error states)
- Quick action grid: 6 common test commands as button tiles

---

## Micro-interactions & Animation

**Minimal & Purposeful Only:**
- Loading states: Skeleton screens (not spinners) for tables/cards
- Button clicks: 100ms scale(0.98) feedback
- Modal entry: 200ms fade + subtle scale from center
- Page transitions: 150ms opacity fade (no sliding)
- Data updates: Highlight changed row with 2s fade (primary color 10% opacity)

**NO:**
- Hover animations on cards/tiles
- Parallax effects
- Complex transitions between views

---

## Accessibility & Dark Mode

- WCAG AA contrast ratios enforced (4.5:1 text, 3:1 UI)
- Focus states: 2px primary color outline with 4px offset
- All interactive elements min 44px touch target
- Dark mode is PRIMARY - optimized for long operational sessions
- Form inputs maintain dark surface in dark mode (not white)
- Map overlays use semi-transparent dark surfaces (not light)

---

## Images

**No Hero Images** - This is a utility application focused on operational efficiency

**Where Images Appear:**
1. **User Avatars:** Profile images in navigation (40px circle), user management (64px)
2. **Empty States:** Illustrated placeholders for zero-data states (customers, vehicles)
3. **Vehicle Photos:** Optional thumbnail in vehicle cards (80x60px, rounded corners)
4. **Company Logo:** Top-left navigation (auto height, max 40px)

**Image Treatment:**
- Rounded corners (rounded-md for cards, rounded-full for avatars)
- Subtle border in surface-variant color
- Lazy loading for vehicle galleries
- Placeholder: Surface-variant with icon during load

---

## Security Visual Indicators

- **Authenticated Session:** Green dot indicator next to username
- **Permission Badges:** Small chips showing role capabilities
- **Data Encryption:** Lock icon micro-indicator on sensitive fields (CPF, payment card)
- **Activity Log:** Timestamp + user avatar for all CRUD operations
- **Access Denied States:** Full-screen centered message with error color accent