# F9XR Team — Website Design Document

> **Architects of Digital Precision**  
> A full-service digital agency website built as a static site on GitHub Pages.

---

## 1. Brand Identity

| Attribute | Value |
|-----------|-------|
| **Name** | F9XR Team |
| **Tagline** | Architects of Digital Precision |
| **Motto** | Engineering Digital Growth |
| **Voice** | Technical, authoritative, confident, bold |
| **Audience** | Local businesses, influencers, global brands, SaaS, B2B enterprises |
| **Origin** | India → Global |

### Brand Pillars

- Amazing Design
- AI-Powered Solutions
- Brand Growth
- High Performance SEO
- Modern Architectures

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| Markup | Hand-authored HTML5 |
| Styling | Tailwind CSS 3.4.17 (compiled via CLI) |
| Custom CSS | `skeleton.css`, `transactions.css`, `llm-cta.css`, `directories.css` |
| JavaScript | Vanilla JS (no framework) |
| Icons | Font Awesome 6.5.0 (lazy-loaded) |
| Fonts | Google Fonts — Plus Jakarta Sans (300–800) |
| Animations | GSAP 3.12.5 + ScrollTrigger |
| Forms | Formspree |
| Scheduling | Cal.com embed |
| Chat | TailorTalk WhatsApp widget |
| Analytics | Google Analytics 4 + Microsoft Clarity |
| Hosting | GitHub Pages (static) |
| AI Discovery | `llms.txt`, `ai.txt`, WebMCP context provider |
| Structured Data | Schema.org JSON-LD (Organization, FAQ, HowTo, Review, Service, etc.) |

---

## 3. Color Palette

| Name | Hex | Role |
|------|-----|------|
| Carbon Black | `#212529` | Primary background, dark sections |
| Gunmetal | `#343a40` | Card backgrounds, secondary surfaces |
| Iron Grey | `#495057` | Muted text, subtle borders |
| Platinum | `#e9ecef` | Secondary text, subtle UI elements |
| Bright Snow | `#f8f9fa` | White text, light cards, button backgrounds |
| Accent Blue | `#3b82f6` | CTAs, links, highlights, icons (primary accent) |

Additional backgrounds: `#0a0a0a` for mega menus and footer.

---

## 4. Typography

| Property | Value |
|----------|-------|
| **Family** | Plus Jakarta Sans |
| **Weights** | 300, 400, 500, 600, 700, 800 |
| **Headings** | `font-black` (800), `uppercase`, `italic`, `tracking-tighter` |
| **Body** | Frequent italic usage for copy |
| **Labels** | Bold, uppercase, narrow tracking |
| **Sizes** | `text-[9px]` (badge labels) → `text-8xl` / `text-[8rem]` (hero) |
| **Effects** | Outlined text (`text-stroke`), gradient text (`bg-clip-text`) |

---

## 5. Layout & Visual System

### Design Principles

- **Dark theme only** — no user-facing light mode toggle
- **Glassmorphism** — frosted-glass nav bar (`backdrop-filter: blur(20px)`, semi-transparent black)
- **Generous rounding** — signature large radii: `rounded-[2.5rem]`, `rounded-[3rem]`, `rounded-[4rem]`
- **Ambient glow** — radial gradient blobs (`bg-accent-blue/5`, `blur-[120px]`) as background decoration
- **Grid overlay** — subtle CSS grid lines on hero and dark sections
- **Blue-tinted shadows** — `shadow-[0_0_40px_rgba(59,130,246,0.3)]`

### Page Structure

```
Full-page skeleton loader (shimmer, 800ms minimum)
├── Fixed glassmorphism pill navigation
├── Full-screen sections separated by <hr class="border-white/5">
├── Marquee ticker (footer area)
├── Footer (4-column grid + social icons)
└── Search modal (full-screen overlay)
```

---

## 6. Navigation

### Desktop

Floating pill-shaped glassmorphism bar (`top-6`):

```
[Logo: F9XR Team]
[Company ▾]  [Services ▾]  [Works ▾]  [🔍 Search]
                                [Hire Us →]
```

