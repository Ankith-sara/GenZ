# GenZ Design & UX Rules

## Visual direction

GenZ should feel modern, clean and product-focused while retaining an Indian maker/craft identity.

Use the existing design tokens and established visual language before introducing new values.

Current core palette includes:

- Warm background: `#FAF8F4`
- Deep charcoal: `#1A1A18`
- Border: `#E5E5E0`
- Warm accent: `#C89D32`
- Body text: `#52524E`

Do not introduce random colors when an existing token solves the problem.

## UX principles

- Prefer clear hierarchy over decorative UI.
- Avoid unnecessary card-on-card layouts.
- Use whitespace, typography and grouping to create hierarchy.
- Keep primary actions obvious.
- Destructive actions need confirmation.
- Loading, empty, error and success states must be intentional.
- Forms should preserve entered values after validation errors.
- Do not make a user navigate away just to perform a common action.
- Keep seller/admin dashboards information-dense but scannable.

## Responsive requirements

Every meaningful view must work at minimum on:

- 360px mobile
- tablet
- desktop

Never fix desktop layout by breaking mobile.

## Accessibility

- Use semantic HTML.
- Maintain visible keyboard focus.
- Buttons must describe actions.
- Inputs require labels or equivalent accessible names.
- Do not rely on color alone to communicate status.
- Dialogs/drawers must have accessible names and predictable keyboard behavior.

## UI implementation

Prefer existing components from `@genz/ui`. If a pattern is reusable across apps, move it to the shared package instead of creating another copy.
