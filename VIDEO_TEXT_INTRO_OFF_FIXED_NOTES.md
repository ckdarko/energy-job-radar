# Scentivity Video Text + Intro Off FIXED

I checked the previous zip. It hid the video text with CSS, but one fallback heading still existed in the HTML:
- Sweet scents, beautiful moments.

This fixed version removes all video overlay text directly from index.html and keeps only the button.

It also keeps the intro section removed/toggled off.

Upload only:
- index.html
- styles.css

Then redeploy with Netlify → Deploys → Trigger deploy → Clear cache and deploy site.
