# Turqo Marine

Boutique maritime consulting firm based in Turkey, focused on ship recycling yard processes, HKC / EU SRR compliance, and shipyard operations for shipowners, cash buyers and brokers.

## Project structure

```
turqo-marine/
├── index.html                                       # Single-page corporate website (EN)
├── docs/
│   ├── Denizcilik_Danismanlik_Is_Plani.docx         # Business plan (TR)
│   ├── Denizcilik_Danismanlik_Is_Plani.pdf
│   ├── Maritime_Consulting_Business_Plan_EN.docx    # Business plan (EN)
│   └── Maritime_Consulting_Business_Plan_EN.pdf
├── netlify.toml                                     # Netlify deploy config
├── vercel.json                                      # Vercel deploy config
├── .gitignore
└── README.md
```

## Local development

Open `index.html` directly in a browser, or run a local server:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve
```

Visit `http://localhost:8000`.

## Deploy

### Cloudflare Pages (recommended, free)
1. Push this repo to GitHub.
2. Go to `dash.cloudflare.com` → Workers & Pages → Create.
3. Connect the repo. Build command: empty. Output directory: `/`.
4. After first deploy, add custom domain `turqomarine.com`.

### Netlify (one-click)
- Drag-and-drop this folder onto `app.netlify.com/drop`, or
- Connect the GitHub repo at `app.netlify.com/start`.

### Vercel
- Connect the GitHub repo at `vercel.com/new`. No build step needed.

## Custom domain

1. Buy `turqomarine.com` (Cloudflare Registrar recommended).
2. In your deploy provider, add the custom domain.
3. Point the domain to the provider's nameservers (Cloudflare) or add CNAME / A records (Netlify, Vercel).

## Editing the site

The entire site is in `index.html`. To rebrand:
- Company name appears in roughly 10 places — search-and-replace `Turqo Marine` and `Turqo.Marine`.
- Email: search `info@turqomarine.com`.
- Colour palette: `:root { --navy: ... }` at the top of the `<style>` block.

## Business documents

The `docs/` folder contains the full 10-page business plan in both Turkish and English (Word + PDF). These are the source-of-truth for the site copy.

---

© 2026 Turqo Marine. All rights reserved.
