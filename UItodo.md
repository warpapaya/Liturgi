# UI & Branding Alignment - Production Roadmap

> Goal: Align app UI with Liturgi website branding + create complete design system

## 🎨 Phase 1: Brand Alignment (CRITICAL)

### Color System Integration
- [ ] Verify brand colors match between app and website
  - [ ] Primary: Sanctuary Blue #2A4B8D ✓ (already aligned)
  - [ ] Accent: Liturgical Gold #C9A34A ✓ (already aligned)
  - [ ] Success: Sage Green #6DA67A ✓ (already aligned)
  - [ ] Destructive: Rosary Red #C85151 ✓ (already aligned)
  - [ ] Neutral: Ash Grey #E5E7EB ✓ (already aligned)
  - [ ] Text: Charcoal Ink #1D1D1F ✓ (already aligned)
- [ ] Migrate to CSS variable system (like website)
  - [ ] Convert Tailwind config to use HSL values
  - [ ] Add dark mode color definitions
  - [ ] Create semantic color tokens (background, foreground, card, etc.)
  - [ ] Update globals.css with :root variables
  - [ ] Test color contrast ratios (WCAG AA minimum)
- [ ] Establish color usage guidelines
  - [ ] Primary: main actions, links, branding
  - [ ] Gold: highlights, premium features, accents
  - [ ] Sage: success states, positive actions
  - [ ] Rosary: errors, destructive actions, warnings
  - [ ] Ash: borders, backgrounds, disabled states
  - [ ] Charcoal: body text, headings

### Typography System
- [ ] Add Cormorant Garamond serif font (from website)
  - [ ] Install font via Google Fonts or local files
  - [ ] Add to layout.tsx font imports
  - [ ] Create .font-serif utility class
  - [ ] Define when to use serif vs sans-serif
- [ ] Establish typography hierarchy
  - [ ] H1: Cormorant Garamond 48px/56px bold
  - [ ] H2: Cormorant Garamond 36px/44px bold
  - [ ] H3: Cormorant Garamond 30px/38px semibold
  - [ ] H4: Inter 24px/32px semibold
  - [ ] H5: Inter 20px/28px semibold
  - [ ] Body: Inter 15px/24px regular
  - [ ] Small: Inter 13px/20px regular
  - [ ] Tiny: Inter 11px/16px regular
- [ ] Create typography utility classes
  - [ ] .text-heading-1 through .text-heading-5
  - [ ] .text-body-lg, .text-body, .text-body-sm
  - [ ] .text-serif for elegant headings
  - [ ] Line height variants
  - [ ] Letter spacing adjustments

### Layout & Spacing
- [ ] Define spacing scale (already using Tailwind defaults)
  - [ ] Verify 4px base unit (0.25rem)
  - [ ] Common patterns: 4, 8, 12, 16, 24, 32, 48, 64px
- [ ] Establish layout patterns
  - [ ] Page container: max-w-7xl mx-auto px-4 lg:px-8
  - [ ] Card spacing: p-6 lg:p-8
  - [ ] Form spacing: space-y-6
  - [ ] Button spacing: px-4 py-2 (sm), px-6 py-3 (lg)
- [ ] Define responsive breakpoints
  - [ ] Mobile: < 640px (default)
  - [ ] Tablet: 640px - 1024px (sm, md)
  - [ ] Desktop: 1024px+ (lg, xl, 2xl)
- [ ] Create layout components
  - [ ] PageHeader component
  - [ ] PageContainer component
  - [ ] Section component
  - [ ] Grid system utilities

### Border Radius & Shadows
- [ ] Update border radius tokens
  - [ ] Default: 6px (rounded-liturgi) ✓
  - [ ] Large: 8px (rounded-liturgi-lg) ✓
  - [ ] Full: 9999px (rounded-full)
  - [ ] Consider 12px option for larger cards
- [ ] Define shadow system
  - [ ] shadow-xs: subtle (hover states)
  - [ ] shadow-sm: cards, panels ✓
  - [ ] shadow: modals, dropdowns
  - [ ] shadow-lg: toast notifications ✓
  - [ ] shadow-xl: large modals
- [ ] Establish elevation patterns
  - [ ] Level 0: flat (no shadow)
  - [ ] Level 1: cards (shadow-sm)
  - [ ] Level 2: dropdowns (shadow)
  - [ ] Level 3: modals (shadow-lg)
  - [ ] Level 4: tooltips (shadow-xl)

