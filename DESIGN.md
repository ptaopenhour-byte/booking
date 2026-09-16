# IBSH PTA Open Hour — Design System

The active visual reference is the user's Lark scheduling screenshot (September 2026). Earlier Cal.com-inspired rules remain useful for spacing and readability; the current reference overrides its monochrome actions and white page background.

## Visual theme

- Calm, precise, trustworthy, and administrative rather than playful.
- Pale blue page background (#f3f7ff) with a subtle blue wash, white booking panel, and softly tinted teacher sidebar (#f7faff).
- Blue actions and selected dates (#356bff), restrained shadows, small radii, and generous whitespace.
- Use color semantically: blue for focus/current step, green for open/success, amber for warning, red for destructive/error.

## Tokens

```css
--ink: #242830;
--body: #374151;
--muted: #6b7280;
--muted-soft: #898989;
--hairline: #e5e7eb;
--hairline-soft: #f3f4f6;
--canvas: #ffffff;
--surface-soft: #f7faff;
--surface-card: #f5f5f5;
--focus: #356bff;
--success: #15803d;
--warning: #b45309;
--error: #dc2626;
--radius-control: 8px;
--radius-card: 12px;
--radius-marquee: 16px;
```

Typography uses Inter for UI/body text. Display headings use Inter at weight 600 with negative tracking as a practical Cal Sans substitute. Do not use weights above 700. Base spacing is 4px; common gaps are 8, 12, 16, 24, 32, and 48px.

## Components

- Primary button: blue, white label, 8px radius, minimum 44px height.
- Appointment detail: teacher sidebar, month calendar, and date-specific time list. On mobile these stack vertically.
- Dates with published slots are selectable. Booked and actively locked slots are disabled; source dates are passed unchanged into the existing booking transaction.
- Preserve calendar selection across live updates. Always display the Taipei timezone.
- Teacher photos remain; missing photos use name initials. Never generate animal or mascot avatars. The official school logo remains the brand asset.
- Secondary button/input: white, 1px hairline, 8px radius, minimum 44px height.
- Content surface: 1px hairline or `#f5f5f5` fill, 12px radius, no heavy shadow.
- Status: compact inline semantic marker, not a decorative oversized pill.
- Progress: three equal stages with numeric circles and a blue active state.
- Department and teacher collections: full-width rows on mobile; restrained multi-column list only where space allows.
- Modals: 16px radius, hairline border, compact header, readable form spacing.

## Responsive rules

- Mobile breakpoint: below 768px.
- Mobile uses a single content column, 16px side gutters, and at least 44px interactive targets.
- Booking status becomes a compact summary with a collapsible detail area.
- Progress remains three visible stages and may compress labels, never reduce tap clarity.
- Search is full width during department/teacher selection and hidden during date selection. Teacher notes are collapsible on mobile.
- Departments and teachers are one-column rows; never use two tiny cards.
- Account actions move to a fixed bottom navigation with safe-area padding. Sign out stays in the profile action.
- Modal sheets align to the bottom on small screens and never exceed the viewport.

## Guardrails

- No glassmorphism, thick borders, heavy shadows, bouncy motion, or giant rounded containers. Only the page background uses a restrained blue gradient matching the supplied reference.
- No emoji as primary navigation or subject iconography; use one consistent outline icon family.
- No invented marketing sections, fake metrics, or decorative badges.
- Preserve workflow labels, status semantics, data fields, and booking behavior.
- Respect `prefers-reduced-motion` and keyboard focus visibility.
