# senthilnayagan.com

Senthil Nayagan's personal tech blog. A static site built with [Eleventy (11ty)](https://www.11ty.dev/), Sass, and vanilla JS (just a small theme toggle), deployed to GitHub Pages.

Scaffolded from [11ty-sass-images-seo](https://github.com/AleksandrHovhannisyan/11ty-sass-images-seo) (MIT licensed), then built out with blog-specific features: post listing, tags, pagination, RSS feed, syntax-highlighted code blocks, dark/light theme, and SEO essentials.

## Getting started

```bash
npm install
npm run dev
```

This starts a local server at `http://localhost:8080` and rebuilds on file changes (HTML via 11ty, CSS via Sass, both watched in parallel).

## Writing a post

1. Create a new folder under `src/_posts/`, named `YYYY-MM-DD-your-slug/` (the date becomes the post's publish date; the slug becomes its URL, e.g. `/blog/your-slug/`).
2. Add an `index.md` inside it with front matter:

   ```md
   ---
   title: Your Post Title
   description: A one- or two-sentence summary, used for previews and SEO.
   tags:
     - some-tag
   ---

   Your content here.
   ```

3. Local images referenced with `![alt](./some-image.jpg)` are automatically optimized (resized + converted to WebP/JPEG) by the Eleventy image transform plugin — just put the image file next to `index.md`.
4. Run `npm run build` (or check it in the dev server) before committing.

Posts are listed newest-first at `/blog/`, and every tag gets its own page at `/tags/<tag>/`.

## Project structure

- `src/_data/site.js`: global site metadata (title, author, social links, nav). **Edit this to fill in your details.**
- `src/_posts/`: blog posts.
- `src/_pages/`: standalone pages (home, about, 404).
- `src/blog/`, `src/tags/`, `src/feed/`: generated blog index, tag pages, and RSS feed.
- `src/_layouts/`: `default` (HTML shell + nav/footer), `page` (simple content pages), `post` (article template).
- `src/_includes/components/`: reusable partials (header, footer, post preview card, pagination, theme toggle).
- `src/assets/styles/`: Sass source, compiled to `_site/assets/styles/main.css`.
- `lib/`: Eleventy config helpers — filters, collections, shortcodes.
- `.eleventy.js`: Eleventy configuration.

## `package.json` scripts

- `npm run dev`: serve locally with live rebuild.
- `npm run build`: production build to `_site/`.
- `npm run lint`: lint JS (ESLint) and Sass (Stylelint), auto-fixing where possible.
- `npm run format`: format everything with Prettier.
- `npm run clean`: remove build output.

## Deployment

Deployment is automated via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): every push to `main` builds the site and publishes `_site/` to GitHub Pages using the official `actions/deploy-pages` action.

### One-time setup

1. Create an empty GitHub repository (no README/license/gitignore) named `senthilnayagan.com` under your account.
2. Push this repo to it (see commands below).
3. On GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Still under **Settings → Pages**, set the **Custom domain** to `senthilnayagan.com` (this repo already includes a `CNAME` file with that value, which GitHub Pages picks up automatically) and enable **Enforce HTTPS** once the certificate is issued.
5. At your domain registrar, point DNS at GitHub Pages:
   - `A` records for the apex domain (`senthilnayagan.com`) to GitHub's IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Optionally, a `CNAME` record for `www` pointing to `<your-username>.github.io`, if you want `www.senthilnayagan.com` to work too.
6. Push to `main` — the workflow builds and deploys automatically. Check the **Actions** tab for progress.

### Pushing this repo for the first time

```bash
git remote add origin git@github.com:<your-username>/senthilnayagan.com.git
git branch -M main
git push -u origin main
```

## Newsletter

`/newsletter/` and the homepage's "subscribe to my newsletter" link both point at `site.newsletterUrl`
(in `src/_data/site.js`) — currently set to the [Buttondown](https://buttondown.com/senthilnayagan)
subscribe page. No signup form or backend lives in this repo; it's just a link out to the subscription
page. If `newsletterUrl` is ever emptied out, `/newsletter/` falls back to pointing readers at the RSS
feed instead of showing a dead link.

To switch providers later, just replace the value of `newsletterUrl` with the new service's hosted
subscribe page URL — nothing else needs to change. One open-source, self-hosted option worth
considering if you outgrow Buttondown's free tier: [Listmonk](https://listmonk.app) (MIT-licensed).
Rough setup:

1. Deploy Listmonk (its docs cover [Docker Compose](https://listmonk.app/docs/installation/) — you'll
   need a small VPS or similar, Postgres, and an SMTP sender for outgoing mail, e.g. a transactional
   email provider's free tier).
2. Create a list for this blog.
3. Copy its **public subscription page** URL (Lists → your list → public page) into `newsletterUrl`.

## Before you publish

- [ ] Fill in `src/_data/site.js`: social links (LinkedIn, X/Twitter if you use them), and double-check the bio.
- [ ] Replace the bio in `src/_pages/about.md`.
- [ ] Replace `src/assets/images/favicon/favicon.png` with a real logo/monogram (the current one is a generated placeholder).
