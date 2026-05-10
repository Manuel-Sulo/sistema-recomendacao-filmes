---
version: "alpha"
name: "Join the Movement"
description: "Join Movement Onboarding Section is designed for building reusable UI components in modern web projects. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for component libraries and responsive product interfaces."
colors:
  primary: "#F97316"
  secondary: "#3B82F6"
  tertiary: "#E6FF1A"
  neutral: "#0A0A0C"
  background: "#0A0A0C"
  surface: "#FFFFFF"
  text-primary: "#FFFFFF"
  text-secondary: "#121214"
  border: "#2A2A30"
  accent: "#F97316"
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: "180px"
    fontWeight: 900
    lineHeight: "180px"
    letterSpacing: "-0.05em"
  body-md:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "19.5px"
rounded:
  md: "0px"
spacing:
  base: "12px"
  sm: "1px"
  md: "3px"
  lg: "12px"
  xl: "14px"
  gap: "8px"
  card-padding: "12px"
  section-padding: "32px"
components:
  button-link:
    textColor: "{colors.surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "0px"
  card:
    rounded: "9999px"
    padding: "12px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses dark mode with #F97316 as the main accent and #0A0A0C as the neutral foundation.

- **Primary (#F97316):** Main accent and emphasis color.
- **Secondary (#3B82F6):** Supporting accent for secondary emphasis.
- **Tertiary (#E6FF1A):** Reserved accent for supporting contrast moments.
- **Neutral (#0A0A0C):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #0A0A0C; Surface: #FFFFFF; Text Primary: #FFFFFF; Text Secondary: #121214; Border: #2A2A30; Accent: #F97316

- **Gradients:** bg-gradient-to-r from-orange-500/10 to-transparent via-orange-500/5, bg-gradient-to-r from-transparent to-transparent via-orange-400/40, bg-gradient-to-l from-blue-600/10 to-transparent via-blue-600/5, bg-gradient-to-r from-transparent to-transparent via-blue-500/40

## Typography

Typography relies on Inter across display, body, and utility text.

- **Display (`display-lg`):** Inter, 180px, weight 900, line-height 180px, letter-spacing -0.05em.
- **Body (`body-md`):** Inter, 13px, weight 500, line-height 19.5px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 12px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 12px
- **Scale:** 1px, 3px, 12px, 14px, 24px, 28px, 32px, 40px
- **Section padding:** 32px, 112px
- **Card padding:** 12px
- **Gaps:** 8px, 12px, 20px, 24px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.8px #FFFFFF; 1.6px #2A2A30
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(0, 0, 0) 0px 30px 60px -15px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(255, 255, 255, 0.05) 0px 2px 4px 0px inset; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.8) 0px 10px 20px 0px inset, rgba(0, 0, 0, 0.5) 0px 0px 20px 0px
- **Blur:** 40px, 12px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 1px padding and a 9999px radius. Drive the shell with linear-gradient(to right bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 9999px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 9999px
- **Icon sets:** Logos

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Links:** text #FFFFFF, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** border 0px solid rgb(229, 231, 235), radius 9999px, padding 12px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.8) 0px 10px 20px 0px inset, rgba(0, 0, 0, 0.5) 0px 0px 20px 0px.

### Iconography
- **Treatment:** Follow the detected set defaults.
- **Sets:** Logos.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 12px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 150ms and 300ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on text and transform changes. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** moderate

**Durations:** 150ms, 300ms, 3000ms, 500ms

**Easings:** ease, cubic-bezier(0.4, 0, 1), 0.2, 0.6

**Hover Patterns:** text, transform

**Scroll Patterns:** gsap-scrolltrigger
