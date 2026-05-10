---
name: Join the Movement
colors:
  surface: '#1c110b'
  surface-dim: '#1c110b'
  surface-bright: '#45362f'
  surface-container-lowest: '#160c06'
  surface-container-low: '#251913'
  surface-container: '#291d16'
  surface-container-high: '#352720'
  surface-container-highest: '#40322a'
  on-surface: '#f6ded3'
  on-surface-variant: '#e0c0b1'
  inverse-surface: '#f6ded3'
  inverse-on-surface: '#3c2d26'
  outline: '#a78b7d'
  outline-variant: '#584237'
  surface-tint: '#ffb690'
  primary: '#ffb690'
  on-primary: '#552100'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#9d4300'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#bcd200'
  on-tertiary: '#2d3400'
  tertiary-container: '#92a300'
  on-tertiary-container: '#2f3600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#d7ef00'
  tertiary-fixed-dim: '#bcd200'
  on-tertiary-fixed: '#1a1e00'
  on-tertiary-fixed-variant: '#434b00'
  background: '#1c110b'
  on-background: '#f6ded3'
  surface-variant: '#40322a'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 120px
    fontWeight: '900'
    lineHeight: 110px
    letterSpacing: -0.04em
  display-lg:
    fontFamily: Inter
    fontSize: 80px
    fontWeight: '900'
    lineHeight: 88px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 52px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 12px
  xs: 12px
  sm: 24px
  md: 36px
  lg: 60px
  xl: 96px
  gutter: 24px
  margin: 48px
---

## Brand & Style
The design system is built on the "Join the Movement" aesthetic—a high-energy, cinematic style that blends the urgency of modern activism with the premium feel of a prestige streaming service. It aims to evoke a sense of momentum, discovery, and collective enthusiasm.

The style is a hybrid of **Glassmorphism** and **High-Contrast Boldness**. It utilizes extreme typography and vibrant accents to create a "loud" visual hierarchy, while the glass effects provide a sophisticated, multi-layered depth that prevents the interface from feeling flat. The result is an immersive, high-velocity experience tailored for cinephiles who want to feel part of a broader cultural conversation.

## Colors
The palette is rooted in a deep, near-black foundation to allow movie posters and vibrant accents to pop. The primary orange (#F97316) signifies action and energy, while the secondary blue (#3B82F6) provides a calming counterpoint for secondary information. The lime tertiary (#E6FF1A) is used sparingly for critical calls-to-attention or "trending" indicators.

Surface elements use a pure white (#FFFFFF) base but are rarely fully opaque. They function as glass layers that tint and react to the background content. The background (#0A0A0C) remains consistent to maintain the cinematic "lights out" atmosphere.

## Typography
This design system utilizes **Inter** exclusively to maintain a utilitarian yet modern feel. The hierarchy is dominated by "Display" styles—intended to be massive, tightly tracked, and heavy (Weight 900). These should be used for movie titles and section headers to create an editorial, high-impact look.

Body text is set at a Weight 500 to ensure it holds enough visual "weight" against the aggressive headlines and vibrant background elements. On mobile devices, the display sizes scale down aggressively while maintaining their ultra-bold presence to ensure legibility and impact without horizontal scrolling.

## Layout & Spacing
The layout follows a 12-column fluid grid system built on a 12px base rhythm. It is a full-bleed composition where imagery and background gradients extend to the edges of the viewport, while functional content is aligned to the grid.

- **Desktop (1440px+):** 12 columns, 24px gutters, 48px side margins.
- **Tablet (768px-1024px):** 8 columns, 24px gutters, 36px side margins.
- **Mobile (<768px):** 4 columns, 12px gutters, 24px side margins.

Horizontal sections often feature "over-scroll" or carousel behavior to maintain the movement-based feel. Large vertical gaps (96px+) are used between major thematic sections to give the massive typography room to breathe.

## Elevation & Depth
Depth is created through a "Stack of Glass" approach. Surfaces are not solid; they are semi-transparent white layers with a 40px backdrop blur (reduced to 12px for smaller mobile elements). 

Every glass component must feature a dual-border system:
1. An inner "shine" border: 0.8px solid White at 20% opacity.
2. An outer "definition" border: 1.6px solid #2A2A30.

Shadows are deep and dramatic, using the background color (#0A0A0C) with a high spread and low opacity to create a sense of floating layers without introducing "muddy" greys.

## Shapes
The shape language is defined by **Extreme Rounding**. All interactive elements, including buttons, input fields, and movie cards, utilize a 9999px corner radius to create a pill-shaped or "capsule" aesthetic. This softness contrasts with the aggressive, sharp typography, creating a unique visual tension.

When cards contain nested images, the images themselves must inherit this extreme rounding or be clipped into a stadium shape.

## Components
- **Buttons:** Large, pill-shaped containers. Primary buttons use the Orange (#F97316) with black text. Ghost buttons use the glass effect with the dual-border system.
- **Cards (Movie/Show):** Vertical capsules. The image is the primary fill. On hover, a glass overlay slides up from the bottom containing metadata.
- **Chips/Labels:** Small capsules using Secondary Blue or Tertiary Lime. Use Weight 700 for the text within.
- **Input Fields:** 9999px rounded containers with a subtle glass fill. The focus state replaces the outer 1.6px border with the Primary Orange.
- **Navigation:** A fixed glass "dock" at the bottom of the screen (mobile) or a top-aligned glass bar (desktop) with high-intensity backdrop blurs.
- **Scroll Triggers:** Use GSAP to animate section reveals. Typography should "slide and fade" into view with a 300ms duration, while cards should use a staggered 150ms "pop" effect.