## 🧩 Phase 2: Core UI Components (CRITICAL)

### Buttons
- [ ] Enhance existing button variants
  - [ ] Primary (Sanctuary Blue) ✓
  - [ ] Secondary (Ash Grey) ✓
  - [ ] Success (Sage Green) ✓
  - [ ] Danger (Rosary Red) ✓
  - [ ] Ghost/text-only variant
  - [ ] Outline variants for each color
- [ ] Add button sizes
  - [ ] xs: px-2 py-1 text-xs
  - [ ] sm: px-3 py-1.5 text-sm
  - [ ] md: px-4 py-2 text-base (default)
  - [ ] lg: px-6 py-3 text-lg
  - [ ] xl: px-8 py-4 text-xl
- [ ] Add button states
  - [ ] Loading state with spinner
  - [ ] Disabled state
  - [ ] Active/pressed state
  - [ ] Focus-visible ring
- [ ] Create icon button variant
  - [ ] Square aspect ratio
  - [ ] Icon-only (no text)
  - [ ] With tooltip
- [ ] Add button group component
  - [ ] Horizontal group
  - [ ] Vertical stack
  - [ ] Segmented control style

### Form Components
- [ ] Enhanced text input ✓ (basic exists)
  - [ ] Add prefix/suffix icons
  - [ ] Add character counter
  - [ ] Add clear button (X)
  - [ ] Error state styling
  - [ ] Success state styling
  - [ ] Disabled state
  - [ ] Read-only state
- [ ] Textarea component
  - [ ] Auto-resize option
  - [ ] Character counter
  - [ ] Max length indicator
- [ ] Select/dropdown component
  - [ ] Native select styled
  - [ ] Custom dropdown (Headless UI)
  - [ ] Multi-select variant
  - [ ] Searchable select
  - [ ] Grouped options
- [ ] Checkbox component
  - [ ] Styled checkbox
  - [ ] Indeterminate state
  - [ ] Checkbox group
  - [ ] With label and description
- [ ] Radio button component
  - [ ] Styled radio
  - [ ] Radio group
  - [ ] Card-style radio options
- [ ] Toggle/switch component
  - [ ] On/off switch
  - [ ] With label
  - [ ] Disabled state
- [ ] Date picker component
  - [ ] Calendar popup
  - [ ] Date range picker
  - [ ] Time picker
  - [ ] DateTime picker
- [ ] File upload component
  - [ ] Drag and drop zone
  - [ ] File preview
  - [ ] Multiple files
  - [ ] Progress indicator
  - [ ] File type restrictions
- [ ] Search input component
  - [ ] Search icon
  - [ ] Clear button
  - [ ] Autocomplete dropdown
  - [ ] Loading state

### Feedback Components
- [ ] Toast/notification system ✓ (basic exists)
  - [ ] Success toast (sage green)
  - [ ] Error toast (rosary red)
  - [ ] Warning toast (gold)
  - [ ] Info toast (primary blue)
  - [ ] Auto-dismiss timer
  - [ ] Close button
  - [ ] Stacking multiple toasts
  - [ ] Position options (top-right, bottom-right, etc.)
- [ ] Alert component
  - [ ] Inline alerts (banner style)
  - [ ] Icon variants
  - [ ] Dismissible option
  - [ ] Action button option
- [ ] Modal/dialog component
  - [ ] Overlay backdrop
  - [ ] Size variants (sm, md, lg, xl, full)
  - [ ] Close button
  - [ ] Close on overlay click
  - [ ] Scroll behavior (body vs content)
  - [ ] Animation (fade + scale)
- [ ] Confirmation dialog
  - [ ] Title, description, actions
  - [ ] Danger variant (red buttons)
  - [ ] Async actions (loading state)
- [ ] Drawer/slide-over component
  - [ ] Slide from right (default)
  - [ ] Slide from left/bottom
  - [ ] Size variants
  - [ ] Nested drawers support
- [ ] Popover component
  - [ ] Positioning (auto, top, bottom, left, right)
  - [ ] Arrow pointer
  - [ ] Click or hover trigger
  - [ ] Close on outside click
- [ ] Tooltip component
  - [ ] Short text on hover
  - [ ] Positioning options
  - [ ] Delay before show
  - [ ] Arrow pointer

