# Customer Favorites Admin Toggle Update

Admin change:
- Added a product toggle:
  "Show in Customer Favorites / Coming Soon Section"

Homepage behavior:
- Products no longer appear automatically in:
  "Customer favorites / Available favorites and coming-soon scents"
- Only products with this toggle turned ON in the admin page will show there.
- Products still appear in the main shop/catalogue if "Show Product on Website" is ON.
- Existing sample data has the first few products turned ON as examples; new products default to OFF until selected.

Upload exact files:
- index.html
- script.js
- admin/config.yml
- data/products.json

Then redeploy on Netlify with Clear cache and deploy site.
