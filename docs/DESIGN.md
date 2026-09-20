# GenZ Design Style Guide: Web, Seller & Admin

This document defines the comprehensive design style, visual language, component tokens, and UX rules across the GenZ ecosystem: the customer storefront (**Web**), the artisan workshop portal (**Seller**), and the platform governance desk (**Admin**).

---

## 1. Brand Aesthetics & Core Principles

GenZ reflects **Modern Indian Craft Luxury & Authentic Maker Provenance**. The visual style avoids generic corporate styling or neon accents in favor of a timeless, tactile aesthetic inspired by raw paper, handloom textiles, Kondapalli wooden carvings, and generational craft workshops.

### Core Visual Principles

1. **Material-Informed Surfaces**: Warm paper canvases (`#FAF8F4`), crisp ash dividers (`#E5E5E0`), and elevated pure white cards (`#FFFFFF`).
2. **Monochromatic Restraint with Craft Gold**: Deep ink charcoal (`#1A1A18`) anchors 95% of the visual space; warm craft gold (`#C89D32`) is reserved exclusively for GI certifications, award milestones, and verified badges.
3. **Zero Green/Emerald Rule**: Green color schemes, mint buttons, and emerald accents are strictly prohibited across all apps.
4. **Single System Theme**: All interfaces operate on a clean, high-contrast light theme. Dark mode (`dark:...`) is prohibited.
5. **Purpose-Driven Density**: Customer interfaces feel airy, editorial, and calm; seller and admin workspaces prioritize data density, immediate keyboard shortcuts, and zero-distraction workflows.

---

## 2. Color Palette & Token System

All three applications share the authentic monochromatic and warm earth palette established in `apps/web`:

| Token Name            | Hex Code                            | Tailwind Token                        | Application & Role                                         |
| :-------------------- | :---------------------------------- | :------------------------------------ | :--------------------------------------------------------- |
| **Warm Canvas**       | `#FAF8F4`                           | `bg-[#FAF8F4]`                        | Root background across Web, Seller, and Admin              |
| **Card Surface**      | `#FFFFFF`                           | `bg-white`                            | Elevated dashboard cards, product cards, popovers, drawers |
| **Sub-Surface Tint**  | `#FAF8F4` / `rgba(250,248,244,0.6)` | `bg-[#FAF8F4]/60`                     | Input fields, table row hover, chip backgrounds            |
| **Ash Border**        | `#E5E5E0`                           | `border-[#E5E5E0]`                    | Structural dividers, input strokes, card outlines          |
| **Deep Ink Charcoal** | `#1A1A18`                           | `text-[#1A1A18]` / `bg-[#1A1A18]`     | Primary headings, primary pill CTAs, active toggles        |
| **Primary CTA Hover** | `#2E2E2B`                           | `hover:bg-[#2E2E2B]`                  | Primary button hover and pressed states                    |
| **Smoke Secondary**   | `#52524E`                           | `text-[#52524E]`                      | Subtitles, metadata labels, SKUs, helper text              |
| **Craft Gold Accent** | `#C89D32`                           | `text-[#C89D32]` / `border-[#C89D32]` | GI marks, verified maker seals, star ratings               |
| **Destructive Rose**  | `#E11D48`                           | `bg-rose-600` / `border-rose-200`     | Delete actions, document rejections, cancellation badges   |

---

## 3. Design Style for Web (`apps/web`)

**Role**: Customer Storefront, Craft Discovery & Buyer Checkout  
**Mood**: Editorial luxury, authentic storytelling, tactile craft appreciation, effortless purchasing.

### Visual Style & Layout

- **Hero & Runway Displays**:
  - Full-width hero presentations paired with elegant typography (`font-sans` with generous line height).
  - Clean runway showcases presenting curated crafts with maker origin tags (e.g., _"Kondapalli, Andhra Pradesh · GI Registered"_).
- **Product Cards**:
  - Strict **4:3 aspect ratio** photography with soft rounded corners (`rounded-xl` / `rounded-2xl`).
  - Minimalist framing: ash borders (`border-[#E5E5E0]`), crisp white backing, and high-contrast charcoal price display.
  - Hover states: Floating "Quick View" pill centered at the bottom of the image, subtle elevation shadow, and instant thumbnail swap on secondary image hover.
- **Artisan Provenance Storytelling**:
  - Dedicated maker bio blocks with government GI certificate details, generational workshop lineage, and verified authentic artisan badges.
  - Transparent craft materials chips (e.g., _Tella Poniki Wood_, _Natural Lacquer Colors_).