### Data Display Components
- [ ] Table component
  - [ ] Styled table headers
  - [ ] Zebra striping option
  - [ ] Hover row highlight
  - [ ] Sortable columns
  - [ ] Column resizing
  - [ ] Sticky header
  - [ ] Pagination controls
  - [ ] Row selection (checkbox)
  - [ ] Empty state
  - [ ] Loading skeleton
- [ ] Card component ✓ (basic exists)
  - [ ] Header/body/footer sections
  - [ ] Image card variant
  - [ ] Hover effects
  - [ ] Clickable card
  - [ ] Badge/tag overlay
- [ ] Badge component ✓ (basic exists)
  - [ ] Dot badge (notification)
  - [ ] Pill shape ✓
  - [ ] Removable badge (with X)
  - [ ] Status badges (active, inactive, pending)
- [ ] Avatar component
  - [ ] Image avatar
  - [ ] Initials fallback
  - [ ] Size variants (xs, sm, md, lg, xl)
  - [ ] Status indicator dot
  - [ ] Avatar group (stacked)
- [ ] Empty state component
  - [ ] Icon + message
  - [ ] Call-to-action button
  - [ ] Illustration option
  - [ ] Multiple variants per context
- [ ] Skeleton loader component
  - [ ] Text skeleton
  - [ ] Card skeleton
  - [ ] Table skeleton
  - [ ] Avatar skeleton
  - [ ] Pulse animation
- [ ] Progress bar component
  - [ ] Linear progress
  - [ ] Circular progress (spinner)
  - [ ] Percentage label
  - [ ] Color variants
  - [ ] Indeterminate state
- [ ] Stats card component
  - [ ] Metric + label
  - [ ] Trend indicator (up/down)
  - [ ] Icon
  - [ ] Sparkline chart (optional)

### Navigation Components
- [ ] Enhanced navbar ✓ (basic exists)
  - [ ] Mobile responsive menu
  - [ ] Dropdown submenus
  - [ ] User profile dropdown
  - [ ] Notification bell
  - [ ] Search in navbar
  - [ ] Breadcrumbs integration
- [ ] Breadcrumb component
  - [ ] Auto-generated from route
  - [ ] Clickable links
  - [ ] Current page highlighted
  - [ ] Collapse on mobile
- [ ] Tabs component
  - [ ] Horizontal tabs (default)
  - [ ] Vertical tabs
  - [ ] Pills style
  - [ ] Underline style
  - [ ] Icon + text tabs
  - [ ] Scrollable on overflow
- [ ] Sidebar navigation
  - [ ] Collapsible sidebar
  - [ ] Icon-only collapsed state
  - [ ] Active link highlight
  - [ ] Nested menu items
  - [ ] Mobile slide-out
- [ ] Pagination component
  - [ ] Page numbers
  - [ ] Previous/next buttons
  - [ ] Jump to page
  - [ ] Items per page selector
  - [ ] Total count display
- [ ] Command palette (Cmd+K)
  - [ ] Global search
  - [ ] Quick actions
  - [ ] Keyboard shortcuts list
  - [ ] Recent items

### Utility Components
- [ ] Accordion component
  - [ ] Single open at a time
  - [ ] Multiple open
  - [ ] Icon rotation animation
  - [ ] Default open items
- [ ] Tag/chip component
  - [ ] Color variants
  - [ ] Removable (with X)
  - [ ] Clickable/selectable
  - [ ] Tag input (add/remove)
- [ ] Divider component
  - [ ] Horizontal line
  - [ ] With text label
  - [ ] Vertical variant
- [ ] Timeline component
  - [ ] Vertical timeline
  - [ ] Event nodes
  - [ ] Icons/avatars
  - [ ] Date labels
- [ ] Context menu (right-click)
  - [ ] Menu items
  - [ ] Dividers
  - [ ] Keyboard shortcuts
  - [ ] Icons
  - [ ] Nested menus

## 🎭 Phase 3: Animations & Transitions

### Micro-interactions
- [ ] Button hover effects
  - [ ] Background color transition
  - [ ] Scale on press
  - [ ] Ripple effect (optional)
- [ ] Input focus animations
  - [ ] Ring animation
  - [ ] Label float (Material style)
  - [ ] Icon color change
- [ ] Card interactions
  - [ ] Hover lift (shadow + translate)
  - [ ] Click feedback
  - [ ] Image zoom on hover
