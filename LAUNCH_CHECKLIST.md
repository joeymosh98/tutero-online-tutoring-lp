# Funnel Launch Checklist

## 1. Create the page
- [ ] Copy `/lp/_template/a/` to `/lp/{funnel-name}/a/`
- [ ] For B variant: copy `/lp/_template/b/` to `/lp/{funnel-name}/b/`
- [ ] For A/B testing: copy `/lp/online-tutoring/index.html` to `/lp/{funnel-name}/index.html`

## 2. Configure the page
- [ ] Replace `REPLACE_THIS_PAGE_TITLE` in `<title>`
- [ ] Replace all `REPLACE_THIS_*` placeholders (search for "REPLACE_THIS")
- [ ] In `script.js`, set `LEAD_CONFIG`: `{ landingPage: 'Funnel Name', variant: 'a' }`
- [ ] In `script.js`, set `REDIRECT_URL` (thank-you page path)
- [ ] In `script.js`, call `TuteroAnalytics.init({ ga4Id: 'G-XXXXXXX', fbPixelId: '...', gadsId: '...', gadsLabel: '...' })`

## 3. Images
- [ ] Replace placeholder images with real ones
- [ ] Hero first image: NO `loading="lazy"` (it's the LCP element)
- [ ] All other images: add `loading="lazy"`
- [ ] Add `width` and `height` attributes to all `<img>` tags

## 4. Theme (optional)
To use a different brand color (e.g. for school funnels), add to `styles.css`:
```css
:root {
  --color-primary: #1D49E3;
  --color-primary-hover: #1638b8;
  --color-primary-cta: #3a5de8;
}
```

## 5. Test
- [ ] `npm run dev` — page loads without console errors
- [ ] Test form submission (check webhook receives data)
- [ ] Test redirect after submission
- [ ] Verify favicon shows in browser tab
- [ ] Test on mobile (Chrome DevTools device mode)
- [ ] Run Lighthouse: target 90+ performance, 90+ accessibility

## 6. Deploy
- [ ] Push to branch, create PR
- [ ] Test Vercel preview deployment
- [ ] Merge to main
- [ ] Verify production URL
