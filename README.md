# I Hate Mailto by rezzonico.dev

I Hate Mailto is a lightweight browser Add-On that stops mailto: links from opening your email client and copies the email address and other relevant details straight to your clipboard instead.

Stop email links from launching unwanted applications and instantly copy email addresses and other relevant details to your clipboard. A lightweight and simple solution for a smoother browsing experience.

## Dev Prerequisites

[Node.js](https://nodejs.org/en/download) v24 or higher
[pnpm](https://pnpm.io/installation) v12 or higher

### Development

After cloning the repository:

```bash
pnpm install # Install dependencies
pnpm dev # Start development server for chrome
pnpm dev:firefox # Start development server for firefox
pnpm dev:lang-it # Start development server for italian language (chrome)
```

Optionally, you can also run the following commands to spin up a helpful testing page

```bash
cp web-ext.config.ts.example web-ext.config.ts # Copy example config
pnpm dev:page # Serve testing page
```

### Build

```bash
pnpm build # Build for chrome
pnpm build:firefox # Build for firefox

pnpm zip # Create distribution zip for chrome
pnpm zip:firefox # Create distribution zip for firefox
```