- **Storefront Navigation & Cart**:
  - Minimal sticky navigation bar with charcoal brand wordmark, category drop-menus, and bag counter pill.
  - Smooth slide-over cart drawer with real-time subtotal calculations, free shipping indicators, and express one-click checkout.

---

## 4. Design Style for Seller (`apps/seller`)

**Role**: Artisan & Maker Operations, Catalog Publishing, Order Fulfillment & Media Studio  
**Mood**: Focused, ergonomic, responsive workspace with zero decorative clutter.

### Visual Style & Layout

- **Workspace Density & Layout Standard**:
  - Main workspace container uses tight, comfortable padding: `px-3 py-3 sm:px-5 sm:py-4 lg:px-6 lg:py-5`.
  - Zero redundant outer wrappers: eliminates "double padding" bug.
- **Sticky Header App Bar**:
  - Top-pinned header (`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E5E0]`).
  - 40x40 rounded back navigation button, breadcrumb navigation trail, real-time dirty state badge (`Unsaved changes` amber pill vs. `Live in Storefront`), and right-aligned pill action buttons (`[Save draft]`, `[Publish]`).
- **Product Catalog Desk & Quick Edit Drawer**:
  - Comprehensive catalog manager with search, category filtering, stock status chips, and batch action selection.
  - **Slide-Over Quick Edit**: Fast editing drawer allowing sellers to update title, category, price, status, and short description in seconds without full page navigation. Includes top product preview card with `<QuickEditThumbnail>` fallback.
- **Atomic Product Editor (`ProductEditorForm`)**:
  Follows strict **Rule 5 UX Section Order**:
  1. **Section 1: Media & Photos**: Dropzone with drag-and-drop, max 8 images, auto `COVER` badge, lightbox preview, inline "Add from URL" popover.
  2. **Section 2: Basic Information**: Title with `0/100` character counter, category selector, materials tag chips, craft story with attached markdown toolbar (`0/2000`).
  3. **Section 3: Catalog Ownership**: Artisan workshop assignment.
  4. **Section 4: Variants**: Multi-option builder with standard sizing range (`XS`, `S`, `M`, `L`, `XL`, `XXL`, `3XL`), matrix combinations table, and bulk editor.
  5. **Section 5: Inventory & Logistics**: 12-column responsive layout, SKU generator with `min-w-0`, stock counter stepper (`[-]` and `[+]`), low-stock threshold alert, and backorder toggle.
  6. **Section 6: Merchandising & Badges**: Checkboxes for `Featured`, `New arrival`, and `Best seller` (strict maximum of 2 badges allowed).
  7. **Section 7: Publishing & Audit**: Radio cards for `Draft` vs. `Published`, live 4:3 storefront buyer preview card mirroring edits in real time.
  8. **Section 8: Danger Zone (Edit Mode)**: Two-step click-to-confirm delete button with auto-reset timer.
- **Orders & Shipping Desk**:
  - Scannable order cards with status badges (`Pending`, `Processing`, `Shipped`, `Delivered`).
  - Slide-over order inspector with customer destination address, packing slips, and Delhivery tracking integration.
- **Artisan Profile & Reels Studio**:
  - 9:16 vertical video uploader with product pin tagging.
  - Verification studio for GI artisan certificate submission, fallback to application profile data to guarantee zero "Not specified" / "Pending" defaults.

---

## 5. Design Style for Admin (`apps/admin`)

**Role**: Platform Governance, Artisan Onboarding Verification, Catalog Curation & Order Auditing  
**Mood**: High-density operational control center, forensic review tools, authoritative moderation.

### Visual Style & Layout

- **Split-Pane Verification Desks**:
  - Side-by-side document review: artisan application details on the left, high-resolution zoomable government ID / GI certificate inspector on the right.
  - Single-click action bar: Approve with GI verification badge, Request Changes with specific feedback note, or Reject.
- **Platform-Wide Data Tables**:
  - High-density table rows with monospace identifiers, user emails, verified badges, and creation timestamps.
  - Sticky table headers with sorting, multi-column search, and batch actions (bulk status updates, data export).
- **Catalog Curation & GI Certification Desk**:
  - Admin curation flags: assign `GI Certified Artisan` gold seal, verify craft authenticity credentials, and feature products on global storefront runways.
