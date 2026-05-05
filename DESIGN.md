# Lofishmart Design System

This document outlines the core design language, tokens, and aesthetic principles for the Lofishmart full-stack project. These guidelines can be used as instructions for AI tools (like Google Stitch) or as a reference for frontend development.

## 1. Typography

The primary typeface used across the application is **Work Sans**. It provides a clean, modern, and highly legible appearance suitable for both data-dense dashboards and consumer-facing interfaces.

- **Primary Font (Sans-serif)**: `Work Sans`, `ui-sans-serif`, `sans-serif`, `system-ui`
- **Monospace Font**: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `"Liberation Mono"`, `"Courier New"`, `monospace`
- **Serif Font**: `ui-serif`, `Georgia`, `Cambria`, `"Times New Roman"`, `Times`, `serif`
- **Global Scaling**: The root font size is scaled down to `90%` to ensure a refined, compact UI layout.
- **Letter Spacing**: Normal tracking is set to `0em`.

## 2. Color Palette

The project uses a structured color palette with dedicated brand colors and comprehensive Tailwind/shadcn UI semantic tokens, defined primarily using OKLCH for consistent perceived lightness.

### Brand Colors
- **Brand Primary**: `#0094c6` (Vibrant Blue)
- **Brand Secondary**: `#001242` (Deep Navy)
- **Brand Tertiary**: `#000022` (Very Dark Blue)

### Text & Neutral Colors
- **Text Primary**: `#1a1a1a`
- **Text Secondary**: `#6b7280`
- **Text Muted**: `#9ca3af`
- **Text On-Brand**: `#ffffff`

### Background / Surface Colors
- **Canvas (App Background)**: `#f8f7f5`
- **Surface (Cards/Containers)**: `#ffffff`
- **Neutral Background**: `#f3f4f6`

### Semantic Themes (Light / Dark)
The application fully supports dark mode with semantic OKLCH tokens based on the shadcn/ui convention.
- **Background**: Light `oklch(1 0 0)` / Dark `oklch(0.1450 0 0)`
- **Foreground**: Light `oklch(0.1450 0 0)` / Dark `oklch(0.9850 0 0)`
- **Primary**: Light `oklch(0.5388 0.1764 254.8327)` / Dark `oklch(0.9220 0 0)`
- **Secondary**: Light `oklch(0.9700 0 0)` / Dark `oklch(0.2690 0 0)`
- **Destructive**: Light `oklch(0.5770 0.2450 27.3250)` / Dark `oklch(0.7040 0.1910 22.2160)`
- **Muted**: Light `oklch(0.9700 0 0)` / Dark `oklch(0.2690 0 0)`
- **Border**: Light `oklch(0.9220 0 0)` / Dark `oklch(0.2750 0 0)`

## 3. Shapes & Radii

UI components favor soft, approachable edges instead of harsh sharp corners.

- **Base Radius (`--radius`)**: `0.625rem` (10px)
- **Radius LG**: `0.5rem` / `var(--radius)`
- **Radius XL**: `0.75rem` / `calc(var(--radius) + 4px)`

## 4. UI Elements & Details

- **Borders**: All elements default to subtle borders using `--color-border-subtle` (`#e5e7eb`) and outline rings at 50% opacity.
- **Scrollbars**: The application implements a custom modern scrollbar globally:
  - Width/Height: `6px`
  - Track: Transparent
  - Thumb: `#cbd5e1` with a `10px` border radius (changes to `#94a3b8` on hover).
- **Shadows**: Soft, multi-layered drop shadows (`--shadow-sm` through `--shadow-2xl`) using an opacity of `0.1` and `oklch(0 0 0)` for depth.

## 5. Implementation Notes for AI / Code Generation

When generating new components or screens for this project:
1. **Use Tailwind CSS v4 Utility Classes**: Rely on the defined `@theme` variables (e.g., `bg-background`, `text-foreground`, `rounded-[var(--radius)]`, `border-border`).
2. **Icons**: Use `lucide-react` for iconography.
3. **Components**: Build upon `radix-ui` primitives and `shadcn/ui` architecture.
4. **Dark Mode**: Ensure any custom colors or backgrounds support `.dark` variant overrides. Use semantic variables (`bg-card`, `text-muted-foreground`) instead of hardcoded colors like `bg-white` or `text-gray-900` to maintain theme compatibility.