- **Company mega menu:** About Us, Customer Stories, Hire Us, legal links
- **Services mega menu:** View All Services + 7 service links in 2-column grid
- **Works mega menu:** Portfolio, Projects, Tools, Blog, Directories
- Smart hide on scroll down, show on scroll up

### Mobile

Full-screen overlay (`bg-carbon-black/95`, `backdrop-blur-[40px]`) with large `text-5xl` links and social icons.

### Keyboard Shortcuts

`H` → Home, `S` → Services, `P` → Portfolio, `C` → Contact

---

## 7. Page Inventory

### Primary Pages (`/pages/`)

| File | Description |
|------|-------------|
| `index.html` | Homepage — all major sections |
| `about.html` | Team philosophy, mission, bios |
| `services.html` | Services overview |
| `contact.html` | Contact form, WhatsApp, social links |
| `portfolio.html` | Project gallery |
| `projects.html` | Detailed project listings |
| `case-studies.html` | Customer success stories |
| `partners.html` | Backend crew & technical partners |
| `expert-bio.html` | Lead Digital Architect bio |
| `sitemap.html` | Full site index |
| `thanks.html` | Post-submission thank-you |

### Service Pages (`/services/`)

| File | Service |
|------|---------|
| `ai-visibility-optimization.html` | AI Visibility Optimization |
| `data-management.html` | Data Entry & Management |
| `google-business-optimization.html` | Google Business Profile / Local SEO |
| `indian-professionals.html` | Websites for Indian Professionals |
| `social-media-posting.html` | Social Media Posting |
| `website-rentals.html` | Website Rentals (pay-monthly) |
| `discord-bot-development.html` | Discord Bot Development |
| `telegram-bot-development.html` | Telegram Bot Development |
| `talent-brand-management.html` | Talent & Brand Management |
| `we-do-for-you.html` | Done-for-You Services |

### Tools (`/tools/`)

| File | Tool |
|------|------|
| `website-cost.html` | Website Cost Calculator |
| `local-seo-score.html` | Local SEO Score Calculator |
| `gbp-checker.html` | GBP Completeness Checker |
| `freelancer-quote.html` | Freelancer Quote Generator |
| `redesign-calculator.html` | Website Redesign Calculator |
| `marketing-budget.html` | Marketing Budget Calculator |
| `digital-presence.html` | Digital Presence Score Calculator |
| `hashtag-generator.html` | Social Hashtag Generator |

### Directories (`/directories/`)

| File | Directory |
|------|-----------|
| `product-launch-directories.html` | Product Launch Sites |
| `pdf-submission-portals.html` | PDF Submission Platforms |
| `business-listing-sites.html` | Business Listing Sites |
| `free-backlink-creation-sites.html` | Free Backlink Sites |

### Legal (`/legals/`)

| File | Document |
|------|----------|
| `agreement.html` | Service Agreement |
| `terms.html` | Terms of Service |
| `privacy.html` | Privacy Policy |
| `refund.html` | Refund & Cancellation Policy |
| `shipping.html` | Shipping & Delivery Policy |
| `freelancer.html` | Freelancer Agreement |

### Other

| File | Description |
|------|-------------|
| `404.html` | Custom error page ("Blueprint Not Found") |
| `announcements/` | Partnership announcements |

---

## 8. Homepage Sections

The homepage (`index.html`) is the largest file (~3,461 lines) with these sections in order:

