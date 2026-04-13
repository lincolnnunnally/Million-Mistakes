{
  "brand": {
    "name": "10 Million Mistakes",
    "tagline_direction": "Bold, countercultural, warm-friend energy. Celebrate failure as fuel. Fire/ember metaphors (burning through mistakes) without looking aggressive.",
    "design_style_fusion": [
      "Bento grid + card layout (calm structure)",
      "Warm ‘ember’ highlights + cool teal counter-accent (emotional balance)",
      "Soft brutalist typography moments (big numbers, strong statements) + friendly rounded surfaces",
      "Subtle grain/noise + paper-like warmth for journaling"
    ]
  },

  "typography": {
    "google_fonts": {
      "display": {
        "family": "Space Grotesk",
        "weights": [400, 500, 600, 700],
        "usage": "Headlines, big counters, level titles. Feels modern + bold without being clinical."
      },
      "body": {
        "family": "Work Sans",
        "weights": [400, 500, 600],
        "usage": "Body copy, form labels, helper text. Warm, readable, neutral."
      },
      "mono_accent": {
        "family": "Azeret Mono",
        "weights": [400, 600],
        "usage": "Optional for ‘Mistakes burned’ counters, admin table IDs, streak metadata."
      }
    },
    "tailwind_font_tokens": {
      "font-display": "['Space Grotesk', 'ui-sans-serif', 'system-ui']",
      "font-body": "['Work Sans', 'ui-sans-serif', 'system-ui']",
      "font-mono": "['Azeret Mono', 'ui-monospace', 'SFMono-Regular']"
    },
    "type_scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-body text-muted-foreground",
      "section_title": "text-xl sm:text-2xl font-display font-semibold",
      "card_title": "text-lg font-display font-semibold",
      "body": "text-sm sm:text-base font-body leading-relaxed",
      "small": "text-xs sm:text-sm font-body text-muted-foreground"
    },
    "copy_tone": {
      "rules": [
        "Never diagnose or therapize. Avoid ‘fix yourself’.",
        "Use ‘try’, ‘experiment’, ‘tiny brave step’.",
        "Celebrate effort: ‘You showed up.’",
        "Use short sentences. One idea per line in mobile."
      ]
    }
  },

  "color_system": {
    "notes": "Hopeful light UI. Warm ember accents + cool teal for balance. Avoid purple. Gradients only as decorative section backgrounds (<=20% viewport).",
    "semantic_tokens_hsl_for_index_css": {
      "background": "36 60% 98%",
      "foreground": "20 25% 12%",
      "card": "0 0% 100%",
      "card-foreground": "20 25% 12%",
      "popover": "0 0% 100%",
      "popover-foreground": "20 25% 12%",

      "primary": "18 92% 52%",
      "primary-foreground": "0 0% 100%",

      "secondary": "36 45% 94%",
      "secondary-foreground": "20 25% 12%",

      "muted": "34 35% 93%",
      "muted-foreground": "22 12% 40%",

      "accent": "173 55% 34%",
      "accent-foreground": "0 0% 100%",

      "destructive": "0 72% 52%",
      "destructive-foreground": "0 0% 100%",

      "border": "28 25% 86%",
      "input": "28 25% 86%",
      "ring": "18 92% 52%",

      "radius": "0.9rem",

      "chart-1": "18 92% 52%",
      "chart-2": "43 92% 55%",
      "chart-3": "173 55% 34%",
      "chart-4": "200 70% 40%",
      "chart-5": "28 70% 55%"
    },
    "hex_palette": {
      "ink": "#241A14",
      "paper": "#FFF7EF",
      "card": "#FFFFFF",
      "ember": "#FF6B35",
      "flame": "#FF7A18",
      "sun": "#FFD166",
      "toast": "#F7B267",
      "teal": "#0F766E",
      "tealSoft": "#D7F3EF",
      "sky": "#0B7285",
      "border": "#E9D7C8"
    },
    "allowed_gradients_decorative_only": {
      "hero_wash": "linear-gradient(135deg, rgba(255,122,24,0.18), rgba(255,209,102,0.14), rgba(15,118,110,0.10))",
      "ember_corner": "radial-gradient(600px circle at 20% 10%, rgba(255,107,53,0.18), transparent 55%)",
      "teal_corner": "radial-gradient(700px circle at 85% 20%, rgba(15,118,110,0.12), transparent 60%)"
    },
    "state_colors": {
      "success": "#0F766E",
      "warning": "#FFD166",
      "info": "#0B7285"
    }
  },

  "design_tokens_css_custom_properties": {
    "add_to_index_css": {
      "--shadow-soft": "0 10px 30px rgba(36, 26, 20, 0.08)",
      "--shadow-ember": "0 12px 30px rgba(255, 107, 53, 0.18)",
      "--ring-offset": "2px",
      "--radius-card": "18px",
      "--radius-pill": "999px",
      "--space-page-x": "clamp(16px, 4vw, 28px)",
      "--space-section-y": "clamp(18px, 4vw, 36px)",
      "--noise-opacity": "0.06"
    },
    "noise_overlay_snippet": {
      "usage": "Apply to large section wrappers only (hero header, onboarding background).",
      "class": "relative",
      "pseudo": "after:absolute after:inset-0 after:pointer-events-none after:opacity-[var(--noise-opacity)] after:bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.35\"/></svg>')] after:mix-blend-multiply"
    }
  },

  "layout_and_grid": {
    "mobile_first": {
      "page_container": "mx-auto w-full max-w-6xl px-[var(--space-page-x)]",
      "section_spacing": "py-[var(--space-section-y)]",
      "bento_grid": "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12",
      "bento_card_span_examples": {
        "daily_challenge": "lg:col-span-7",
        "quick_stats": "lg:col-span-5",
        "vault_preview": "lg:col-span-12"
      }
    },
    "navigation": {
      "user_app": "Mobile: bottom nav (4-5 items). Desktop: left rail + top header.",
      "admin": "Desktop-first: left sidebar + top bar; mobile collapses into Sheet."
    }
  },

  "components": {
    "component_path": {
      "button": "/app/frontend/src/components/ui/button.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "progress": "/app/frontend/src/components/ui/progress.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "carousel": "/app/frontend/src/components/ui/carousel.jsx",
      "form": "/app/frontend/src/components/ui/form.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "textarea": "/app/frontend/src/components/ui/textarea.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "radio_group": "/app/frontend/src/components/ui/radio-group.jsx",
      "switch": "/app/frontend/src/components/ui/switch.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "table": "/app/frontend/src/components/ui/table.jsx",
      "calendar": "/app/frontend/src/components/ui/calendar.jsx",
      "sonner_toasts": "/app/frontend/src/components/ui/sonner.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx"
    },

    "button_system": {
      "shape": "Warm friend + action-first: rounded-xl for standard, pill for primary CTA.",
      "variants": {
        "primary": {
          "tailwind": "rounded-[var(--radius-pill)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-ember)] hover:bg-[hsl(var(--primary))]/90 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
          "notes": "No gradients on small buttons. Use solid ember primary."
        },
        "secondary": {
          "tailwind": "rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]/70",
          "notes": "For ‘Skip’, ‘Later’, ‘Preview’."
        },
        "ghost": {
          "tailwind": "rounded-xl hover:bg-[hsl(var(--muted))]",
          "notes": "For icon buttons in headers."
        }
      },
      "micro_interactions": {
        "hover": "hover:translate-y-[-1px] (only on buttons/cards), shadow intensifies slightly",
        "press": "active:translate-y-[0px] active:scale-[0.99]",
        "loading": "Replace label with spinner + keep width stable"
      }
    },

    "card_system": {
      "base": "rounded-[var(--radius-card)] bg-card text-card-foreground border border-[hsl(var(--border))] shadow-[var(--shadow-soft)]",
      "challenge_card": {
        "accent_strip": "Add a 6px left border: border-l-4 border-l-[hsl(var(--primary))]",
        "header": "Title + ‘Difficulty’ Badge + time estimate chip",
        "cta": "Primary button: ‘Do it now’ + secondary ‘Swap challenge’"
      },
      "reflection_card": {
        "tone": "Paper-like: bg-white with subtle warm tint overlay (bg-[hsl(var(--secondary))]/40)"
      }
    },

    "gamification_components": {
      "streak_chip": {
        "component": "Badge",
        "tailwind": "rounded-full px-3 py-1 bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/20"
      },
      "level_badge": {
        "component": "Badge",
        "tailwind": "rounded-full px-3 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border border-[hsl(var(--primary))]/20"
      },
      "lifetime_counter": {
        "typography": "font-display text-3xl sm:text-4xl",
        "layout": "Big number + small caption. Use mono accent optionally.",
        "animation": "Count-up on mount (prefers-reduced-motion safe)."
      },
      "progress_bar": {
        "component": "Progress",
        "notes": "Use for ‘Mistakes burned: X / 10,000,000’ and level XP. Add label above; never rely on color alone."
      }
    },

    "forms": {
      "reflection_form": {
        "structure": [
          "Q1: What did you attempt?",
          "Q2: What went sideways (facts only)?",
          "Q3: What did you learn?",
          "Q4: What’s the next tiny brave step?"
        ],
        "components": ["Form", "Textarea", "Input", "Select"],
        "layout": "Single column, generous spacing (gap-5). Sticky bottom submit bar on mobile.",
        "validation": "Inline helper text; avoid red-heavy scolding. Use neutral copy + destructive only for critical errors."
      }
    },

    "mantras": {
      "carousel": {
        "component": "Carousel",
        "card": "Card with big quote, small attribution, Save button",
        "interaction": "Swipe on mobile; arrow buttons on desktop; subtle snap + scale on active slide"
      }
    },

    "admin_dashboard": {
      "tone": "Professional, clean, still on-brand via accent colors only.",
      "layout": "Sidebar + Table + Filters row.",
      "components": ["Table", "Tabs", "Dialog", "DropdownMenu", "Pagination", "Input", "Select"],
      "table_density": "Use compact rows, sticky header, zebra via muted background (bg-muted/40)."
    }
  },

  "page_blueprints": {
    "welcome_landing": {
      "layout": "Hero (max 20% gradient wash) + 3 value props + social proof + CTA.",
      "hero": {
        "headline": "‘Make 10,000,000 mistakes. On purpose.’",
        "sub": "Warm friend tone. One sentence per line.",
        "cta": "Start the journey",
        "visual": "Abstract warm background + small flame icon motif (lucide Flame)."
      }
    },
    "onboarding_quiz": {
      "pattern": "Journey steps with progress indicator (4 stages).",
      "components": ["Progress", "Card", "RadioGroup", "Button"],
      "interaction": "Each step animates in (slide + fade). Provide ‘Back’ and ‘Save & exit’."
    },
    "domain_selection": {
      "pattern": "4 domain cards in 2x2 grid on mobile (stacked), bento on desktop.",
      "interaction": "Card hover lifts; selected state shows teal ring + ember check."
    },
    "home_dashboard": {
      "bento": [
        "Daily micro-challenge card (primary)",
        "Quick stats (streak, level, today’s burn)",
        "Mantra teaser carousel"
      ]
    },
    "reflection": {
      "moment": "Celebration after submit: confetti + ‘Mistake burned’ increment + shareable card preview.",
      "components": ["Form", "Textarea", "Dialog", "Sonner"],
      "post_submit": "Show a modal with 3 actions: ‘Save to Vault’, ‘Do another tiny step’, ‘Back home’."
    },
    "victory_vault": {
      "pattern": "Search + filters + masonry-ish card list (use CSS columns or grid).",
      "components": ["Input", "Select", "Card", "Badge", "Pagination"],
      "empty_state": "Warm illustration + ‘Your first lesson is waiting on the other side of one attempt.’"
    },
    "progress": {
      "pattern": "Top: lifetime counter + progress bar. Middle: streak calendar. Bottom: badges grid.",
      "components": ["Progress", "Calendar", "Card", "Badge"],
      "calendar_note": "Use shadcn Calendar; highlight streak days with ember dot + teal outline for today."
    }
  },

  "motion_and_microinteractions": {
    "library": {
      "recommended": [
        {
          "name": "framer-motion",
          "why": "Entrance transitions, stepper animations, subtle card hover, reduced-motion handling.",
          "install": "npm i framer-motion"
        },
        {
          "name": "canvas-confetti",
          "why": "Lightweight confetti for reflection celebration.",
          "install": "npm i canvas-confetti"
        },
        {
          "name": "react-countup",
          "why": "Count-up for ‘Mistakes burned’ and level XP.",
          "install": "npm i react-countup"
        }
      ]
    },
    "principles": {
      "durations": {
        "fast": "120-160ms",
        "base": "180-240ms",
        "slow": "320-420ms"
      },
      "easing": "Use ease-out for entrances; ease-in-out for toggles. Avoid springy chaos.",
      "entrances": "Cards: y: 8 -> 0, opacity 0 -> 1",
      "celebration": "Confetti only on reflection submit + milestone levels (e.g., every 25 mistakes).",
      "reduced_motion": "Respect prefers-reduced-motion: disable confetti + count-up becomes instant."
    },
    "no_transition_all_rule": "Never use transition: all. Use transition-colors, transition-shadow, transition-opacity only."
  },

  "accessibility": {
    "rules": [
      "WCAG AA contrast for text on warm backgrounds (use ink #241A14 on paper #FFF7EF).",
      "Never use color alone to indicate streak/selected; add icon + label.",
      "Focus states: visible ring using --ring; ensure ring-offset on light backgrounds.",
      "Emotional safety: error copy is neutral (‘Let’s try that again’) not shaming."
    ],
    "keyboard": "All dialogs, carousels, menus must be keyboard navigable (shadcn defaults help)."
  },

  "data_testid_convention": {
    "rule": "All interactive and key informational elements MUST include data-testid in kebab-case describing role.",
    "examples": [
      "data-testid=\"welcome-start-button\"",
      "data-testid=\"onboarding-step-next-button\"",
      "data-testid=\"daily-challenge-swap-button\"",
      "data-testid=\"reflection-form-submit-button\"",
      "data-testid=\"mistakes-burned-counter\"",
      "data-testid=\"admin-users-search-input\""
    ]
  },

  "image_urls": {
    "hero_backgrounds": [
      {
        "url": "https://images.unsplash.com/photo-1656188505561-19f1a1b6cda8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHx3YXJtJTIwZnJpZW5kbHklMjBwZXJzb25hbCUyMGdyb3d0aCUyMGpvdXJuYWxpbmclMjBhcHAlMjBhYnN0cmFjdCUyMGdyYWRpZW50JTIwYmFja2dyb3VuZHxlbnwwfHx8b3JhbmdlfDE3NzYwOTIxOTZ8MA&ixlib=rb-4.1.0&q=85",
        "category": "landing-hero",
        "description": "Warm abstract wash for hero background (use as subtle overlay, not full-bleed heavy)."
      },
      {
        "url": "https://images.unsplash.com/photo-1617957718614-8c23f060c2d0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwyfHx3YXJtJTIwZnJpZW5kbHklMjBwZXJzb25hbCUyMGdyb3d0aCUyMGpvdXJuYWxpbmclMjBhcHAlMjBhYnN0cmFjdCUyMGdyYWRpZW50JTIwYmFja2dyb3VuZHxlbnwwfHx8b3JhbmdlfDE3NzYwOTIxOTZ8MA&ixlib=rb-4.1.0&q=85",
        "category": "onboarding-background",
        "description": "Orange/blue illustration for onboarding journey screens; pair with noise overlay."
      }
    ],
    "texture_accents": [
      {
        "url": "https://images.unsplash.com/photo-1564934304075-d24ebbbde6f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHx0ZWFsJTIwd2FybSUyMG9yYW5nZSUyMGFic3RyYWN0JTIwdGV4dHVyZSUyMGJhY2tncm91bmQlMjBzdWJ0bGUlMjBncmFpbnxlbnwwfHx8dGVhbHwxNzc2MDkyMTk5fDA&ixlib=rb-4.1.0&q=85",
        "category": "section-texture",
        "description": "Teal rainy texture for subtle section divider backgrounds (very low opacity)."
      }
    ]
  },

  "instructions_to_main_agent": {
    "global_css_updates": [
      "Replace default shadcn tokens in /app/frontend/src/index.css :root with the provided semantic_tokens_hsl_for_index_css (keep dark mode tokens but app can default to light).",
      "Remove any centered layout defaults; do not add .App { text-align:center }.",
      "Prefer Tailwind utilities; only add CSS for noise overlay + special hero background wrappers."
    ],
    "app_css_cleanup": [
      "Current /app/frontend/src/App.css contains CRA demo styles (App-logo/App-header). Remove or stop using these classes in production UI."
    ],
    "component_usage": [
      "Use shadcn/ui components from /app/frontend/src/components/ui (JS files). Do not use raw HTML dropdown/calendar/toast.",
      "Use Sonner for toasts (already present).",
      "Calendar for streak view must use shadcn Calendar component."
    ],
    "celebration": [
      "Implement confetti on reflection submit using canvas-confetti; gate behind prefers-reduced-motion.",
      "Animate counters (mistakes burned, streak) with react-countup; fallback to static for reduced motion."
    ],
    "admin": [
      "Admin dashboard uses same tokens but less decoration: no noise overlays, no gradients; rely on clean tables, filters, dialogs."
    ],
    "testing": [
      "Add data-testid to all interactive and key informational elements (buttons, inputs, counters, cards with critical info)."
    ]
  }
}

---

<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
