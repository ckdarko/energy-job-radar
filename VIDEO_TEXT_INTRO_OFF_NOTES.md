# Scentivity Video Text + Intro Toggle-Off Update

Base used:
- scentivity_changed_files_only_modal_close_menu_fix.zip

Changes made:
- Removed video overlay text:
  - Scentivity in motion
  - Sweet scents in motion.
  - Discover fragrance mists, body care, luxury scents, and gift-ready deals.
- Left the video button intact.
- Removed/toggled off the intro section:
  - Everything Sweet Scented
  - Wear Confidence, Embrace Elegance. Leave a lasting impression.
  - Scentivity intro paragraph
- Added video compatibility attributes:
  - webkit-playsinline
  - preload="auto"
- Did not change the video section font style or text color.
- Added CSS cache busting.

Upload only:
- index.html
- styles.css

Then redeploy with Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