- **Audit Logging & Risk Monitoring**:
  - Real-time audit stream detailing seller signups, status mutations, price overrides, and fulfillment events.

---

## 6. Shared Component Design System (`packages/ui`)

### Buttons

- **Pill Buttons (`rounded-full`)**:
  - **Primary Action**: `rounded-full bg-[#1A1A18] px-5 py-2 text-xs font-semibold text-white hover:bg-[#2E2E2B] transition-colors disabled:opacity-60 shadow-xs`
  - **Secondary Outline**: `rounded-full border border-[#E5E5E0] bg-white px-4 py-2 text-xs font-medium text-[#1A1A18] hover:bg-[#FAF8F4] transition-colors`
  - **Destructive Outline**: `rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors`
  - **Destructive Filled**: `rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors`

### Inputs & Textareas

- Background: `bg-[#FAF8F4]/50`.
- Border: `border-[#E5E5E0]`.
- Focus State: `focus:border-[#1A1A18] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A18]`.
- Currency Adornments: Absolute left-aligned `₹` in `text-[#52524E]` with `pl-7` input padding.

### Custom Dropdown (`Select`)

- Exported from `packages/ui/src/components/select.tsx`.
- Named strictly `Select` with **zero backwards-compatibility aliases**.
- Features outside-click handling, Escape key dismissal, hover highlights (`hover:bg-[#FAF8F4]`), active checkmark indicators (`<Check className="h-4 w-4" />`), and hidden `<input />` for seamless server action serialization.

### Sliding Thumb Switches (`M3Switch`)

- Pill-shaped sliding track (`h-6 w-11 rounded-full p-0.5`).
- Inactive track: `bg-[#E5E5E0]`.
- Active track: `bg-[#1A1A18]`.
- Circular thumb: `h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-out`.

### Slide-Over Drawers (`SlideOverDrawer`)

- Reusable drawer across Quick Edit, Order Details, and Customer Cart.
- Backdrop: `fixed inset-0 bg-[#1A1A18]/40 backdrop-blur-xs transition-opacity duration-200`.
- Panel: `border-l border-[#E5E5E0] bg-white text-[#1A1A18] shadow-2xl`.
- Header: `border-b border-[#E5E5E0] bg-[#FAF8F4] px-6 py-4`.
- Footer: `border-t border-[#E5E5E0] bg-[#FAF8F4] px-6 py-3.5 flex items-center justify-between`.

### Media & Thumbnail Fallbacks

- `resolveProductImage`: Normalizes Supabase storage URLs and strips duplicate `product-media/` bucket prefixes.
- `QuickEditThumbnail`: Automatically falls back to `<ShoppingBag className="h-5 w-5 text-[#52524E]/40" />` on `#FAF8F4` canvas on load failure, preventing broken browser image icons.

---

## 7. Typography & Iconography Standards

- **Primary Sans**: `Plus Jakarta Sans` / `Inter` (`font-sans`) for headings, body copy, and UI controls.
- **Tabular Monospace**: `Roboto Mono` (`font-mono`) with tabular numerals for prices (`₹`), SKUs, quantities, order IDs, timestamps, and inventory counters.
- **Lucide React Icons Only**: Strictly use official Lucide icons (`<ArrowLeft />`, `<ChevronRight />`, `<Plus />`, `<Trash2 />`, `<Eye />`, `<Save />`, `<Check />`, `<ShoppingBag />`, `<ExternalLink />`).
- **Strict Prohibition**: Never use raw unicode or HTML arrow characters (`←`, `→`, `&rarr;`, `&larr;`, `▲`, `▼`).

---

## 8. Monorepo Architecture & Verification Discipline

1. **Package Boundaries**:
   - Reusable UI primitives: `packages/ui` (`@genz/ui`).
   - Domain types & interfaces: `packages/types` (`@genz/types`).
   - Zod validation schemas: `packages/validation` (`@genz/validation`).
   - Database clients & repositories: `packages/database` (`@genz/database`).
2. **Next.js 15 & React 19 Standards**:
   - Server Components by default; `"use client"` only for leaf interactive components.
   - Dynamic route parameters must be awaited (`await params`).
   - Server actions wrapped with `withRateLimit` + `requireRole`.
3. **Verification**:
   - Always verify changes with `pnpm test` and `npx tsc --noEmit`.
   - Pre-commit hooks (`.husky/pre-commit`) enforce test execution with Unix LF line endings. Never use `--no-verify`.
