---
version: "alpha"
name: "Modern Intelligent Workspace"
description: "Modern Intelligent Dashboard Section is designed for demonstrating application workflows and interface hierarchy. Key features include clear information density, modular panels, and interface rhythm. It is suitable for product showcases, admin panels, and analytics experiences."
colors:
  primary: "#9333EA"
  secondary: "#F43F5E"
  tertiary: "#C084FC"
  neutral: "#F1F5F9"
  background: "#FFFFFF"
  surface: "#F8FAFC"
  text-primary: "#64748B"
  text-secondary: "#0F172A"
  border: "#F1F5F9"
  accent: "#9333EA"
typography:
  display-lg:
    fontFamily: "System Font"
    fontSize: "48px"
    fontWeight: 600
    lineHeight: "48px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "System Font"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22.75px"
spacing:
  base: "4px"
  sm: "1px"
  md: "2px"
  lg: "4px"
  xl: "6px"
  gap: "6px"
  card-padding: "8px"
  section-padding: "32px"
components:
  card:
    backgroundColor: "{colors.background}"
    rounded: "32px"
    padding: "40px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses light mode with #9333EA as the main accent and #F1F5F9 as the neutral foundation.

- **Primary (#9333EA):** Main accent and emphasis color.
- **Secondary (#F43F5E):** Supporting accent for secondary emphasis.
- **Tertiary (#C084FC):** Reserved accent for supporting contrast moments.
- **Neutral (#F1F5F9):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #FFFFFF; Surface: #F8FAFC; Text Primary: #64748B; Text Secondary: #0F172A; Border: #F1F5F9; Accent: #9333EA

- **Gradients:** bg-gradient-to-r from-purple-300 to-rose-300 via-fuchsia-300, bg-gradient-to-b from-rose-50 to-transparent, bg-gradient-to-r from-rose-300 to-orange-300, bg-gradient-to-b from-orange-50/50 to-white

## Typography

Typography relies on System Font across display, body, and utility text.

- **Display (`display-lg`):** System Font, 48px, weight 600, line-height 48px, letter-spacing -0.025em.
- **Body (`body-md`):** System Font, 14px, weight 400, line-height 22.75px.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 4px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 4px
- **Scale:** 1px, 2px, 4px, 6px, 8px, 10px, 12px, 16px
- **Section padding:** 32px, 40px, 96px
- **Card padding:** 8px, 10px, 14px, 16px
- **Gaps:** 6px, 8px, 12px, 16px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.8px #F1F5F9; 0.8px #F3E8FF; 0.8px #FFFFFF; 0.8px #F8FAFC
- **Shadows:** rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.04) 0px 8px 30px 0px; rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(168, 85, 247, 0.1) 0px 10px 15px -3px, rgba(168, 85, 247, 0.1) 0px 4px 6px -4px
- **Blur:** 12px, 4px, 8px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 1px padding and a 9999px radius. Drive the shell with linear-gradient(to right, rgb(216, 180, 254), rgb(240, 171, 252), rgb(253, 164, 175)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 4px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 4px, 8px, 12px, 16px, 32px, 9999px
- **Icon treatment:** Linear
- **Icon sets:** Solar

## Components

Reuse the existing card surface recipe for content blocks.

### Cards and Surfaces
- **Card surface:** background #FFFFFF, border 0.8px solid rgb(241, 245, 249), radius 32px, padding 40px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.04) 0px 8px 30px 0px.
- **Card surface:** border 0.8px solid rgb(241, 245, 249), radius 16px 16px 0px 0px, padding 13px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px.
- **Card surface:** background rgba(255, 255, 255, 0.6), border 0.8px solid rgb(241, 245, 249), radius 16px, padding 16px, shadow rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px, blur 12px.

### Iconography
- **Treatment:** Linear.
- **Sets:** Solar.

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 4px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 4px, 8px, 12px, 16px, 32px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected minimal motion intensity without a deliberate reason.

## Motion

Motion stays restrained and interface-led across text, layout, and scroll transitions. Easing favors ease. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** minimal

**Easings:** ease

**Scroll Patterns:** gsap-scrolltrigger

## WebGL

Reconstruct the graphics as a full-bleed background field using webgl, custom shaders. The effect should read as technical, meditative, and atmospheric: dot-matrix particle field with white and sparse spacing. Build it from dot particles + soft depth fade so the effect reads clearly. Animate it as slow breathing pulse. Interaction can react to the pointer, but only as a subtle drift. Preserve dom fallback.

**Id:** webgl

**Label:** WebGL

**Stack:** WebGL

**Insights:**
  - **Scene:**
    - **Value:** Full-bleed background field
  - **Effect:**
    - **Value:** Dot-matrix particle field
  - **Primitives:**
    - **Value:** Dot particles + soft depth fade
  - **Motion:**
    - **Value:** Slow breathing pulse
  - **Interaction:**
    - **Value:** Pointer-reactive drift
  - **Render:**
    - **Value:** WebGL, custom shaders

**Techniques:** Dot matrix, Breathing pulse, Pointer parallax, Shader gradients, Noise fields

**Code Evidence:**
  - **HTML reference:**
    - **Language:** html
    - **Snippet:**
      ```html
      <!-- WebGL Background Canvas -->
      <canvas id="glcanvas" class="fixed inset-0 w-full h-full -z-10 pointer-events-none opacity-[0.35]"></canvas>

      <main class="relative max-w-[1280px] mx-auto px-4 py-12 md:py-24 lg:px-8">
      ```
  - **JS reference:**
    - **Language:** js
    - **Snippet:**
      ```
      // --- WebGL Background Animation ---
      const canvas = document.getElementById('glcanvas');
      const gl = canvas.getContext('webgl');

      if (gl) {
          // Resize canvas
          function resize() {
              canvas.width = window.innerWidth;
      ```
  - **Renderer setup:**
    - **Language:** js
    - **Snippet:**
      ```
      // --- WebGL Background Animation ---
      const canvas = document.getElementById('glcanvas');
      const gl = canvas.getContext('webgl');

      if (gl) {
          // Resize canvas
          function resize() {
      ```