| # | Section | Description |
|---|---------|-------------|
| 1 | **Hero** | Full-viewport. Video button, "Empowering Brands." heading, gradient text, CTA buttons, community avatars + counter |
| 2 | **Stats Bar** | Animated counters — 50+ Projects, 15+ AI Integrations, 99% Retention, 24/5 Support |
| 3 | **Video Modal** | YouTube embed — "What & How We Do?" |
| 4 | **Process** | 4-step accordion — Discovery & Audit → Strategy & Design → Execution & Logic → Optimization & Growth |
| 5 | **Problems** | "Is Your Growth Leaking?" targeting verticals — Local Business, Influencers, Global Brands, Companies |
| 6 | **Services** | "Strategic Solutions" grid — Website Ecosystems, Local SEO Dominance, Elite Tech Maintenance, Business Infrastructure |
| 7 | **About** | Team identity, philosophy, tags (#Results_Focused, #AI_Integration, #Speed_Masters) |
| 8 | **Features** | "Core Strengths" — Performance First, Security & Backups, Niche AI Logic |
| 9 | **Case Studies** | 3-card stack with perspective transform, click to cycle |
| 10 | **Portfolio** | Browser-mockup project cards — iCryptos Dashboards, Foil AI, VroAI Chatbot + "40+ More" |
| 11 | **Testimonials** | Horizontal scroll slider, 6 client cards |
| 12 | **Pricing** | Starter Website vs Growth Pack side-by-side |
| 13 | **Blog** | "The Journal" — external Blogger feed via JSONP |
| 14 | **Contact** | Email/WhatsApp toggle, Formspree form, Cal.com booking embed |
| 15 | **FAQ** | 7-question expandable accordion |
| 16 | **Footer** | Full footer with nav, socials, legal links, marquee ticker |

---

## 9. Key Components

### Glassmorphism Navigation
- Fixed top, pill-shaped, `backdrop-filter: blur(20px)`
- Semi-transparent `rgba(33, 37, 41, 0.7)` background
- Smart scroll behavior (hide down, show up)

### Skeleton Loader
- Full-page overlay with shimmer animation
- Logo placeholder, progress bar, loading text
- Minimum 800ms display, fades out on `window.load`
- Supports `prefers-reduced-motion`

### Card Stack (Case Studies)
- 3 stacked cards with CSS perspective transform
- Click top card → animates to bottom (600ms cubic-bezier)
- Color-coded: purple (Modular Systems), green (99.9% Uptime), blue (Fluid Interaction)

### Portfolio Cards
- Browser-window mockup (traffic-light dots + URL bar)
- Background image with gradient overlay
- Hover: scale image, slide up overlay, show external link button

### Testimonial Slider
- Horizontal scroll with CSS snap points
- Arrow buttons for navigation
- White cards with dark quotes, author initials, names, titles

### Search Modal
- Full-screen overlay with live input
- Client-side search against 44-item index
- Results as styled links with hover effects

### Process Accordion
- 4 expandable steps with image, description, deliverable badges, CTA
- Plus icon rotates on open, smooth max-height transition

### Contact Form
- Toggle between Email (Formspree) and WhatsApp
- Gradient focus rings, icon-prefixed inputs
- Honeypot spam protection

### Marquee Ticker
- Infinite horizontal scroll (30s loop)
- Pauses on hover
- Keywords: Amazing Design, AI-Powered Solutions, Brand Growth, etc.

### Click Spark
- Custom `<click-spark>` web component
- Spawns particle effects on mouse click

---

## 10. Animations & Interactions

### GSAP / ScrollTrigger
- `.reveal` elements fade in + slide up on scroll
- Hero title parallax (`yPercent: 50`, scrub)

### CSS Animations
| Animation | Description |
|-----------|-------------|
| `animate-float` | 6s ease-in-out floating effect |
| `animate-marquee` | 30s infinite horizontal scroll |
| `animate-pulse` | Pulsing icon |
| `animate-bounce` | WhatsApp icon |
| `animate-header-entry` | 0.8s slide-down on load |
| View Transitions API | Cross-page fade (old out left, new in right) |

### Hover Effects
- Cards: scale up, border → accent-blue, background lighten
- Buttons: scale, background swap, icon translate
- Images: grayscale → color, scale
- Mega menus: opacity + translateY slide (300ms ease-out)

### Interactive Features
- **Stats Counter** — IntersectionObserver triggers count-up animation
- **Video Modal** — YouTube embed, closes on overlay/Escape
- **Mobile Menu** — Full-screen overlay with animated links
- **Keyboard Navigation** — H, S, P, C shortcuts
- **Cal.com Booking** — Embedded calendar for consultations
- **TailorTalk Widget** — Floating WhatsApp chat

---

## 11. SEO & AI Discovery

### Structured Data (JSON-LD)
Organization, WebSite, ProfilePage, FAQPage, HowTo, Review, BreadcrumbList, Service, ContactPage, ProfessionalService

### Meta / Social
- Open Graph + Twitter Card on every page
- Multiple sitemaps: `sitemap.xml`, `sitemap-image.xml`, `sitemap-video.xml`

### AI-Specific Files
| File | Purpose |
|------|---------|
| `llms.txt` | Concise site summary for LLMs |
| `llms-full.txt` | Full detailed site context for LLMs |
| `ai.txt` | AI agent discovery |
| `.well-known/agent-skills/index.json` | Agent skill definitions |
| WebMCP | Browser-level `navigator.modelContext.provideContext()` |

### Other
`robots.txt`, `opensearch.xml`, `humans.txt`, `ads.txt`, `dublin.rdf`, `.well-known/security.txt`

---

## 12. File Structure

```
f9xr.github.io/
├── index.html                          # Homepage (3,461 lines)
├── 404.html                            # Custom 404
├── error.html                          # Redirects to 404
├── package.json                        # tailwindcss dev dependency
├── tailwind.config.js                  # Custom theme (colors, fonts)
├── robots.txt
├── sitemap.xml / sitemap-image.xml / sitemap-video.xml
├── llms.txt / llms-full.txt / ai.txt
├── humans.txt / ads.txt / gpc.txt / opensearch.xml / dublin.rdf
├── src/
│   └── input.css                       # Tailwind directives only
├── assets/
│   ├── css/
│   │   ├── tailwind.css                # Compiled Tailwind output
│   │   ├── skeleton.css                # Skeleton loading system
│   │   ├── transactions.css            # Transaction viewer styles
│   │   ├── llm-cta.css                # LLM CTA widget styles
│   │   └── directories.css            # Directory listing styles
│   ├── js/
│   │   ├── layout.js                   # Dynamic nav/footer injection
│   │   ├── skeleton.js                 # Skeleton loader logic
│   │   └── search-index.js            # 44-item search index
│   ├── images/                         # Branding, illustrations
│   ├── screenshots/                    # Portfolio screenshots
│   ├── F9XR Team Brandbook by Pomelli.pdf
│   └── favicons/                       # Multi-size favicons
├── pages/                              # Primary pages (12 files)
├── services/                           # Service detail pages (10 files)
├── tools/                              # Interactive calculator tools (8 files)
├── directories/                        # Resource directory pages (4 files)
├── legals/                             # Legal & policy pages (6 files)
├── announcements/                      # Partnership announcements
└── .well-known/                        # Security, OAuth, agent skills
```

---

## 13. Build & Deployment

```bash
# Build Tailwind CSS
npx tailwindcss -i ./src/input.css -o ./assets/css/tailwind.css --minify

# Deploy
# Push to main branch → GitHub Pages auto-deploys
```

- No bundler or framework — pure static HTML
- Only build step is Tailwind CSS compilation
- Blog hosted externally (Blogger) via JSONP
- Forms handled by Formspree (no backend)
- Scheduling via Cal.com embed (no backend)

---

## 14. Design Philosophy

The F9XR website embodies a **precision engineering** aesthetic — dark, technical, and premium. Key design decisions:

1. **Dark-first** — Black backgrounds with white text create a high-contrast, modern, authoritative feel
2. **Blue accent restraint** — `#3b82f6` is used sparingly for CTAs and highlights, maintaining visual hierarchy
3. **Dramatic typography** — Heavy weights, italics, uppercase, and extreme sizes create impact and visual rhythm
4. **Industrial language** — Terms like "precision", "architecture", "engineering", "blueprint" reinforce the brand metaphor
5. **Large radii** — Generous rounding on cards and sections softens the dark theme, adding warmth and approachability
6. **Ambient depth** — Glowing shadows, gradient blurs, and glassmorphism create a sense of layered space
7. **Motion as polish** — Scroll-triggered reveals, hover states, and micro-interactions add refinement without distraction
8. **AI-forward** — WebMCP, LLMs.txt, and AI visibility services position the brand at the cutting edge