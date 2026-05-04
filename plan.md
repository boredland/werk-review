# werk.review — Open Tasks

## Content

- [ ] Add more authors (currently only Gottfried Keller)
- [ ] Add more genres beyond what Keller covers
- [ ] Write/improve plot summaries for works missing them
- [x] Author photos fetched automatically from Wikipedia

## Features

- [x] User profile editing (change username, email, password)
- [x] Delete account functionality
- [x] Review editing/deletion from account page
- [x] Pagination on listing pages (autoren, werke, genre works)
- [x] Sort options on listing pages (alphabetical, year, rating)
- [x] Average rating display on work cards and listing pages
- [x] Reading lists / bookmarks (users can save works)
- [x] RSS feed for new reviews or newly added works
- [x] Sitemap.xml generation for SEO

## Admin

- [x] Admin user management (list users, ban/delete)
- [ ] Admin review moderation
- [ ] Bulk data import for authors/works (CSV or JSON upload)
- [ ] When accepting an author suggestion, link to adding the author

## Technical

- [x] Rate limiting on auth endpoints (login, register, password reset)
- [x] CSRF protection review
- [x] Email sending error handling and retry logic
- [x] Cloudflare Email Service domain setup (SPF/DKIM via dashboard)
- [x] Proper 404 handling for nonexistent authors/works/genres
- [x] Image optimization (resize on upload, serve WebP)
- [x] Caching strategy for static data pages

## Design

- [x] Dark mode toggle
- [x] Footer: add links to Vorschlagen, Konto
- [x] Breadcrumb navigation on detail pages
- [ ] Empty state illustrations
- [x] Mobile navigation improvements (close on route change)