- [ ] Link hover effects
  - [ ] Underline slide-in
  - [ ] Color transition
  - [ ] Icon shift

### Page Transitions
- [ ] Route change animations
  - [ ] Fade in/out
  - [ ] Slide transitions
  - [ ] Loading bar
- [ ] Modal animations
  - [ ] Fade backdrop
  - [ ] Scale + fade content
  - [ ] Slide from bottom (mobile)
- [ ] Drawer animations
  - [ ] Slide from side
  - [ ] Smooth easing
- [ ] Toast animations
  - [ ] Slide + fade in
  - [ ] Exit animations
  - [ ] Stacking behavior

### Loading States
- [ ] Skeleton screens
  - [ ] Pulse animation
  - [ ] Wave/shimmer effect
  - [ ] Gradual reveal
- [ ] Spinner variants
  - [ ] Circle spinner
  - [ ] Dots spinner
  - [ ] Bars spinner
  - [ ] Logo spinner (branded)
- [ ] Progress indicators
  - [ ] Linear progress bar
  - [ ] Circular progress
  - [ ] Step progress

### Scroll Animations
- [ ] Fade in on scroll
- [ ] Slide up on scroll
- [ ] Parallax effects (subtle)
- [ ] Sticky header transition
- [ ] Back to top button

## 🖼️ Phase 4: Layout & Page Templates

### Page Layout Components
- [ ] DashboardLayout component
  - [ ] Sidebar + main content
  - [ ] Top navbar
  - [ ] Mobile responsive
  - [ ] Collapsible sidebar
- [ ] AuthLayout component
  - [ ] Centered form
  - [ ] Background pattern/image
  - [ ] Logo
  - [ ] Footer links
- [ ] EmptyLayout component
  - [ ] Minimal chrome
  - [ ] For error pages
- [ ] SettingsLayout component
  - [ ] Sidebar navigation
  - [ ] Tab structure
  - [ ] Breadcrumbs

### Page Templates
- [ ] List view template
  - [ ] Search + filters
  - [ ] Action buttons
  - [ ] Table/grid toggle
  - [ ] Pagination
  - [ ] Empty state
- [ ] Detail view template
  - [ ] Header with actions
  - [ ] Tabs for sections
  - [ ] Side panel (related items)
  - [ ] Activity feed
- [ ] Form view template
  - [ ] Progress stepper (multi-step)
  - [ ] Save/cancel actions
  - [ ] Validation feedback
  - [ ] Autosave indicator
- [ ] Dashboard template
  - [ ] Stats cards
  - [ ] Charts/graphs
  - [ ] Activity feed
  - [ ] Quick actions

## 🎨 Phase 5: Advanced Styling

### Dark Mode
- [ ] Dark mode toggle
- [ ] Color scheme for dark mode
  - [ ] Dark backgrounds
  - [ ] Adjusted text colors
  - [ ] Reduced shadows
  - [ ] Border adjustments
- [ ] Persist preference (localStorage)
- [ ] System preference detection
- [ ] Smooth transition between modes

### Responsive Design
- [ ] Mobile navigation
  - [ ] Hamburger menu
  - [ ] Drawer navigation
  - [ ] Bottom tab bar (optional)
- [ ] Mobile-optimized forms
  - [ ] Larger touch targets
  - [ ] Full-width inputs
  - [ ] Native input types
- [ ] Tablet layouts
  - [ ] Two-column layouts
  - [ ] Collapsible panels
- [ ] Desktop enhancements
  - [ ] Multi-column grids
  - [ ] Keyboard shortcuts
  - [ ] Hover states

### Print Styles
- [ ] Print stylesheet
- [ ] Hide non-printable elements
- [ ] Format for paper
- [ ] Page breaks
- [ ] Print button

### Accessibility (A11y)
- [ ] Semantic HTML elements
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
  - [ ] Focus visible styles
  - [ ] Tab order
  - [ ] Escape to close
  - [ ] Arrow key navigation
- [ ] Screen reader support
  - [ ] Alt text for images
  - [ ] Descriptive labels
  - [ ] Announce changes
- [ ] Color contrast compliance
  - [ ] WCAG AA minimum (4.5:1)
  - [ ] AAA preferred (7:1)
- [ ] Focus indicators
  - [ ] Visible focus rings
  - [ ] Skip to content link
