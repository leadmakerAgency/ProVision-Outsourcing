# ProVizion Outsourcing website files

Last updated 8 October 2026.

- index.html is the homepage. Every other .html file is one page; blog/ holds the six articles. 68 pages in total, including careers-philippines.html and 5 job pages.
- Links are relative, so the site works when opened locally and when hosted. Canonical URLs assume provizionoutsourcing.com.
- Book a call: every "Book a call" button opens https://calendly.com/agencyleadmaker/provizion. The contact page embeds the Calendly calendar inline.
- Formspree: proposal form (rfp.html) posts to xkjojvkv; the 5 job forms post to xdeaelyr, tagged with the role.
- Hero images: images/hero/<page>.jpg, 960 x 720, filled from the 30 photos in images/source-photos (see IMAGE-SHOT-LIST.md).
- Client logos: images/logos (12 files, shown white on the dark hero strip). Originals in images/logos/source.
- privacy-policy.html and terms.html are written in full (governing law: Philippines). Have them checked by a lawyer before launch.
- sitemap.xml lists 66 URLs for Search Console.
- Fonts: Urbanist (headings) and Plus Jakarta Sans (body) from Google Fonts.
- A backup of the site before the 8 October changes is in ../_backup-2026-10-08.
- Navigation: dropdowns and the mobile menu live in assets/nav.css and assets/nav.js (shared by every page).
- Booking: every Book a call button goes to book.html (/book), which embeds Calendly inline and pre-fills name and email from any form the visitor filled in earlier. After a booking it redirects to booked.html (/booked) after 2 seconds as a backup to Calendly's own redirect.
- RFP: a successful submission redirects to rfp-received.html (/rfp-received).
- /book, /booked and /rfp-received are noindex; /booked and /rfp-received are disallowed in robots.txt. _redirects (Netlify) serves them at trailing-slash URLs.
- Favicon: assets/favicon.svg, assets/favicon-32.png, favicon.ico and apple-touch-icon.png.
