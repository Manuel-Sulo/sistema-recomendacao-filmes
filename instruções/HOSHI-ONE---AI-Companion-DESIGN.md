---
version: "alpha"
name: "HOSHI ONE - AI Companion"
description: "Hoshi One Footer Section is designed for organizing site-wide navigation, legal links, and utility content. Key features include multi-column navigation groups and clear legal pathways. It is suitable for SaaS websites, product marketing pages, and documentation hubs."
colors:
  primary: "#D81A1D"
  secondary: "#000000"
  tertiary: "#E9A514"
  neutral: "#000000"
  background: "#000000"
  surface: "#D81A1D"
  text-primary: "#111111"
  text-secondary: "#FFFFFF"
  border: "#111111"
  accent: "#D81A1D"
typography:
  display-lg:
    fontFamily: "Oswald"
    fontSize: "224px"
    fontWeight: 600
    lineHeight: "224px"
    letterSpacing: "-0.025em"
    textTransform: "uppercase"
  body-md:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "0.1em"
  label-md:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "28px"
rounded:
  md: "0px"
spacing:
  base: "4px"
  sm: "1.5px"
  md: "2px"
  lg: "4px"
  xl: "6px"
  gap: "1px"
  card-padding: "8px"
  section-padding: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "0px"
  button-link:
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "0px"
  card:
    rounded: "16px"
    padding: "24px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses dark mode with #D81A1D as the main accent and #000000 as the neutral foundation.

- **Primary (#D81A1D):** Main accent and emphasis color.
- **Secondary (#000000):** Supporting accent for secondary emphasis.
- **Tertiary (#E9A514):** Reserved accent for supporting contrast moments.
- **Neutral (#000000):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #000000; Surface: #D81A1D; Text Primary: #111111; Text Secondary: #FFFFFF; Border: #111111; Accent: #D81A1D

- **Gradients:** bg-gradient-to-br from-white to-black/20 via-white/30, bg-gradient-to-t from-black/80 to-transparent via-transparent, bg-gradient-to-br from-white/90 to-black/10 via-white/40, bg-gradient-to-b from-white/80 to-transparent

## Typography

Typography pairs Oswald for display hierarchy with Inter for supporting content and interface copy.

- **Display (`display-lg`):** Oswald, 224px, weight 600, line-height 224px, letter-spacing -0.025em, uppercase.
- **Body (`body-md`):** Inter, 14px, weight 600, line-height 20px, letter-spacing 0.1em.
- **Labels (`label-md`):** Inter, 18px, weight 600, line-height 28px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 1.5px, 2px, 4px, 6px, 8px, 12px, 16px, 20px
- **Section padding:** 24px, 32px, 60px
- **Card padding:** 8px, 24px
- **Gaps:** 1px, 4px, 16px, 24px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.8px #111111; 0.8px #FFFFFF; 1.6px #000000; 0.8px #000000
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.2) 0px 30px 60px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px
- **Blur:** 12px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 2px padding and a 40px radius. Drive the shell with linear-gradient(to right bottom, rgb(255, 255, 255), rgba(255, 255, 255, 0.3), rgba(0, 0, 0, 0.2)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 2px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 2px, 6px, 16px, 38px, 40px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Anchor interactions to the detected button styles. Reuse the existing card surface recipe for content blocks.

### Buttons
- **Primary:** background #D81A1D, text #FFFFFF, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).
- **Links:** text #111111, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

### Cards and Surfaces
- **Card surface:** background rgba(235, 230, 219, 0.9), border 0px solid rgb(229, 231, 235), radius 16px, padding 24px, shadow none, blur 12px.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 2px, 6px, 16px, 38px, 40px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected expressive motion intensity without a deliberate reason.

## Motion

Motion feels expressive but remains focused on interface, text, and layout transitions. Timing clusters around 150ms and 1000ms. Easing favors ease and cubic-bezier(0.4. Hover behavior focuses on color and text changes. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** expressive

**Durations:** 150ms, 1000ms

**Easings:** ease, cubic-bezier(0.4, 0, 0.2, 1)

**Hover Patterns:** color, text, opacity, stroke, mix

**Scroll Patterns:** gsap-scrolltrigger
