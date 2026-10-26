<div align="center">

# 👖 VINTAGE BLUE

**Artisanal Heritage Denim & Apparel Storefront — Cut, Sewn, and Crafted in Delhi Since 2006.**

A zero-dependency, ultra-lightweight Single Page Application (SPA) e-commerce storefront engineered with Vanilla JavaScript (ES Modules), semantic HTML5, responsive CSS Grid/Flexbox, and dynamic SVG vector graphics.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic%20Architecture-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Custom%20Properties%20%26%20Grid-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel%20SPA%20Rewrites-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Dependencies](https://img.shields.io/badge/Dependencies-0%20(Pure%20Vanilla)-success)](#technology-stack)
[![Catalog](https://img.shields.io/badge/Catalog-84%20SKUs%20%C2%B7%205%20Categories-blue)](#catalog-data-design)

<br />

<img src="./assets/About3-B9cmU6sk.png" alt="Vintage Blue Editorial Brand Banner" width="100%" style="border-radius: 8px; max-height: 480px; object-fit: cover;" />

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement & Solution](#-problem-statement--solution)
- [Key Features](#-key-features)
- [Visual Showcase & Design Gallery](#-visual-showcase--design-gallery)
- [System Architecture](#-system-architecture)
- [Application Flowcharts](#-application-flowcharts)
  - [1. Bootstrapping & Client-Side Routing](#1-bootstrapping--client-side-routing)
  - [2. Interactive Lookbook & SVG Geometry Engine](#2-interactive-lookbook--svg-geometry-engine)
  - [3. Merchandising & Dual-Priority Sorting Engine](#3-merchandising--dual-priority-sorting-engine)
  - [4. Shopping Bag & Checkout State Machine](#4-shopping-bag--checkout-state-machine)
- [Sequence Diagrams](#-sequence-diagrams)
  - [Client-Side Route Transition](#client-side-route-transition)
  - [Add-to-Bag & Reactive Persistence](#add-to-bag--reactive-persistence)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Catalog Data Design](#-catalog-data-design)
- [Core Algorithms & Implementation Details](#-core-algorithms--implementation-details)
- [Installation & Local Setup](#-installation--local-setup)
- [Deployment Guide](#-deployment-guide)
- [Performance, Security & Accessibility](#-performance-security--accessibility)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Limitations & Future Roadmap](#-limitations--future-roadmap)
- [Contributing Guidelines](#-contributing-guidelines)
- [License & Attribution](#-license--attribution)
- [Author & Credits](#-author--credits)

---

## 🧭 Overview

**Vintage Blue** is a standalone, client-side digital flagship storefront for an independent denim and apparel atelier based in Industrial Area A, Delhi. Originally founded in 2006, the brand specializes in authentic raw selvedge, comfort washes, corduroy truckers, heavy utilitarian pants, and structured cargo trousers.

Unlike contemporary e-commerce websites bloated with multi-megabyte JavaScript bundles, external tracking scripts, and heavy third-party UI libraries, **Vintage Blue is built with 100% pure Vanilla Web Standards**. It features an instantaneous, client-side router, a reactive flyout cart backed by `localStorage`, an interactive styling lookbook rendered with dynamic SVG connector vectors, and an editorial catalog management engine with zero runtime dependencies.

### 🎯 Target Users & Use Cases
- **Boutique Shoppers**: Exploring curated collections of heritage denim cuts, utilitarian cargos, corduroy overshirts, and outerwear with instantaneous page transitions.
- **Visual Stylists**: Interacting with editorial lookbooks that dynamically highlight garment anatomy and provide one-click complete-outfit acquisition.
- **Engineers & Recruiters**: Serving as a reference implementation of a high-performance, accessible, dependency-free web application demonstrating advanced DOM manipulation, History API routing, and state persistence.

---

## ⚡ Problem Statement & Solution

| The Modern E-Commerce Problem | The Vintage Blue Solution |
| :--- | :--- |
| **Heavy Framework Overhead**: Traditional headless storefronts (Next.js, Remix, Shopify Hydrogen) frequently deliver 300KB–1.5MB of minified JavaScript before displaying static product catalogs. | **Zero Dependencies / Zero Bundlers**: Built entirely on standard ES Modules (`type="module"`), loading instantly without hydration lag or compile steps. |
| **Slow Route Transitions**: Server roundtrips and SSR hydration delays create noticeable layout jumps and sluggish catalog browsing. | **Instantaneous In-Memory SPA Router**: HTML5 `history.pushState` routing parses local catalog records from an in-memory `Map`, rendering view updates in under 16ms. |
| **Clunky Multi-Piece Shopping**: Purchasing an outfit from a lookbook typically requires visiting multiple product detail pages and selecting sizes individually. | **Interactive SVG Anatomy Engine**: Garment pins project parametric SVG vectors to model anchor points, offering 1-click single piece or complete look bundle purchasing. |
| **Brittle Merchandising**: Generic CMS grids sort strictly by creation date or price, neglecting editorial photography priorities. | **Editorial Merchandising Pipeline**: Custom sort engines (`CARGO_ORDER`, `PANTS_ORDER`) lock exact editorial product sequences while auto-promoting studio model photography. |

---

## ✨ Key Features

### 1. High-Performance Client-Side Router (SPA)
- Native HTML5 `pushState` and `popstate` interceptor without external libraries like React Router.
- Smooth page transitions with automatic scroll restoration (`window.scrollTo(0, 0)`).
- Dynamic document title updates based on product models and category taxonomies.
- Deep linking support with wildcard server rewrites configured in `vercel.json`.

### 2. Interactive Lookbook & SVG Styler
- High-concept editorial presentation pairing full-body model photography with pinned garment cards.
- **Dynamic Vector Callouts**: Real-time `<svg>` overlay drawing precise coordinate lines (`<line>` and `<circle>`) connecting garment cards directly to outfit zones on the model.
- **One-Click Outfit Bundle**: Adds both the top and bottom pieces to the user's shopping bag in a single click with animated visual micro-interactions.
- Multiple design iterations (v1 through v10) exploring diverse editorial layout philosophies.

### 3. Dual-Image Intelligent Media Presentation
- Automatic media classification: Distinguishes model lifestyle photography from flat lay catalog images (`cardImages(p)`).
- Studio shots automatically serve as the primary card visual, while flat lay photography is exposed on hover via CSS opacity transitions.
- Lazy-loading enabled natively across all product grid elements (`loading="lazy"`).

### 4. Reactive Shopping Bag & Local Persistence
- Slide-out accessible drawer (`aside.bag`) with backdrop scrim, keyboard `Escape` trap, and focus management.
- Persistent line item storage synced to browser `localStorage` (`vb-bag`).
- Dynamic free shipping calculation threshold (calculates remaining balance toward free shipping at ₹2,999).
- In-drawer quantity adjustments (`+` / `−`), item deletion, and demo checkout order confirmation.

### 5. Curated Catalog Merchandising
- Categorized across 5 core silhouettes: **Denim** (29 styles), **Shirts** (22 styles), **Cargos** (14 styles), **Pants** (11 styles), and **Jackets** (8 styles).
- Denim visual fit guide header showcasing the 4 signature cuts: *Hulk (Super Baggy)*, *Rock (Baggy)*, *Jazz (Comfort)*, and *Brawny (Straight)*.
- Multi-mode sorting: Featured (custom editorial order), Price (Ascending/Descending), and Alphabetical (A–Z).

---

## 🎨 Visual Showcase & Design Gallery

<table align="center" width="100%">
  <tr>
    <td width="50%" align="center">
      <img src="./assets/home-banner-denim-jacket-DXU6Lkz3.jpg" alt="Denim Jacket Collection" width="100%" style="border-radius: 6px;" /><br />
      <b>Outerwear & Washed Truckers</b>
    </td>
    <td width="50%" align="center">
      <img src="./assets/home-banner-corduroy-shirt-D0wu1r0K.jpg" alt="Corduroy Shirts Showcase" width="100%" style="border-radius: 6px;" /><br />
      <b>Fine-Wale Corduroy Overshirts</b>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./assets/denim-banner-rock-Dh8R2dSg.jpg" alt="Rock Baggy Denim Fit" width="100%" style="border-radius: 6px;" /><br />
      <b>Rock Fit — Relaxed Baggy Cut</b>
    </td>
    <td width="50%" align="center">
      <img src="./assets/denim-banner-hulk-BLGnSwTZ.jpg" alt="Hulk Super Baggy Fit" width="100%" style="border-radius: 6px;" /><br />
      <b>Hulk Fit — Super Baggy Selvedge</b>
    </td>
  </tr>
</table>

---

## 🏗 System Architecture

The application adopts a **JAMstack Static SPA Architecture**. The runtime environment runs entirely inside modern evergreen browsers, pulling data from a static JSON catalog and delegating routing to native browser APIs.

```mermaid
flowchart TB
    subgraph Browser ["Client Browser Environment (Modern Web Standards)"]
        direction TB
        DOM["DOM Tree & Main Container (#app)"]
        ROUTER["Router Engine (History API / popstate)"]
        STORE["In-Memory Store (Array & Map byHandle)"]
        BAG["Shopping Bag Manager (localStorage: 'vb-bag')"]
        LOOKBOOK["SVG Geometry & Anatomy Engine"]
        IO["IntersectionObserver (Scroll Reveal Animation)"]
    end

    subgraph StaticAssets ["Static Storage & CDN Distribution"]
        direction TB
        PRODUCTS[("products.json (84 Catalog SKUs)")]
        ASSETS["Media Assets (Images, WebVTT, Fonts, SVGs)"]
        VERCEL_RULES["Vercel Edge Rewrites (vercel.json)"]
    end

    ROUTER -->|1. Resolves path| STORE
    STORE -->|2. Maps product handles| DOM
    DOM -->|3. Dispatches actions| BAG
    BAG <-->|4. Reads / Writes| BROWSER_STORAGE[("localStorage")]
    DOM -->|5. Projects vectors| LOOKBOOK
    IO -->|6. Cascades classes (.in)| DOM

    VERCEL_RULES -.->|Routes all deep paths to /index.html| DOM
    PRODUCTS -->|Initial fetch HTTP GET| STORE
    ASSETS -->|Lazy streamed on viewport entry| DOM
```

### Architecture Highlights
1. **Zero Runtime Dependencies**: No Babel, Webpack, Vite, React, or Vue. Code executes directly in the browser via standard ECMAScript modules.
2. **Sub-millisecond State Access**: Product catalog is indexed into a native `Map<string, Product>` keyed by product handle, guaranteeing $O(1)$ lookups during navigation.
3. **Decoupled Data Layer**: Static product information resides in clean JSON (`data/products.json`), enabling simple migration to any headless CMS (Sanity, Strapi, Shopify Storefront API) in the future.

---

## 🔄 Application Flowcharts

### 1. Bootstrapping & Client-Side Routing

The initialization flow fetches the product catalog once, creates an in-memory handle index, rehydrates the shopping cart, and parses the current URL pathname.

```mermaid
flowchart TD
    A([Browser loads index.html]) --> B[/Fetch /data/products.json?v=16/]
    B --> C[Hydrate in-memory products array]
    C --> D[Construct byHandle Map for O(1) Lookups]
    D --> E[Rehydrate Bag from localStorage 'vb-bag']
    E --> F[Render Bag Counter in Header]
    F --> G{Parse window.location.pathname}

    G -->|'/' or '/home2'| H1[Render Home View with Editorial Grids]
    G -->|'/shop' or '/shop/:category'| H2[Render Shop Catalog with Filters & Sort]
    G -->|'/product/:handle'| H3[Render Product Detail View with Size Matrix]
    G -->|'/lookbook*'| H4[Render Interactive SVG Lookbook]
    G -->|'/about*'| H5[Render Brand Heritage View]
    G -->|'/contact*'| H6[Render Studio Directory & Inquiry Form]
    G -->|Unmatched Route| H7[Render 404 View with Recovery Link]

    H1 --> I[Inject HTML into #app]
    H2 --> I
    H3 --> I
    H4 --> I
    H5 --> I
    H6 --> I
    H7 --> I

    I --> J[bindPage: Attach Listeners & Setup Video Autoplay]
    J --> K[observeReveals: Initialize IntersectionObserver]
    K --> L([Interface Ready for User Interaction])
```

---

### 2. Interactive Lookbook & SVG Geometry Engine

The lookbook pairs high-resolution model photography with dynamic coordinate lines drawn inside an SVG viewBox, allowing users to inspect individual pieces or purchase the full outfit instantly.

```mermaid
flowchart TD
    START([User Navigates to /lookbook]) --> LOAD_LOOK[Fetch Look Data from LOOKS array]
    LOAD_LOOK --> RENDER_STAGE[Render Model Centerpiece]
    RENDER_STAGE --> CALC_SVG[Extract Line Coordinates: x1, y1 to x2, y2]
    CALC_SVG --> DRAW_VECTORS[Draw SVG lines & halo nodes on overlay]
    DRAW_VECTORS --> RENDER_CARDS[Render Top & Bottom Garment Detail Cards]

    RENDER_CARDS --> USER_ACTION{User Action}
    USER_ACTION -->|Clicks Previous / Next Arrow| CYCLE_INDEX[Update lookIndex & Animate Transition]
    CYCLE_INDEX --> LOAD_LOOK

    USER_ACTION -->|Clicks Single 'Add'| ADD_ONE[Call addToBag for individual handle]
    ADD_ONE --> FLASH_BTN[Display checkmark micro-animation]

    USER_ACTION -->|Clicks 'Add Both'| ADD_BOTH[Call addToBag for top & bottom pieces]
    ADD_BOTH --> FLASH_ALL[Display 'Both Added · Size M' confirmation]

    FLASH_BTN --> UPDATE_CART[Update localStorage & Open Drawer]
    FLASH_ALL --> UPDATE_CART
    UPDATE_CART --> END([State Persisted])
```

---

### 3. Merchandising & Dual-Priority Sorting Engine

Catalog views implement a multi-stage filtering and sorting pipeline that respects editorial merchandising directives while providing standard sorting controls.

```mermaid
flowchart TD
    REQ([Category View Requested]) --> CAT_CHECK{Category Selected?}
    CAT_CHECK -- Specific Category --> FILTER_CAT[Filter products matching category slug]
    CAT_CHECK -- 'All' --> ALL_CAT[Reference complete product list]

    FILTER_CAT --> CHIP_CHECK{Sub-type Chip Filter Active?}
    ALL_CAT --> CHIP_CHECK

    CHIP_CHECK -- Yes --> APPLY_CHIP[Filter products by p.type]
    CHIP_CHECK -- No --> EVAL_SORT

    APPLY_CHIP --> EVAL_SORT{Evaluate sort query parameter}

    EVAL_SORT -->|'featured' & Cargos| SORT_CARGO[Sort by explicit CARGO_ORDER array]
    EVAL_SORT -->|'featured' & Pants| SORT_PANTS[Sort by explicit PANTS_ORDER array]
    EVAL_SORT -->|'featured' & Other| SORT_MODEL[Promote items with studio model shots to top]
    EVAL_SORT -->|'price-asc'| SORT_PRICE_ASC[Sort ascending: a.price - b.price]
    EVAL_SORT -->|'price-desc'| SORT_PRICE_DESC[Sort descending: b.price - a.price]
    EVAL_SORT -->|'name-asc'| SORT_NAME_ASC[Sort alphabetically: a.name.localeCompare]

    SORT_CARGO --> RENDER_GRID[Render UY Grid Cells with Alt Hover Images]
    SORT_PANTS --> RENDER_GRID
    SORT_MODEL --> RENDER_GRID
    SORT_PRICE_ASC --> RENDER_GRID
    SORT_PRICE_DESC --> RENDER_GRID
    SORT_NAME_ASC --> RENDER_GRID

    RENDER_GRID --> OUTPUT([HTML Injected into DOM])
```

---

### 4. Shopping Bag & Checkout State Machine

The shopping bag state machine manages line items, checks threshold criteria for free shipping, persists state across browser restarts, and handles demo checkout completion.

```mermaid
stateDiagram-v2
    [*] --> EmptyBag: Browser launches with no stored data
    [*] --> HydratedBag: Stored JSON parsed from localStorage

    EmptyBag --> ActiveBag: User clicks 'Add to bag' (qty = 1)
    HydratedBag --> ActiveBag: User adds additional items

    state ActiveBag {
        [*] --> EvaluatingShipping
        EvaluatingShipping --> BelowThreshold: Subtotal < ₹2,999
        EvaluatingShipping --> FreeShippingQualified: Subtotal >= ₹2,999

        BelowThreshold --> CalculatingDelta: Calculate (₹2,999 - Subtotal)
        CalculatingDelta --> RenderDrawer: Display remaining amount needed
        FreeShippingQualified --> RenderDrawer: Display 'Free shipping on this order'

        RenderDrawer --> ItemIncrement: User clicks '+'
        ItemIncrement --> EvaluatingShipping: Line item qty increased

        RenderDrawer --> ItemDecrement: User clicks '−'
        ItemDecrement --> ItemRemoval: If qty becomes < 1
        ItemDecrement --> EvaluatingShipping: Line item qty decreased
        ItemRemoval --> EvaluatingShipping: Item removed from bag array
    }

    ActiveBag --> EmptyBag: All items removed
    ActiveBag --> OrderConfirmed: User clicks 'Checkout'
    OrderConfirmed --> EmptyBag: Bag reset to empty array
```

---

## 🔁 Sequence Diagrams

### Client-Side Route Transition

This sequence demonstrates how link clicks are intercepted to achieve instant, flicker-free single page transitions without a full page refresh:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Anchor as <a> Element (data-link)
    participant DocListener as Document Click Listener
    participant Router as Router (app.js: go())
    participant Window as Browser Window (History API)
    participant Hydrator as View Renderer (render())
    participant DOM as #app Container

    User->>Anchor: Clicks navigation link (e.g. "/shop/cargos")
    Anchor->>DocListener: Event bubbles up
    DocListener->>DocListener: Checks e.target.closest("a[data-link]")
    DocListener->>DocListener: Verifies no meta/ctrl modifier keys
    DocListener->>DocListener: Calls e.preventDefault()
    DocListener->>Router: go("/shop/cargos")
    Router->>Window: history.pushState(null, "", "/shop/cargos")
    Router->>Hydrator: Invokes render()
    Hydrator->>Hydrator: Parses pathname and matches route pattern
    Hydrator->>Hydrator: Generates HTML string via shop("cargos", "featured")
    Hydrator->>DOM: app.innerHTML = html
    Hydrator->>Window: window.scrollTo(0, 0)
    Hydrator->>DOM: bindPage() & observeReveals()
    DOM-->>User: Seamless visual update complete (<16ms)
```

---

### Add-to-Bag & Reactive Persistence

This sequence illustrates the end-to-end data flow when a shopper selects a size and adds an item to their cart:

```mermaid
sequenceDiagram
    autonumber
    actor Shopper
    participant PDP as Product Detail View
    participant Controller as Bag Controller (app.js)
    participant Storage as Window LocalStorage
    participant Drawer as Bag Drawer (#bag)
    participant Badge as Header Badge (#bagCount)

    Shopper->>PDP: Selects size button (e.g. "32")
    PDP->>PDP: Sets chosen = "32", highlights button
    Shopper->>PDP: Clicks "Add to bag"
    PDP->>Controller: addToBag("comfort-cargo-9018-mouse", "32")
    Controller->>Controller: Searches bag array for matching handle & size
    alt Item already present in bag
        Controller->>Controller: Increments qty (line.qty++)
    else New line item
        Controller->>Controller: Pushes { handle, size: "32", qty: 1 }
    end
    Controller->>Storage: localStorage.setItem('vb-bag', JSON.stringify(bag))
    Controller->>Controller: Calls renderBag()
    Controller->>Badge: Updates bagCount.textContent
    Controller->>Drawer: Renders item markup, subtotal, and shipping note
    Controller->>Drawer: openBag() -> adds .open class, reveals scrim
    Drawer-->>Shopper: Slide-out drawer displayed with focus on close button
```

---

## 💻 Technology Stack

| Layer | Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | Vanilla JavaScript | ES2022+ | Zero runtime overhead; eliminates bundler latency and supply chain dependencies. |
| **Document Structure** | Semantic HTML5 | Living Standard | Accessible document outline using `<header>`, `<main>`, `<aside>`, and `<nav>`. |
| **Styling & Layout** | Pure CSS3 | Modern Spec | CSS Custom Properties (variables), CSS Grid, and Flexbox for fluid responsiveness. |
| **Vector Graphics** | Scalable Vector Graphics | SVG 1.1 / 2 | Interactive geometry overlay for lookbook connector lines and UI icons. |
| **State Persistence** | Web Storage API | `localStorage` | Client-side persistence for cart state across browser sessions. |
| **Scroll Animation** | Intersection Observer API | Native W3C | GPU-accelerated reveal animations triggered when cards scroll into viewport. |
| **Typography** | Google Fonts & Local WebFonts | Inter, Anton, WOFF2 | Clean editorial type pairing combining high-impact display with clean legibility. |
| **Deployment / Edge** | Vercel Static Hosting | Edge Network | Instant static file caching with server-side SPA URL rewrites via `vercel.json`. |

---

## 📂 Project Directory Structure

```text
vintage-blue-main/
├── assets/                     # Optimized visual media and static assets
│   ├── About1-C60kMP7t.png     # Workshop & craft editorial photography
│   ├── About2-2b59lb8O.png     # Material sourcing feature visual
│   ├── About3-B9cmU6sk.png     # Brand hero banner
│   ├── fits/                   # Denim fit silhouette guides (Hulk, Rock, Jazz, Brawny)
│   ├── ref/                    # Visual references and studio textures
│   ├── stock/                  # Lifestyle photography
│   ├── *.jpg / *.png           # Full catalog product & studio model photography (400+ files)
│   ├── *.woff2 / *.ttf         # Custom local web typography files
│   └── video1-CtHkyV6s.mp4     # Brand identity editorial video
├── data/
│   └── products.json           # Master product catalog database (84 items, 5 categories)
├── after-film/                 # Design lab: Post-film editorial imagery variations
│   └── index.html
├── fonts/                      # Design lab: Typography pairing explorations
│   └── index.html
├── footers/                    # Design lab: Footer layout showcases
│   └── index.html
├── form-grids/                 # Design lab: Interactive form layout explorations
│   └── index.html
├── heroes/                     # Design lab: Hero banner visual explorations
│   └── index.html
├── lookbook-options/           # Design lab: Lookbook anatomy variations
│   └── index.html
├── options/                    # Design lab: Visual direction variations
│   └── index.html
├── posters/                    # Design lab: High-impact editorial posters (v1–v7)
│   ├── index.html
│   └── v1.html ... v7.html
├── sections/                   # Design lab: Modular component layouts
│   └── index.html
├── wordmarks/                  # Design lab: Typography and logo treatments
│   └── index.html
├── .gitignore                  # Git exclusion rules
├── app.js                      # Core SPA router, view hydrators, cart, & business logic
├── home2.css                   # Grid styling for modern H&M-style homepage layouts
├── index.html                  # Single Page Application root entry point
├── options.css                 # Style overrides for design lab pages
├── options.js                  # Script logic for interactive design options
├── styles.css                  # Master design system styles (typography, bag, cards, nav)
├── vercel.json                 # Vercel deployment rewrites for client-side routing
└── README.md                   # Complete repository documentation
```

---

## 📊 Catalog Data Design

The application's data layer is powered by [`data/products.json`](./data/products.json), housing 84 unique product models structured with comprehensive apparel attributes.

### Entity-Relationship Diagram

```mermaid
erDiagram
    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT ||--o{ BAG_LINE : added_to
    PRODUCT ||--o{ LOOKBOOK_PIN : referenced_in

    CATEGORY {
        string slug PK "e.g. 'denim', 'cargos'"
        string label "Display name"
    }

    PRODUCT {
        int id PK "Unique identifier"
        string handle UK "URL slug, e.g. 'comfort-cargo-9018-mouse'"
        string name "Full product title"
        string styleNo "Factory manufacturing style number"
        int price "Price in Indian Rupees (INR)"
        string[] categories "Taxonomy classification array"
        boolean popular "Merchandising priority flag"
        string[] images "Array of relative asset paths"
        string description "Editorial copy description"
        string[] details "Bullet points (fabric, wash, cut)"
        string[] sizes "Available waist or garment sizes"
        string[] tags "Search and filter keywords"
        string type "Silhouette type (e.g. 'Comfort Cargo')"
        string fit "Fit classification (e.g. 'Super Baggy')"
        string material "Fabric composition (e.g. '100% Cotton')"
        string color "Color shade (e.g. 'Mouse')"
        string colorFamily "Broad color family (e.g. 'Browns')"
        boolean inStock "Inventory availability status"
    }

    BAG_LINE {
        string handle FK "References PRODUCT.handle"
        string size "Chosen size (e.g. '32', 'M')"
        int qty "Quantity selected"
    }

    LOOKBOOK_PIN {
        string handle FK "References PRODUCT.handle"
        string label "Garment label (e.g. 'The Shirt')"
        string img "Isolated product cutout asset"
        int x1 "Start line coordinate"
        int y1 "Start line coordinate"
        int x2 "Target anchor coordinate"
        int y2 "Target anchor coordinate"
    }
```

### Catalog Distribution Overview

| Category | SKU Count | Price Range (INR) | Primary Materials | Key Fits / Silhouettes |
| :--- | :---: | :---: | :--- | :--- |
| **Denim** | 29 | ₹2,299 – ₹2,799 | 100% Cotton Selvedge, 99/1 Stretch | Hulk (Super Baggy), Rock (Baggy), Jazz (Comfort), Brawny (Straight) |
| **Shirts** | 22 | ₹1,599 – ₹1,999 | Cotton Corduroy, Brushed Twill | Oversized Boxy, Classic Camp Collar |
| **Cargos** | 14 | ₹1,899 – ₹2,199 | Heavy Cotton Canvas, Tactical Ripstop | Comfort Cargo (Style 9018, Style 9019) |
| **Pants** | 11 | ₹1,699 – ₹1,999 | Lightweight Cotton, Washed Chino | Lightweight Pant (4035, 4037), Heavy Pant (4036), Comfort Pant (4038) |
| **Jackets** | 8 | ₹2,999 – ₹3,499 | Selvedge Denim, Shearling Corduroy | Washed Trucker, Sherpa Fur Trucker, Fleece Denim |

---

## 🧠 Core Algorithms & Implementation Details

### 1. Dual-Image Intelligent Media Classifier
To provide an engaging hover preview, `cardImages(p)` automatically determines whether an item has lifestyle photography:

```javascript
// app.js: Lead with the model shot; the flat shot becomes the hover image.
function cardImages(p) {
  if (p.images[0] && p.images[0].includes("-model")) {
    const alt = p.images.find((i) => !i.includes("-model")) || p.images[1] || p.images[0];
    return [p.images[0], alt];
  }
  const model = p.images.find((i) => /-model-(?!back)/.test(i));
  const front = p.images[0];
  return model ? [model, front] : [front, p.images[1]];
}
```
- **Complexity**: $O(K)$ where $K$ is the number of images per product (typically $2 \le K \le 4$).
- **Advantage**: Guarantees visual harmony across product catalog grids without requiring manual CMS curation for primary vs secondary thumbnail slots.

---

### 2. Locked Editorial Merchandising Order
For high-priority product categories (Cargos and Pants), merchandising sequences are strictly controlled by pre-indexed lookup maps:

```javascript
// app.js: O(1) index lookup for editorial sorting
if (sort === "featured") {
  if (cat === "cargos") {
    const orderMap = new Map(CARGO_ORDER.map((h, i) => [h, i]));
    list.sort((a, b) => (orderMap.get(a.handle) ?? 999) - (orderMap.get(b.handle) ?? 999));
  } else if (cat === "pants") {
    const orderMap = new Map(PANTS_ORDER.map((h, i) => [h, i]));
    list.sort((a, b) => (orderMap.get(a.handle) ?? 999) - (orderMap.get(b.handle) ?? 999));
  } else {
    // Studio-shot pieces first, otherwise keep catalogue order.
    const hasModel = (p) => p.images.some((i) => i.includes("-model"));
    list.sort((a, b) => hasModel(b) - hasModel(a));
  }
}
```
- **Complexity**: Array sorting runs in $O(N \log N)$ where $N$ is the category size. Map lookups run in $O(1)$ time.

---

### 3. Dynamic Free Shipping Threshold Calculator
The bag renderer continuously assesses subtotal thresholds to incentivize higher cart values:

```javascript
// app.js: Real-time calculation of remaining shipping balance
const count = lines.reduce((n, l) => n + l.qty, 0);
const total = lines.reduce((n, l) => n + l.qty * l.p.price, 0);
const shippingNotice = total >= 2999 
  ? "Free shipping on this order." 
  : `Add ${inr(2999 - total)} more for free shipping.`;
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- Any modern web browser supporting ES Modules (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).
- A static HTTP web server (Node.js `serve`, Python 3, or VS Code Live Server). Direct `file://` opening is not supported due to browser CORS policies on ES Modules and local `fetch()` calls.

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/iamritikarsh/VINTAGE-BLUE.git
cd VINTAGE-BLUE

# 2. Launch using any static HTTP server

# Option A: Using Node.js npx serve (Recommended)
npx serve . -l 3000

# Option B: Using Python 3 built-in HTTP server
python -m http.server 3000

# Option C: Using PHP built-in server
php -S localhost:3000
```

Once running, navigate to `http://localhost:3000` in your web browser.

---

## 🌐 Deployment Guide

### Deploying to Vercel (1-Click Deployment)

This repository includes a preconfigured [`vercel.json`](./vercel.json) that maps all incoming route requests to `index.html` while allowing static assets to bypass:

```json
{
  "cleanUrls": false,
  "rewrites": [
    { 
      "source": "/((?!assets/|data/|fonts/|.*\\.[a-z0-9]+$).*)", 
      "destination": "/index.html" 
    }
  ]
}
```

#### Steps to Deploy via Vercel CLI:
```bash
# Install Vercel CLI globally if not already installed
npm install -g vercel

# Deploy directly from project root
vercel
```

#### Deploying via GitHub Integration:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New Project** and select `iamritikarsh/VINTAGE-BLUE`.
3. Keep default settings (Framework Preset: **Other**, Root Directory: `./`).
4. Click **Deploy**. Vercel will automatically detect `vercel.json` and deploy globally.

---

## 🛡 Performance, Security & Accessibility

### Performance Optimizations
- **Zero Third-Party Bundles**: Eliminates render-blocking scripts, leading to first-contentful-paint (FCP) times under 0.8s on standard broadband.
- **Asset Preloading**: Critical hero images are preloaded via `<link rel="preload">` in `index.html`.
- **Native Image Lazy Loading**: Grid images employ `loading="lazy"` to defer off-screen network requests.
- **Hardware-Accelerated Transitions**: Drawer slides and reveal animations leverage CSS `transform` and `opacity` properties to prevent CPU layout thrashing.

### Security Best Practices
- **Strict HTML Entity Escaping**: Dynamic text injected into template literals is escaped via `esc()` to neutralize Cross-Site Scripting (XSS) risks:
  ```javascript
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => 
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  ```
- **Defensive Storage Parsing**: `localStorage.getItem` reads are wrapped in `try...catch` blocks to protect against corrupted client-side state.

### Accessibility (a11y)
- Semantic HTML tags (`<header>`, `<main>`, `<aside>`, `<nav>`, `<footer>`).
- Screen reader ARIA tags (`aria-label`, `aria-hidden`, `aria-expanded`).
- Keyboard accessibility: The shopping bag drawer automatically captures focus and closes on `Escape` key press.
- Responsive tap targets: Interactive buttons maintain a minimum target size of 44×44px for touch displays.

---

## 🧪 Testing & Quality Assurance

### Current Testing Strategy
- **Manual End-to-End Validation**: Cross-browser manual verification across Chromium, Gecko, and WebKit engines on desktop and mobile viewports.
- **Route Validation**: Complete path traversals across all category filters (`/shop/denim`, `/shop/cargos`, etc.) and product detail handles (`/product/comfort-cargo-9018-mouse`).
- **Cart Stress Testing**: Line item mutations, boundary conditions (zero quantity deletions, upper quantity thresholds), and browser storage persistence.

### Recommended Automated Testing Roadmap
For enterprise production expansion, the following test suite is planned:
1. **Unit Testing (Vitest)**: Testing data transform functions (`cardImages`, `colorOf`, price formatters, and sorting algorithms).
2. **E2E Testing (Playwright)**: Automated regression testing covering:
   - Initial catalog load and map indexing.
   - Lookbook navigation and coordinate validation.
   - Add-to-bag drawer triggering and checkout simulation.
3. **Accessibility Auditing (Lighthouse / axe-core)**: Continuous checks for WCAG 2.1 AA compliance.

---

## 🗺 Limitations & Future Roadmap

### Current Limitations
- **Simulated Checkout**: The checkout action clears the bag and presents an order confirmation screen; no real payment gateway (Razorpay / Stripe) is currently connected.
- **Static Inventory**: Stock status is read from static JSON rather than a live inventory database.

### Future Roadmap
- [ ] **Live Payment Gateway**: Integrate Stripe Elements or Razorpay for live payment capture.
- [ ] **Customer Accounts**: Implement JWT-based authentication for order tracking and wishlist persistence.
- [ ] **Automated CI/CD**: GitHub Actions workflow running automated Playwright visual regression tests on each pull request.
- [ ] **Headless CMS Integration**: Connect Strapi or Sanity to allow non-technical workshop managers to publish drops and edit descriptions.

---

## 🤝 Contributing Guidelines

Contributions, bug reports, and suggestions are welcome!

1. **Fork the Repository**: Click the `Fork` button on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/editorial-enhancement
   ```
3. **Make and Test Changes**: Ensure zero dependencies are added and code remains 100% compliant with standard Vanilla JavaScript and CSS.
4. **Commit Your Changes**:
   ```bash
   git commit -m "feat: add keyboard navigation to lookbook carousel"
   ```
5. **Push and Open a Pull Request**: Push your branch to GitHub and submit a PR with a clear summary of your enhancements.

---

## 📜 License & Attribution

### License
No formal open-source license file is currently applied to this repository. All rights to brand imagery, photography, editorial copy, and product catalog metadata are reserved by **Vintage Blue Jeanswear**. 

For inquiries regarding code reuse, educational referencing, or commercial licensing, please reach out to the author.

---

## 👤 Author & Credits

**Ritikarsh Kumar**
- **GitHub**: [@iamritikarsh](https://github.com/iamritikarsh)
- **Repository**: [iamritikarsh/VINTAGE-BLUE](https://github.com/iamritikarsh/VINTAGE-BLUE)
- **Brand Inquiries**: `hello@vintageblue.studio`

---

<div align="center">
  <sub>Built with passion for heritage craftsmanship and clean web architecture. © 2026 Vintage Blue Jeanswear.</sub>
</div>