- [ ] Form accessibility
  - [ ] Label associations
  - [ ] Error announcements
  - [ ] Required field indicators

## 📐 Phase 6: Design Tokens & System

### Design Token System
- [ ] Create design token file (tokens.ts)
  - [ ] Colors (all variants)
  - [ ] Spacing scale
  - [ ] Typography scale
  - [ ] Border radius
  - [ ] Shadows
  - [ ] Z-index scale
  - [ ] Animation durations
  - [ ] Animation easings
- [ ] Document token usage
  - [ ] When to use each token
  - [ ] Examples
  - [ ] Do's and don'ts
- [ ] Export tokens for design tools
  - [ ] Figma tokens
  - [ ] CSS variables
  - [ ] SCSS variables

### Component Library
- [ ] Create Storybook setup
  - [ ] Install Storybook
  - [ ] Configure for Next.js
  - [ ] Add stories for each component
  - [ ] Add controls/props
  - [ ] Document variants
- [ ] Component documentation
  - [ ] Props documentation
  - [ ] Usage examples
  - [ ] Accessibility notes
  - [ ] Best practices
- [ ] Visual regression testing
  - [ ] Chromatic or Percy
  - [ ] Screenshot tests
  - [ ] Diff detection

### Brand Assets
- [ ] Logo variants
  - [ ] Full logo
  - [ ] Icon only
  - [ ] Dark mode versions
  - [ ] Small sizes (16px, 32px, 64px)
- [ ] Favicon set
  - [ ] 16x16, 32x32, 64x64
  - [ ] Apple touch icon
  - [ ] Android icons
  - [ ] Manifest.json
- [ ] Social media assets
  - [ ] Open Graph images
  - [ ] Twitter cards
  - [ ] LinkedIn previews
- [ ] Email templates
  - [ ] Transactional emails
  - [ ] Notification emails
  - [ ] Marketing emails

## 🚀 Phase 7: Performance & Optimization

### CSS Optimization
- [ ] PurgeCSS configuration
- [ ] Critical CSS extraction
- [ ] Font loading optimization
  - [ ] Font preloading
  - [ ] Font display swap
  - [ ] Subset fonts
- [ ] Reduce bundle size
  - [ ] Tree-shake unused styles
  - [ ] Combine similar utilities
  - [ ] Use CSS variables

### Image Optimization
- [ ] Next.js Image component usage
- [ ] WebP format support
- [ ] Lazy loading images
- [ ] Responsive images (srcset)
- [ ] Blur placeholder
- [ ] Image CDN integration

### Animation Performance
- [ ] Use transform over position
- [ ] Use opacity over color
- [ ] GPU acceleration (will-change)
- [ ] Reduce motion preference
- [ ] Debounce scroll events

## 📊 Success Metrics

### Design Quality
- [ ] 100% brand color consistency
- [ ] All components documented
- [ ] Zero accessibility violations (WCAG AA)
- [ ] 95+ Lighthouse performance score
- [ ] <100ms UI response time
- [ ] Smooth 60fps animations

### User Experience
- [ ] Consistent spacing throughout
- [ ] Clear visual hierarchy
- [ ] Intuitive navigation
- [ ] Helpful error messages
- [ ] Fast perceived performance
- [ ] Mobile-first responsive

### Developer Experience
- [ ] All components reusable
- [ ] TypeScript interfaces for all props
- [ ] Storybook for all components
- [ ] Clear naming conventions
- [ ] Easy to customize
- [ ] Well-documented patterns

## 🎯 Priority Order

### Week 1: Foundation
1. Color system migration to CSS variables
2. Typography system with serif font
3. Core button variants
4. Form components (input, select, checkbox)
5. Modal and toast components

### Week 2: Essential Components
6. Table component with sorting
7. Card enhancements
8. Badge and avatar components
9. Navigation improvements
10. Loading states and skeletons

### Week 3: Advanced Features
11. Date picker and file upload
12. Tabs and accordion
13. Command palette
14. Animations and transitions
15. Dark mode implementation

### Week 4: Polish & Documentation
16. Accessibility audit and fixes
17. Responsive design review
18. Storybook documentation
19. Performance optimization
20. Final QA and testing

---

**Total Estimated Effort:** 4-6 weeks for complete UI system
**Critical Path:** Phases 1-2 (2-3 weeks)
**Nice-to-Have:** Phases 6-7 (can be done incrementally)
