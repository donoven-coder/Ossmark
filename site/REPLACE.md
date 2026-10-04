# Ossmark site — content to replace before launch

Open the site with `?replace` on the end of the URL (for example `index.html?replace`)
to see every placeholder outlined in orange. Each one is also marked in the code with
a `<!-- REPLACE: ... -->` comment and/or a `data-replace` attribute.

## Brand
- [ ] **Logo**: swap the placeholder mark and the "Ossmark" wordmark in the header (`index.html`, `.brand`). An SVG works best, at about 32px tall.
- [ ] **Favicon**: replace `assets/favicon.svg` with your logo mark.
- [ ] **Social share image**: add an `og:image` (1200×630) and `og:url` in the `<head>` once the domain is live.

## Contact details
- [ ] **Phone number**: `(856) 555-0123` is a dummy number. It appears in the contact section and the footer, and in each `tel:` link.
- [ ] **Email**: `hello@ossmark.com` appears in the contact section, the footer and the form's `data-mailto`.
- [ ] **Form handler**: set `data-endpoint` on the `<form>` to a Formspree, Netlify Forms, Basin or CRM webhook URL. Until then, submitting opens the visitor's email app with the request filled in, so no lead is lost.

## Business details to confirm
- [ ] **Home base on the map**: `HUB` in `main.js` is set to Cherry Hill. Change it to the town Ossmark is based in.
- [ ] **Launch timeline**: "within 14 days of kickoff" (How we work, step 3).
- [ ] **Recommended starting budget**: "$1,000 and $3,000 a month" (FAQ).
- [ ] **Pricing answer**: the FAQ says the fee is a flat monthly rate. Update it to match your actual model.
- [ ] **Client promises**: month-to-month terms, client-owned accounts, weekly reporting, reply within one business day. Remove any you don't offer.
- [ ] **Founder story**: the "We live where your customers live" paragraph. Personalize it with your real story.
- [ ] **Industries served**: edit the list of business types in the same section if needed.

## Add later (slots are ready)
- [ ] **Client results / case study**: the "report you'll get every Monday" section has a comment marking where a case study or testimonial should go. Don't publish numbers until they're real.
- [ ] **Testimonials**: once you have two or three, add them between the report and "We live where your customers live" sections.
- [ ] **Team photo**: the local section is a good place for it.

## Publishing
The site is plain HTML, CSS and JavaScript with no build step. To publish it, upload the `site/` folder to any static host: Netlify, Vercel, Cloudflare Pages or GitHub Pages.
To preview locally, run `python3 -m http.server` inside `site/` and open http://localhost:8000.
