# werk.review — Open Tasks

## Content

- [ ] Add more authors (currently only Gottfried Keller)
- [ ] Add more genres beyond what Keller covers
- [ ] Write/improve plot summaries for works missing them
- [ ] Upload author photos for all authors via admin

## Features

- [ ] User profile editing (change username, email, password)
- [ ] Delete account functionality
- [ ] Review editing/deletion from account page
- [ ] Pagination on listing pages (autoren, werke, genre works)
- [ ] Sort options on listing pages (alphabetical, year, rating)
- [ ] Average rating display on work cards and listing pages
- [ ] Reading lists / bookmarks (users can save works)
- [ ] RSS feed for new reviews or newly added works
- [ ] Sitemap.xml generation for SEO

## Admin

- [ ] Admin user management (list users, ban/delete)
- [ ] Admin review moderation
- [ ] Bulk data import for authors/works (CSV or JSON upload)
- [ ] When accepting an author suggestion, link to adding the author

## Technical

- [ ] Rate limiting on auth endpoints (login, register, password reset)
- [ ] CSRF protection review
- [ ] Email sending error handling and retry logic
- [ ] Cloudflare Email Service domain setup (SPF/DKIM via dashboard)
- [ ] Proper 404 handling for nonexistent authors/works/genres
- [ ] Image optimization (resize on upload, serve WebP)
- [ ] Caching strategy for static data pages

## Design

- [ ] Dark mode toggle
- [ ] Footer: add links to Vorschlagen, Konto
- [ ] Breadcrumb navigation on detail pages
- [ ] Empty state illustrations
- [ ] Mobile navigation improvements (close on route change)
