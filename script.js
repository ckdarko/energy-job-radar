// SCENTIVITY_ADMIN_FAVORITES_TOGGLE_VISIBLE_20260609
// SCENTIVITY_CUSTOMER_FAVORITES_ADMIN_TOGGLE_20260609
// SCENTIVITY_CHECKOUT_REMOVE_SHIPPING_COUNTRY_20260609
// SCENTIVITY_ADMIN_PRODUCT_STATUS_RATING_BARS_20260609
// SCENTIVITY_HOME_PRODUCTPAGE_RETURN_SUPPORT_20260609
// SCENTIVITY_SHOWCASE_PRODUCTPAGE_BOTTOMNAV_FOOTER_FIX_20260609
// SCENTIVITY_RIGHT_SIDE_BLANK_CLICK_FIX_20260608


// RIGHT-SIDE BLANK CLICK FIX:
// Blank/right-side space should not open Contact, Catalogue, Cart, checkout, or any modal.
(function scentivityRightSideBlankClickFix() {
  const safeInteractiveSelector = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    'label',
    '[role="button"]',
    '.product-click-card[data-product-key]',
    '#productGrid .product-card',
    '.compact-cart-button',
    '.add-to-cart',
    '.header-menu-card',
    '.cart-drawer',
    '.modal.open',
    '.modal-overlay.open > *',
    '.modal-overlay.visible > *',
    '.feedback-modal',
    '.about-modal',
    '.contact-modal',
    '.catalogue-modal',
    '.shipping-modal'
  ].join(',');

  function isBlankClick(event) {
    if (!event || !event.target) return false;
    if (event.target.closest(safeInteractiveSelector)) return false;

    // If a modal/menu overlay itself is clicked, let existing close behavior run only for open modals.
    if (event.target.matches('.modal-overlay.open, .modal-overlay.visible, .cart-overlay.visible')) return false;

    return true;
  }

  document.addEventListener('click', event => {
    if (!isBlankClick(event)) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);

  document.addEventListener('touchend', event => {
    if (!isBlankClick(event)) return;
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);

  // Make sure closed overlays are not accidentally clickable after scripts run.
  function disableClosedOverlayClicks() {
    document.querySelectorAll('.modal-overlay:not(.open):not(.visible), .cart-overlay:not(.visible), .header-menu-panel:not(.open)').forEach(el => {
      el.setAttribute('aria-hidden', 'true');
    });
  }

  document.addEventListener('DOMContentLoaded', disableClosedOverlayClicks);
  window.addEventListener('load', disableClosedOverlayClicks);
  window.setTimeout(disableClosedOverlayClicks, 250);
})();

// SCENTIVITY_PRODUCT_PAGE_NOT_POPUP_20260608
// SCENTIVITY_FEEDBACK_MENU_COMBO_OFF_CART_COUNT_20260608
// SCENTIVITY_CART_RELIABILITY_SINGLE_DEAL_20260608
// SCENTIVITY_HEADER_FOOTER_FEEDBACK_SELECT_UPDATE_20260607
// SCENTIVITY_VIDEO_NAV_COMBO_FEEDBACK_UPDATE_20260607
// SCENTIVITY_HOMEPAGE_VIDEO_UPDATE_20260607
// SCENTIVITY_INTRO_FEEDBACK_MARGIN_FIX_UPDATE_20260607
// SCENTIVITY_NOTIFY_ADMIN_BASE_PREORDER_WHATSAPP_UPDATE_20260606
// SCENTIVITY_NOTIFY_FEEDBACK_ADMIN_UPDATE_20260604
// SCENTIVITY_CATALOGUE_ADMIN_MARQUEE_UPDATE_20260603
// SCENTIVITY_SEARCH_UNDER_COMBO_UPDATE_20260603
// SCENTIVITY_REVIEWS_BUNDLE_TOGGLE_UPDATE_20260603
// SCENTIVITY_DEAL_OF_WEEK_ADMIN_UPDATE_20260602
// SCENTIVITY_CATALOGUE_SHIPPING_UPDATE_20260602
// SCENTIVITY_BUTTONS_SLIDES_FIX_UPDATE_20260602
// SCENTIVITY_LOGO_SLIDESHOW_CONTACT_FIX_UPDATE_20260602
// SCENTIVITY_LAYOUT_CLEANUP_UPDATE_20260602
// SCENTIVITY_MOBILE_UI_FIXES_UPDATE_20260602
// SCENTIVITY_MOBILE_OVERFLOW_FIX_UPDATE_20260602
// SCENTIVITY_MOBILE_PERFUMEGH_STYLE_UPDATE_20260602
// SCENTIVITY_MOBILE_COMBO_BUNDLE_UPDATE_20260601
// SCENTIVITY_COMBO_VISIBLE_CONTENTS_UPDATE_20260601
// SCENTIVITY_COMBO_CART_FIX_UPDATE_20260601
// SCENTIVITY_LIMITED_DEALWEEK_REVIEWS_UPDATE_20260601
// SCENTIVITY_PERFUMEGH_INSPIRED_RESPONSIVE_UPDATE_20260601
// SCENTIVITY_COMBO_DEALS_UPDATE_20260601
// SCENTIVITY_DELIVERY_FEE_NOTE_UPDATE_20260601
// SCENTIVITY_CACHEPROOF_JS_FIX_20260601
const MAIN_CATEGORY_VS = "Victoria's Secret Collection";
const MAIN_CATEGORY_BBW = 'Bath & Body Works Collection';
const MAIN_CATEGORY_DESIGNER = 'Designer and Luxury Fragrances';
const CATALOGUE_GIFT_SETS = 'gift_sets';
const CATALOGUE_COMBOS = 'combos';

const SCENTIVITY_SUBCATEGORIES = [
  "Body Care",
  "Body Lotions and Cream",
  "Fine Fragrance Mist",
  "Body Washes & Shower Gels",
  "Hand Sanitizers",
  "Men's Body Care",
  "Home Fragrances",
  "Scented Candles",
  "Room Sprays",
  "Car Fragrances",
  "Wallflower Refills & Plugs"
];

const defaultProductCatalogue = [
  { label: 'BBW', name: MAIN_CATEGORY_BBW, categoryName: MAIN_CATEGORY_BBW, subcategories: SCENTIVITY_SUBCATEGORIES, showInCatalogue: true },
  { label: 'VICTORIA SECRET', name: MAIN_CATEGORY_VS, categoryName: MAIN_CATEGORY_VS, subcategories: SCENTIVITY_SUBCATEGORIES, showInCatalogue: true },
  { label: 'DESIGNER FRAGRANCE', name: MAIN_CATEGORY_DESIGNER, categoryName: MAIN_CATEGORY_DESIGNER, subcategories: SCENTIVITY_SUBCATEGORIES, showInCatalogue: true },
  { label: 'GIFT SETS', name: CATALOGUE_GIFT_SETS, categoryName: CATALOGUE_GIFT_SETS, subcategories: ['Gift Sets', 'Fine Fragrance Mist', 'Body Care', 'Designer Fragrance'], showInCatalogue: true }
];

let productCatalogue = [...defaultProductCatalogue];

const fallbackProducts = [
  {
    name: "Victoria's Secret Pure Wonder Fragrance Mist",
    brand: "Victoria's Secret",
    mainCategory: MAIN_CATEGORY_VS,
    subCategory: 'Fine Fragrance Mist',
    price: 'GH₵250',
    image: 'assets/products/citrus-bloom.svg',
    notes: 'A bright, feminine mist profile for daily wear. Add exact notes and stock details in the admin dashboard.',
    size: '236 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Bath & Body Works Body Cream',
    brand: 'Bath & Body Works',
    mainCategory: MAIN_CATEGORY_BBW,
    subCategory: 'Body Lotions and Cream',
    price: 'GH₵220',
    image: 'assets/products/velvet-rose.svg',
    notes: 'Moisturizing body cream options from popular sweet, floral, fresh, and warm scent families.',
    size: '226 g / 8 oz',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Sweet Signature Eau de Parfum',
    brand: 'Scentivity',
    mainCategory: MAIN_CATEGORY_DESIGNER,
    subCategory: 'Home Fragrances',
    price: 'GH₵450',
    image: 'assets/products/amber-noir.svg',
    notes: 'A polished sweet scent profile with soft florals, vanilla, amber, and clean musk.',
    size: '50 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Men’s Fresh Body Spray',
    brand: 'Scentivity',
    mainCategory: MAIN_CATEGORY_DESIGNER,
    subCategory: 'Men’s Fragrance',
    price: 'GH₵180',
    image: 'assets/products/oud-muse.svg',
    notes: 'Fresh, confident masculine scent profile for everyday use and gifting.',
    size: '100 mL',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Scented 3-Wick Candle',
    brand: 'Scentivity',
    mainCategory: MAIN_CATEGORY_BBW,
    subCategory: 'Scented Candles',
    price: 'GH₵300',
    image: 'assets/products/velvet-rose.svg',
    notes: 'Home fragrance candle options for bedrooms, bathrooms, gifts, and cozy spaces.',
    size: '3-wick candle',
    available: true,
    paymentLink: ''
  },
  {
    name: 'Pocket Hand Sanitizer',
    brand: 'Scentivity',
    mainCategory: MAIN_CATEGORY_BBW,
    subCategory: 'Hand Sanitizers',
    price: 'GH₵45',
    image: 'assets/products/citrus-bloom.svg',
    notes: 'Portable scented sanitizer options for bags, cars, school, work, and gifting.',
    size: 'Travel size',
    available: true,
    paymentLink: ''
  }
];


const fallbackCombos = [
  {
    name: 'Sweet Starter Combo',
    description: 'A simple pair for everyday freshness: one fragrance mist and one body care item.',
    includedItems: 'Fragrance mist + body lotion or cream',
    originalPrice: 'GH₵470',
    comboPrice: 'GH₵430',
    discountText: 'Save GH₵40',
    image: 'assets/products/velvet-rose.svg',
    available: true
  },
  {
    name: 'Home & Body Refresh Combo',
    description: 'A refreshing bundle for personal care and a sweet-smelling space.',
    includedItems: 'Body care item + hand sanitizer + room spray or candle',
    originalPrice: 'GH₵565',
    comboPrice: 'GH₵510',
    discountText: 'Save GH₵55',
    image: 'assets/products/citrus-bloom.svg',
    available: true
  },
  {
    name: 'Luxury Gift Combo',
    description: 'A gift-ready set for birthdays, surprises, appreciation packages, and special occasions.',
    includedItems: 'Designer fragrance + fragrance mist/body care add-on',
    originalPrice: 'GH₵700',
    comboPrice: 'GH₵630',
    discountText: 'Save GH₵70',
    image: 'assets/products/amber-noir.svg',
    available: true
  }
];





const fallbackComboDealsSettings = {
  enabled: false,
  heading: 'Save more with curated scent bundles.',
  description: 'Pick a discounted combo, add it to cart, and checkout the same way as regular products.'
};


const fallbackBundleBuilderSettings = {
  enabled: false,
  discountTwoItems: 5,
  discountThreeOrMore: 10,
  note: ''
};


const fallbackDealOfWeek = {
  enabled: true,
  itemType: 'product',
  productName: '',
  comboName: '',
  badgeText: 'Deal of the Week',
  title: 'This week’s featured scent.',
  description: 'A highlighted Scentivity favorite available this week.',
  buttonText: 'Add Deal to Cart',
  image: ''
};


let products = [];
let combos = [];
let comboDealsSettings = { ...fallbackComboDealsSettings };
let dealOfWeek = { ...fallbackDealOfWeek };
let bundleBuilderSettings = { ...fallbackBundleBuilderSettings };
let customerReviews = [];
let homepageVideoSettings = {};
let activeMainCategory = 'all';
let activeSubCategory = 'all';
let activeSearchTerm = '';
let showcaseIndex = 0;
let showcaseTimer = null;
let cart = [];
let selectedBundleProductKeys = new Set();

const SCENTIVITY_EMAIL = 'scentivitygh@gmail.com';
const SCENTIVITY_WHATSAPP = '233534584470';
const CART_STORAGE_KEY = 'scentivityCartV1';
cart = loadCart();
const CHECKOUT_PAYMENT_METHOD_CARD = 'card';
const CHECKOUT_PAYMENT_METHOD_MOMO = 'momo';
const CHECKOUT_PAYMENT_METHOD_PICKUP = 'pay_on_pickup';

function buildEmailLink(subject, body) {
  return `mailto:${SCENTIVITY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildWhatsAppLink(message) {
  return `https://wa.me/${SCENTIVITY_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

const dealOfWeekCard = document.querySelector('#dealOfWeekCard') || document.querySelector('.hero-deal-card');
const productGrid = document.querySelector('#productGrid');
const comboDealsSection = document.querySelector('#comboDeals')?.closest('section') || document.querySelector('#comboDeals');
const comboGrid = document.querySelector('#comboGrid');
const bundleBuilderSection = document.querySelector('#bundleBuilder');
const bundleBuilderGrid = document.querySelector('#bundleBuilderGrid');
const bundleBuilderSummary = document.querySelector('#bundleBuilderSummary');
const addBuiltBundleToCartButton = document.querySelector('#addBuiltBundleToCart');
const feedbackProductChoices = document.querySelector('#feedbackProductChoices');
const feedbackProductsPurchasedInput = document.querySelector('#feedbackProductsPurchased');
const toggleFeedbackProductsButton = document.querySelector('#toggleFeedbackProducts');
const feedbackProductCount = document.querySelector('#feedbackProductCount');
const mainCategoryFilters = document.querySelector('#mainCategoryFilters');
const subCategoryFilters = document.querySelector('#subCategoryFilters');
const productSearch = document.querySelector('#productSearch');
const navSearchButton = document.querySelector('#navSearchButton');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const backToTop = document.querySelector('#backToTop');
const cartToggle = document.querySelector('#cartToggle');
const cartToggleFooter = document.querySelector('#cartToggleFooter');
const cartCount = document.querySelector('#cartCount');
const cartCountFooter = document.querySelector('#cartCountFooter');
const mobileCartButton = document.querySelector('#mobileCartButton');
const mobileCartCount = document.querySelector('#mobileCartCount');
const cartOverlay = document.querySelector('#cartOverlay');
const cartDrawer = document.querySelector('#cartDrawer');
const closeCartButton = document.querySelector('#closeCart');
const cartItemsContainer = document.querySelector('#cartItems');
const cartEmptyMessage = document.querySelector('#cartEmptyMessage');
const cartSubtotal = document.querySelector('#cartSubtotal');
const cartTotal = document.querySelector('#cartTotal');
const checkoutForm = document.querySelector('#checkoutForm');
const fulfillmentRadios = document.querySelectorAll('input[name="fulfillment"]');
const deliveryFields = document.querySelector('#deliveryFields');
const pickupFields = document.querySelector('#pickupFields');
const paymentMethodSelect = document.querySelector('#paymentMethod');
const paymentStatus = document.querySelector('#paymentStatus');
const emailRequestForm = document.querySelector('#emailRequestForm');
emailRequestForm?.addEventListener('submit', event => {
  event.preventDefault();

  const formData = new FormData(emailRequestForm);
  const name = cleanText(formData.get('name') || '');
  const message = cleanText(formData.get('message') || '');

  if (!name || !message) {
    alert('Please enter your name and fragrance request.');
    return;
  }

  const whatsappMessage = [
    'Hello Scentivity,',
    '',
    'I would like to send a preorder / fragrance request.',
    '',
    `Name: ${name}`,
    `Request: ${message}`
  ].join('\n');

  window.open(buildWhatsAppLink(whatsappMessage), '_blank', 'noopener,noreferrer');
  emailRequestForm.reset();
});


function cleanText(value = '') {
  return String(value).replace(/[<>]/g, '').trim();
}

function slugify(value = '') {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeImagePath(path) {
  if (!path) return 'assets/products/velvet-rose.svg';
  return path.startsWith('/') ? path.slice(1) : path;
}


function normalizeCatalogueSubcategoryList(subcategories = []) {
  if (!Array.isArray(subcategories)) return [];
  return subcategories
    .map(item => typeof item === 'string' ? item : (item?.name || item?.label || item?.value || ''))
    .map(cleanText)
    .filter(Boolean);
}

function normalizeCatalogueItem(item = {}) {
  const label = cleanText(item.label || item.buttonLabel || item.name || item.categoryName || item.value || '');
  const categoryName = cleanText(item.categoryName || item.name || item.value || label);
  return {
    label: label || categoryName || 'Catalogue',
    name: categoryName,
    categoryName,
    subcategories: normalizeCatalogueSubcategoryList(item.subcategories),
    showInCatalogue: item.showInCatalogue !== false && item.enabled !== false
  };
}

function normalizeProductCatalogue(items = []) {
  const source = Array.isArray(items) && items.length ? items : defaultProductCatalogue;
  const merged = [...defaultProductCatalogue, ...source]
    .map(normalizeCatalogueItem)
    .filter(item => item.name);
  const seen = new Set();
  return merged.filter(item => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function findCatalogueByName(name = '') {
  const target = cleanText(name).toLowerCase();
  if (!target) return null;
  return productCatalogue.find(item =>
    cleanText(item.name).toLowerCase() === target ||
    cleanText(item.categoryName).toLowerCase() === target ||
    cleanText(item.label).toLowerCase() === target
  ) || null;
}


function normalizeMainCategory(product = {}) {
  const mainRaw = cleanText(product.mainCategory || product.category || '');
  const main = mainRaw.toLowerCase();
  const brand = cleanText(product.brand || '').toLowerCase();
  const combined = `${main} ${brand}`;

  const catalogueMatch = findCatalogueByName(mainRaw);
  if (catalogueMatch) return catalogueMatch.name;

  if (combined.includes('victoria')) return MAIN_CATEGORY_VS;
  if (combined.includes('bath') || main.includes('body care') || main.includes('home fragrance')) return MAIN_CATEGORY_BBW;
  if (main.includes('gift')) return CATALOGUE_GIFT_SETS;
  if (mainRaw) return mainRaw;

  return MAIN_CATEGORY_DESIGNER;
}

function legacyMainCategory(product) {
  return normalizeMainCategory(product);
}

function getMainCategory(product) {
  return normalizeMainCategory(product);
}

function normalizeSubCategory(value = '') {
  const raw = cleanText(value || '');
  const key = raw.toLowerCase().replace(/[’']/g, "'");
  const map = {
    'body lotion & cream': 'Body Lotions and Cream',
    'body lotion and cream': 'Body Lotions and Cream',
    'body lotions and cream': 'Body Lotions and Cream',
    'body wash & shower gel': 'Body Washes & Shower Gels',
    'body washes & shower gels': 'Body Washes & Shower Gels',
    'candles': 'Scented Candles',
    'scented candles': 'Scented Candles',
    'wallflowers': 'Wallflower Refills & Plugs',
    'wallflower': 'Wallflower Refills & Plugs',
    'wallflower refills & plugs': 'Wallflower Refills & Plugs',
    'men’s body care': "Men's Body Care",
    "men's body care": "Men's Body Care",
    'home fragrance': 'Home Fragrances',
    'home fragrances': 'Home Fragrances',
    'body mist': 'Fine Fragrance Mist',
    'fragrance mist': 'Fine Fragrance Mist',
    'fine fragrance mist': 'Fine Fragrance Mist',
    'hand sanitizers': 'Hand Sanitizers',
    'hand sanitizer': 'Hand Sanitizers',
    'room spray': 'Room Sprays',
    'room sprays': 'Room Sprays',
    'car fragrance': 'Car Fragrances',
    'car fragrances': 'Car Fragrances',
    'body care': 'Body Care'
  };
  return map[key] || raw || 'Body Care';
}

function getSubCategory(product) {
  return normalizeSubCategory(product.subCategory || product.category || 'Body Care');
}

function parseGHSPrice(price = '') {
  const match = String(price).replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function formatGHS(amount) {
  return `GH₵${Number(amount || 0).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function makeProductKey(product, index) {
  return slugify(`${product.name || 'product'}-${product.size || ''}-${product.price || ''}-${index}`) || `product-${index}`;
}

function enrichProducts(list) {
  return list.map((product, index) => ({
    ...product,
    _key: product.id || product.slug || makeProductKey(product, index),
    _unitPrice: parseGHSPrice(product.price),
    rating: product.rating ?? product.averageRating ?? 4.8,
    reviewCount: product.reviewCount ?? product.reviewsCount ?? product.numberOfReviews ?? 0,
    purchaseCount: product.purchaseCount ?? product.numberPurchased ?? product.purchases ?? product.soldCount ?? 0,
    availableQuantity: product.availableQuantity ?? product.stockQuantity ?? product.quantityAvailable ?? product.stock ?? 0,
    productDetails: product.productDetails || product.description || product.details || product.notes || '',
    fragranceNotes: product.fragranceNotes || product.scentNotes || product.notes || '',
    ingredients: product.ingredients || '',
    showOnWebsite: product.showOnWebsite !== false
  }));
}



function productPageUrl(productOrKey = '', productName = '', productSlug = '') {
  if (productOrKey && typeof productOrKey === 'object') {
    const key = cleanText(productOrKey._key || productOrKey.id || productOrKey.slug || '');
    const name = cleanText(productOrKey.name || productName || '');
    const slug = cleanText(productOrKey.slug || slugify(name || key));
    return `product.html?product=${encodeURIComponent(key)}&slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
  }
  const key = cleanText(productOrKey || '');
  const name = cleanText(productName || '');
  const slug = cleanText(productSlug || slugify(name || key));
  return `product.html?product=${encodeURIComponent(key)}&slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
}

function productRating(product = {}) {
  const value = Number(product.rating || product.averageRating || product.stars || 4.8);
  return Number.isFinite(value) ? Math.max(1, Math.min(5, value)) : 4.8;
}

function productReviewCount(product = {}) {
  const value = Number(product.reviewCount || product.reviewsCount || product.numberOfReviews || 0);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

function productPurchaseCount(product = {}) {
  const value = Number(product.purchaseCount || product.numberPurchased || product.purchases || product.soldCount || 0);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

function productAvailableQuantity(product = {}) {
  const value = Number(product.availableQuantity || product.stockQuantity || product.quantityAvailable || product.stock || 0);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}

function ratingStars(rating = 5) {
  const rounded = Math.max(1, Math.min(5, Math.round(Number(rating || 5))));
  return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);
}

function formatCompactCount(value = 0) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return '0';
  if (number >= 1000) return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1).replace('.0', '')}k`;
  return String(Math.round(number));
}

function isProductPublished(product = {}) {
  return product.showOnWebsite !== false &&
    product.hideFromWebsite !== true &&
    product.hidden !== true;
}

function productDetailMeta(product = {}) {
  return {
    rating: productRating(product),
    reviews: productReviewCount(product),
    bought: productPurchaseCount(product),
    stock: productAvailableQuantity(product)
  };
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function buttonMarkup(label, value, activeValue, dataName) {
  return `<button class="filter ${value === activeValue ? 'active' : ''}" data-${dataName}="${cleanText(value)}">${cleanText(label)}</button>`;
}

function renderMainCategoryFilters() {
  if (!mainCategoryFilters) return;

  const catalogueButtons = [
    { label: 'ALL', value: 'all' },
    ...productCatalogue
      .filter(item => item.showInCatalogue !== false)
      .map(item => ({ label: item.label || item.name, value: item.name })),
    { label: 'COMBOS', value: CATALOGUE_COMBOS }
  ];

  mainCategoryFilters.innerHTML = catalogueButtons
    .map(item => buttonMarkup(item.label, item.value, activeMainCategory, 'main'))
    .join('');
}

function getSubcategoriesForActiveMain() {
  if (activeMainCategory === CATALOGUE_COMBOS) return [];

  const productSubs = products
    .filter(product => activeMainCategory === 'all' || getMainCategory(product) === activeMainCategory)
    .map(getSubCategory);

  const taxonomySubs = activeMainCategory === 'all'
    ? productCatalogue.flatMap(item => item.subcategories || [])
    : (findCatalogueByName(activeMainCategory)?.subcategories || []);

  return uniqueSorted([...taxonomySubs, ...productSubs]);
}

function renderSubCategoryFilters() {
  if (!subCategoryFilters) return;
  const subcategories = getSubcategoriesForActiveMain();
  if (!subcategories.length) {
    subCategoryFilters.innerHTML = '<span class="catalogue-hint">Combos are shown in the Combo Deals section.</span>';
    return;
  }
  subCategoryFilters.innerHTML = [
    buttonMarkup('ALL TYPES', 'all', activeSubCategory, 'sub'),
    ...subcategories.map(category => buttonMarkup(category, category, activeSubCategory, 'sub'))
  ].join('');
}


function enrichCombos(items = []) {
  return items.map((combo, index) => {
    const name = cleanText(combo.name || `Scentivity Combo ${index + 1}`);
    const originalUnitPrice = parseGHSPrice(combo.originalPrice);
    const comboUnitPrice = parseGHSPrice(combo.comboPrice || combo.price);
    return {
      ...combo,
      _key: `combo-${slugify(name)}-${index}`,
      _unitPrice: comboUnitPrice,
      _originalUnitPrice: originalUnitPrice,
      itemType: 'combo'
    };
  });
}

function comboSavings(combo = {}) {
  const original = Number(combo._originalUnitPrice || parseGHSPrice(combo.originalPrice));
  const discounted = Number(combo._unitPrice || parseGHSPrice(combo.comboPrice || combo.price));
  if (original > discounted && discounted > 0) return original - discounted;
  return 0;
}

function comboWhatsAppMessage(combo = {}) {
  const name = cleanText(combo.name || 'Scentivity combo');
  const includedItems = cleanText(combo.includedItems || 'Combo items');
  const price = cleanText(combo.comboPrice || combo.price || 'Price on request');
  const discountText = cleanText(combo.discountText || '');
  return `Hello Scentivity,

I am interested in this combo deal:

Combo: ${name}
Includes: ${includedItems}
Combo price: ${price}
${discountText ? `Discount: ${discountText}` : ''}

Please confirm availability.

Customer name:
Phone number:
Pickup or delivery:
Delivery address if needed:
Quantity:`;
}


function getVisibleProducts() {
  if (activeMainCategory === CATALOGUE_COMBOS) return [];

  const search = activeSearchTerm.toLowerCase();
  return products.filter(product => {
    if (!isProductPublished(product)) return false;
    const mainCategory = getMainCategory(product);
    const subCategory = getSubCategory(product);
    const searchableText = [
      product.name,
      product.brand,
      mainCategory,
      subCategory,
      product.size,
      product.notes,
      product.price
    ].join(' ').toLowerCase();

    const isGiftSet = activeMainCategory === CATALOGUE_GIFT_SETS
      ? searchableText.includes('gift') || searchableText.includes('set') || searchableText.includes('bundle')
      : true;

    const matchesMain = activeMainCategory === 'all'
      || activeMainCategory === CATALOGUE_GIFT_SETS
      || mainCategory === activeMainCategory;
    const matchesSub = activeSubCategory === 'all' || subCategory === activeSubCategory;
    const matchesSearch = !search || searchableText.includes(search);
    return matchesMain && matchesSub && matchesSearch && isGiftSet;
  });
}

function productWhatsAppMessage(product) {
  const name = cleanText(product.name || 'Untitled product');
  const brand = cleanText(product.brand || 'Scentivity');
  const mainCategory = getMainCategory(product);
  const subCategory = getSubCategory(product);
  const price = cleanText(product.price || 'Price on request');
  const size = cleanText(product.size || 'Not specified');
  return `Hello Scentivity,\n\nI am interested in this product:\n\nProduct: ${name}\nBrand: ${brand}\nCategory: ${mainCategory} / ${subCategory}\nSize: ${size}\nPrice: ${price}\n\nPlease confirm availability.\n\nCustomer name:\nPhone number:\nPickup or delivery:\nDelivery address, if needed:\nQuantity:`;
}



function comboContainsListHtml(includedItems = '') {
  const items = cleanText(includedItems)
    .split(/\s*(?:\+|;|\n|, and | and )\s*/i)
    .map(item => item.trim())
    .filter(Boolean);

  if (!items.length) return '<p class="combo-contains-empty">Selected Scentivity products</p>';

  return `<ul class="combo-contains-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}


function findItemByName(items = [], name = '') {
  const target = cleanText(name).toLowerCase();
  if (!target) return null;
  return items.find(item => cleanText(item.name || '').toLowerCase() === target) || null;
}

function getDealOfWeekSelection() {
  const config = dealOfWeek || fallbackDealOfWeek;
  const explicitType = cleanText(config.itemType || config.type || 'product').toLowerCase();

  let item = null;
  let itemType = 'product';

  if (explicitType.includes('combo')) {
    item = findItemByName(combos, config.comboName) || combos.find(combo => combo.isDealOfWeek && combo.available !== false);
    itemType = 'combo';
  } else {
    item = findItemByName(products, config.productName) || products.find(product => product.isDealOfWeek && product.available !== false);
    itemType = 'product';
  }

  if (!item) {
    const flaggedProduct = products.find(product => product.isDealOfWeek && product.available !== false);
    const firstProduct = products.find(product => product.available !== false);
    if (flaggedProduct) {
      item = flaggedProduct;
      itemType = 'product';
    } else if (firstProduct) {
      item = firstProduct;
      itemType = 'product';
    }
  }

  // Only fall back to a combo if there is no available product at all.
  if (!item) {
    const flaggedCombo = combos.find(combo => combo.isDealOfWeek && combo.available !== false);
    const firstCombo = combos.find(combo => combo.available !== false);
    if (flaggedCombo || firstCombo) {
      item = flaggedCombo || firstCombo;
      itemType = 'combo';
    }
  }

  return { item, itemType, config };
}

function normalizeHomepageVideoSettings(settings = {}) {
  return {
    enabled: settings.enabled !== false,
    videoFile: normalizeImagePath(settings.videoFile || 'assets/scentivity-homepage-video.mp4'),
    posterImage: normalizeImagePath(settings.posterImage || 'assets/scentivity-video-poster.svg'),
    headline: cleanText(settings.headline || 'Sweet scents in motion.'),
    subheading: cleanText(settings.subheading || 'Discover fragrance mists, body care, luxury scents, and gift-ready deals.'),
    buttonText: cleanText(settings.buttonText || 'Shop the collection'),
    buttonLink: cleanText(settings.buttonLink || '#products')
  };
}

function renderHomepageVideo() {
  const section = document.querySelector('#homepageVideoSection');
  if (!section) return;

  const settings = normalizeHomepageVideoSettings(homepageVideoSettings || {});
  if (!settings.enabled) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');

  const video = section.querySelector('#homepageVideo');
  const source = video?.querySelector('source');
  const overlayTitle = section.querySelector('.homepage-video-overlay h2');
  const overlayText = section.querySelector('.homepage-video-overlay p:not(.eyebrow)');
  const overlayButton = section.querySelector('.homepage-video-overlay .btn');

  if (video) video.poster = settings.posterImage;
  if (source && source.getAttribute('src') !== settings.videoFile) {
    source.setAttribute('src', settings.videoFile);
    video?.load();
  }
  if (overlayTitle) overlayTitle.textContent = settings.headline;
  if (overlayText) overlayText.textContent = settings.subheading;
  if (overlayButton) {
    overlayButton.textContent = settings.buttonText;
    overlayButton.setAttribute('href', settings.buttonLink || '#products');
  }

  const playPromise = video?.play?.();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => section.classList.add('video-paused'));
  }
}


function renderDealOfWeek() {
  if (!dealOfWeekCard) return;
  const config = dealOfWeek || fallbackDealOfWeek;
  if (config.enabled === false) {
    dealOfWeekCard.classList.add('hidden');
    return;
  }

  const { item, itemType } = getDealOfWeekSelection();
  if (!item) return;

  dealOfWeekCard.classList.remove('hidden');

  const isCombo = itemType === 'combo';
  const name = cleanText(item.name || 'Scentivity deal');
  const image = normalizeImagePath(config.image || item.image || 'assets/scentivity-logo-fused.png');
  const badge = cleanText(config.badgeText || 'Deal of the Week');
  const title = cleanText(config.title || (isCombo ? name : `This week’s featured scent: ${name}`));
  const description = cleanText(config.description || item.description || item.notes || item.includedItems || 'Shop this highlighted Scentivity deal while it is available.');
  const price = cleanText(isCombo ? (item.comboPrice || item.price || 'Price on request') : (item.price || 'Price on request'));
  const savings = isCombo ? cleanText(item.discountText || '') : '';
  const buttonText = cleanText(config.buttonText || 'Add Deal to Cart');
  const subText = isCombo ? cleanText(item.includedItems || 'Combo deal') : [cleanText(item.brand || 'Scentivity'), cleanText(item.size || ''), getSubCategory(item)].filter(Boolean).join(' • ');
  const dataAttribute = isCombo ? `data-deal-combo-key="${item._key}"` : `data-deal-product-key="${item._key}"`;
  const clickableAttribute = isCombo ? '' : `data-product-key="${item._key}"`;

  dealOfWeekCard.classList.toggle('product-click-card', !isCombo);
  if (!isCombo) dealOfWeekCard.dataset.productKey = item._key;

  dealOfWeekCard.innerHTML = `
    <div class="deal-week-visual ${isCombo ? '' : 'product-click-card'}" ${clickableAttribute} tabindex="0">
      <span class="deal-tag">${badge}</span>
      <div class="deal-week-product-frame">
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
      </div>
    </div>
    <div class="deal-week-content">
      <p class="eyebrow">${isCombo ? 'Featured combo' : 'Featured product'}</p>
      <h2>${title}</h2>
      <p>${description}</p>
      <div class="deal-week-meta">
        <strong>${price}</strong>
        ${savings ? `<span>${savings}</span>` : ''}
      </div>
      <p class="deal-week-includes">${subText}</p>
      <div class="deal-week-actions">
        <button class="btn primary" type="button" ${dataAttribute}>${buttonText}</button>
        ${isCombo
          ? `<a class="btn ghost" href="${buildWhatsAppLink(`Hello Scentivity,%0A%0AI am interested in the Deal of the Week:%0A${name}%0A%0APlease confirm availability.`)}" target="_blank" rel="noreferrer">Ask about deal</a>`
          : `<button class="btn ghost product-view-button" type="button" data-product-key="${item._key}">View product</button>`
        }
      </div>
    </div>
  `;
}


function renderCombos() {
  document.querySelectorAll('a[href="#comboDeals"], [data-combos-link]').forEach(link => {
    link.classList.toggle('hidden', comboDealsSettings.enabled === false);
  });

  if (comboDealsSection) {
    comboDealsSection.classList.toggle('hidden', comboDealsSettings.enabled === false);
  }

  if (!comboGrid) return;

  if (comboDealsSettings.enabled === false) {
    comboGrid.innerHTML = '';
    return;
  }

  const comboHeading = document.querySelector('#comboDeals .combo-heading h3');
  const comboDescription = document.querySelector('#comboDeals .combo-heading p:not(.eyebrow)');
  if (comboHeading && comboDealsSettings.heading) comboHeading.textContent = comboDealsSettings.heading;
  if (comboDescription && comboDealsSettings.description) comboDescription.textContent = comboDealsSettings.description;

  const visibleCombos = combos.filter(combo => combo.available !== false);
  if (!visibleCombos.length) {
    comboGrid.innerHTML = '<p class="empty-state">No combo deals are available right now. Check back soon or send a custom request.</p>';
    return;
  }

  comboGrid.innerHTML = visibleCombos.map(combo => {
    const name = cleanText(combo.name || 'Scentivity Combo');
    const includedItems = cleanText(combo.includedItems || 'Selected Scentivity products');
    const comboPrice = cleanText(combo.comboPrice || combo.price || 'Price on request');
    const discountText = cleanText(combo.discountText || '');
    const image = normalizeImagePath(combo.image || 'assets/products/velvet-rose.svg');
    const savings = comboSavings(combo);
    const requestLink = buildWhatsAppLink(comboWhatsAppMessage(combo));
    const savingsLabel = discountText || (savings > 0 ? `Save ${formatGHS(savings)}` : 'Discounted combo');

    return `
      <article class="combo-card" data-combo-contains="${includedItems}">
        <div class="combo-image-wrap">
          <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
          <span class="combo-badge">${savingsLabel}</span>
        </div>
        <div class="combo-info">
          <span class="product-brand">Combo deal</span>
          <h3>${name}</h3>
          <div class="combo-prices">
            <span class="combo-new-price"><small>Combo price</small><strong>${comboPrice}</strong></span>
            <span class="combo-save-pill">${savingsLabel}</span>
          </div>
          <div class="product-actions">
            <button class="btn primary add-combo-to-cart" type="button" data-combo-key="${combo._key}">Add Combo to Cart</button>
            <a class="btn ghost" href="${requestLink}" target="_blank" rel="noreferrer">Ask about combo</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function compactProductCard(product = {}) {
  const name = cleanText(product.name || 'Untitled product');
  const brand = cleanText(product.brand || 'Scentivity');
  const price = cleanText(product.price || 'Price on request');
  const image = normalizeImagePath(product.image || 'assets/scentivity-logo-fused.png');
  const available = product.available !== false;
  const key = cleanText(product._key || '');
  const meta = productDetailMeta(product);
  return `
    <article class="product-card compact-product-card product-click-card ${available ? '' : 'is-unavailable'}" data-product-key="${key}" tabindex="0" aria-label="View details for ${name}">
      <div class="compact-product-image">
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
        <span class="compact-product-badge ${available ? '' : 'coming'}">${available ? 'Available' : 'Out of stock'}</span>
      </div>
      <div class="compact-product-info">
        <small>${brand}</small>
        <h3>${name}</h3>
        <div class="compact-product-meta">
          <span class="star-rating-symbol">★</span>
          <span>${meta.rating.toFixed(1)}</span>
          ${meta.reviews ? `<span>| ${formatCompactCount(meta.reviews)} reviews</span>` : ''}
          ${meta.bought ? `<span>| ${formatCompactCount(meta.bought)} bought</span>` : ''}
        </div>
        <div class="compact-product-bottom">
          <strong>${price}</strong>
          ${available
            ? `<button class="compact-cart-button add-to-cart" type="button" data-product-key="${key}" aria-label="Add ${name} to cart">🛒</button>`
            : `<button class="compact-cart-button notify-me-button" type="button" data-notify-product="${name}" data-notify-brand="${brand}" data-notify-size="${cleanText(product.size || '')}" aria-label="Notify me about ${name}">🔔</button>`
          }
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  if (!productGrid) return;
  const visibleProducts = getVisibleProducts();
  productGrid.classList.add('two-product-mobile-grid');
  productGrid.innerHTML = '';
  if (!visibleProducts.length) {
    productGrid.innerHTML = '<p class="empty-state">No products match this selection yet. Try a different category, clear the search, or add the product from the Scentivity admin page.</p>';
    return;
  }
  productGrid.innerHTML = visibleProducts.map(product => compactProductCard(product)).join('');
}

function getHomepageSlides() {
  const publishedProducts = products.filter(product => isProductPublished(product));
  const availableSlides = publishedProducts
    .filter(product => product.available !== false)
    .slice(0, 8)
    .map(product => ({ ...product, _slideStatus: 'Available now', _slideType: 'available' }));

  const comingSoonSlides = publishedProducts
    .filter(product => product.available === false)
    .slice(0, 4)
    .map(product => ({ ...product, _slideStatus: 'Coming soon', _slideType: 'coming-soon' }));

  return [...availableSlides, ...comingSoonSlides].slice(0, 10);
}

function renderHomepageShowcase() {
  if (!homepageProductSlides) return;
  const slides = getHomepageSlides();
  if (!slides.length) {
    homepageProductSlides.innerHTML = `
      <article class="showcase-slide active fallback-showcase">
        <div class="showcase-image-wrap">
          <img src="assets/scentivity-logo-fused.png" alt="Scentivity logo" loading="lazy" />
          <span class="showcase-badge soon">No products yet</span>
        </div>
        <div class="showcase-copy">
          <p class="eyebrow">Scentivity</p>
          <h3>Products will appear here</h3>
          <p>Turn on Show Product on Website for products in the admin page.</p>
        </div>
      </article>
    `;
    if (homepageProductDots) homepageProductDots.innerHTML = '';
    return;
  }

  showcaseIndex = ((showcaseIndex % slides.length) + slides.length) % slides.length;
  const product = slides[showcaseIndex];
  const name = cleanText(product.name || 'Scentivity product');
  const brand = cleanText(product.brand || 'Scentivity');
  const price = cleanText(product.price || (product.available === false ? 'Out of stock' : 'Price on request'));
  const image = normalizeImagePath(product.image || 'assets/scentivity-logo-fused.png');
  const available = product.available !== false;
  const key = cleanText(product._key || '');
  const meta = productDetailMeta(product);

  homepageProductSlides.innerHTML = `
    <article class="showcase-slide active simplified-showcase-slide product-click-card" data-product-key="${key}" tabindex="0" aria-label="View details for ${name}">
      <div class="showcase-image-wrap">
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
        <span class="showcase-badge ${available ? 'available' : 'soon'}">${available ? 'Available now' : 'Out of stock'}</span>
      </div>
      <div class="showcase-copy">
        <p class="eyebrow">${available ? 'Available now' : 'Out of stock'} • ${showcaseIndex + 1} of ${slides.length}</p>
        <h3>${name}</h3>
        <div class="compact-product-meta showcase-quick-meta">
          <span class="star-rating-symbol">★</span>
          <span>${meta.rating.toFixed(1)}</span>
          ${meta.reviews ? `<span>| ${formatCompactCount(meta.reviews)} reviews</span>` : ''}
          ${meta.bought ? `<span>| ${formatCompactCount(meta.bought)} bought</span>` : ''}
        </div>
        <div class="showcase-bottom">
          <strong>${price}</strong>
          ${available
            ? `<button class="btn primary add-to-cart" type="button" data-product-key="${key}">Add to Cart</button>`
            : `<button class="btn ghost notify-me-button" type="button" data-notify-product="${name}" data-notify-brand="${brand}" data-notify-size="${cleanText(product.size || '')}">Notify Me</button>`
          }
        </div>
      </div>
    </article>
  `;

  homepageProductSlides.style.transform = 'translateX(0)';

  if (homepageProductDots) {
    homepageProductDots.innerHTML = slides.map((_, index) => `
      <button type="button" class="showcase-dot ${index === showcaseIndex ? 'active' : ''}" data-slide-index="${index}" aria-label="Show slide ${index + 1}"></button>
    `).join('');
  }
}

function moveShowcase(direction = 1) {
  const total = getHomepageSlides().length;
  if (!total) return;
  showcaseIndex = (showcaseIndex + direction + total) % total;
  renderHomepageShowcase();
}

function startShowcaseAutoplay() {
  if (!homepageProductSlides) return;
  window.clearInterval(showcaseTimer);
  showcaseTimer = window.setInterval(() => moveShowcase(1), 6500);
}

function refreshShop() {
  renderMainCategoryFilters();
  renderSubCategoryFilters();
  renderProducts();
}

function loadCart() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => item && item.key && item.name && Number(item.quantity || 0) > 0)
      .map(item => ({
        ...item,
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0)
      }));
  } catch (error) {
    console.warn('Could not load Scentivity cart from storage.', error);
    return [];
  }
}

function saveCart() {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn('Could not save Scentivity cart.', error);
  }
}

function getCartQuantity() {
  return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0);
}

function getSelectedFulfillment() {
  return document.querySelector('input[name="fulfillment"]:checked')?.value || 'delivery';
}

function updateCartTotals() {
  const total = getCartTotal();
  if (cartSubtotal) cartSubtotal.textContent = formatGHS(total);
  if (cartTotal) cartTotal.textContent = formatGHS(total);
}

function updateCartCount() {
  const quantityNumber = getCartQuantity();
  const quantity = String(quantityNumber);

  [cartCount, cartCountFooter, mobileCartCount].forEach(target => {
    if (target) target.textContent = quantity;
  });

  document.querySelectorAll('[data-cart-count], #cartCount, #cartCountFooter, #mobileCartCount').forEach(target => {
    target.textContent = quantity;
  });

  mobileCartButton?.classList.toggle('has-items', quantityNumber > 0);
  cartToggle?.classList.toggle('has-items', quantityNumber > 0);
  cartToggleFooter?.classList.toggle('has-items', quantityNumber > 0);
}

function getBundleSelectedProducts() {
  const checkedKeys = new Set([...document.querySelectorAll('#bundleBuilderGrid input[type="checkbox"]:checked')].map(input => input.value));
  if (checkedKeys.size) {
    selectedBundleProductKeys = checkedKeys;
  }
  return products.filter(product => selectedBundleProductKeys.has(product._key) && product.available !== false);
}

function getBundleDiscountRate(count) {
  const twoItemDiscount = Math.max(0, Number(bundleBuilderSettings.discountTwoItems || 0)) / 100;
  const threeItemDiscount = Math.max(0, Number(bundleBuilderSettings.discountThreeOrMore || 0)) / 100;
  if (count >= 3) return threeItemDiscount;
  if (count >= 2) return twoItemDiscount;
  return 0;
}

function renderBundleBuilder() {
  if (!bundleBuilderGrid) return;

  if (bundleBuilderSettings.enabled !== true) {
    if (bundleBuilderSection) bundleBuilderSection.classList.add('hidden');
    bundleBuilderGrid.innerHTML = '';
    return;
  }

  if (bundleBuilderSection) bundleBuilderSection.classList.remove('hidden');
  const availableProducts = products
    .filter(product => product.available !== false)
    .filter(product => Number(product._unitPrice || parseGHSPrice(product.price)) > 0);

  if (!availableProducts.length) {
    bundleBuilderGrid.innerHTML = '<p class="empty-state">Add products with prices first, then customers can build their own bundle.</p>';
    updateBundleBuilderSummary();
    return;
  }

  bundleBuilderGrid.innerHTML = availableProducts.map(product => {
    const key = product._key;
    const name = cleanText(product.name || 'Untitled product');
    const price = cleanText(product.price || 'Price on request');
    const brand = cleanText(product.brand || 'Scentivity');
    const image = normalizeImagePath(product.image);
    const checked = selectedBundleProductKeys.has(key) ? 'checked' : '';
    return `
      <label class="bundle-product-option">
        <input type="checkbox" value="${key}" ${checked} />
        <img src="${image}" alt="${name}" loading="lazy" />
        <span>
          <strong>${name}</strong>
          <small>${brand}</small>
          <b>${price}</b>
        </span>
      </label>
    `;
  }).join('');

  updateBundleBuilderSummary();
}

function updateBundleBuilderSummary() {
  if (!bundleBuilderSummary) return;
  const selected = getBundleSelectedProducts();
  const originalTotal = selected.reduce((sum, product) => sum + Number(product._unitPrice || parseGHSPrice(product.price)), 0);
  const discountRate = getBundleDiscountRate(selected.length);
  const discountAmount = Math.round(originalTotal * discountRate);
  const bundleTotal = Math.max(0, originalTotal - discountAmount);
  const summaryText = selected.length < 2
    ? 'Select 2 or more products to build a bundle.'
    : `${selected.length} products selected • Original ${formatGHS(originalTotal)} • ${discountRate ? `${Math.round(discountRate * 100)}% off` : 'No discount yet'} • Bundle total ${formatGHS(bundleTotal)}`;

  bundleBuilderSummary.querySelector('span').textContent = summaryText;
  if (addBuiltBundleToCartButton) addBuiltBundleToCartButton.disabled = selected.length < 2;
}

function addBuiltBundleToCart() {
  const selected = getBundleSelectedProducts();
  if (selected.length < 2) {
    if (bundleBuilderSummary) {
      const summarySpan = bundleBuilderSummary.querySelector('span');
      if (summarySpan) summarySpan.textContent = 'Select at least 2 products to build a bundle.';
    }
    return;
  }

  const originalTotal = selected.reduce((sum, product) => sum + Number(product._unitPrice || parseGHSPrice(product.price)), 0);
  const discountRate = getBundleDiscountRate(selected.length);
  const discountAmount = Math.round(originalTotal * discountRate);
  const bundleTotal = Math.max(0, originalTotal - discountAmount);
  const includedItems = selected.map(product => cleanText(product.name || 'Scentivity product')).join(' + ');
  const key = `custom-bundle-${Date.now()}`;

  cart.push({
    key,
    itemType: 'combo',
    name: 'Build Your Own Bundle',
    brand: 'Scentivity Custom Bundle',
    mainCategory: 'Custom Bundle',
    subCategory: 'Build Your Own Bundle',
    size: includedItems,
    includedItems,
    originalPriceText: formatGHS(originalTotal),
    discountText: discountAmount > 0 ? `Save ${formatGHS(discountAmount)}` : 'Bundle deal',
    priceText: formatGHS(bundleTotal),
    unitPrice: bundleTotal,
    image: normalizeImagePath(selected[0].image),
    quantity: 1
  });

  selectedBundleProductKeys = new Set();
  renderBundleBuilder();
  saveCart();
  renderCart();
  openCart();
}


function productSnapshot(product) {
  return {
    key: product._key,
    itemType: 'product',
    name: cleanText(product.name || 'Untitled product'),
    brand: cleanText(product.brand || 'Scentivity'),
    mainCategory: getMainCategory(product),
    subCategory: getSubCategory(product),
    size: cleanText(product.size || ''),
    priceText: cleanText(product.price || 'Price on request'),
    unitPrice: Number(product._unitPrice || parseGHSPrice(product.price)),
    image: normalizeImagePath(product.image),
    availableQuantity: productAvailableQuantity(product),
    rating: productRating(product)
  };
}


function comboSnapshot(combo) {
  const comboPrice = cleanText(combo.comboPrice || combo.price || 'Price on request');
  return {
    key: combo._key,
    itemType: 'combo',
    name: cleanText(combo.name || 'Scentivity Combo'),
    brand: 'Scentivity Combo Deal',
    mainCategory: 'Combo Deal',
    subCategory: 'Discounted Bundle',
    size: cleanText(combo.includedItems || ''),
    priceText: comboPrice,
    originalPriceText: '',
    discountText: cleanText(combo.discountText || ''),
    unitPrice: Number(combo._unitPrice || parseGHSPrice(comboPrice)),
    image: normalizeImagePath(combo.image || 'assets/products/velvet-rose.svg'),
    includedItems: cleanText(combo.includedItems || '')
  };
}


function addToCart(productKey, quantity = 1) {
  const product = products.find(item => item._key === productKey);
  if (!product) return;
  if (product.available === false) {
    alert('This product is currently out of stock.');
    return;
  }

  const desiredQty = Math.max(1, Number(quantity || 1));
  const stock = productAvailableQuantity(product);
  const existing = cart.find(item => item.key === productKey);
  const currentQty = existing ? Number(existing.quantity || 0) : 0;
  const addQty = stock > 0 ? Math.max(0, Math.min(desiredQty, stock - currentQty)) : desiredQty;

  if (stock > 0 && addQty <= 0) {
    alert(`Only ${stock} of this product is currently available.`);
    return;
  }

  if (existing) {
    existing.quantity += addQty;
  } else {
    cart.push({ ...productSnapshot(product), quantity: addQty });
  }
  saveCart();
  renderCart();
  updateCartCount();
}


function addComboToCart(comboKey) {
  const combo = combos.find(item => item._key === comboKey);
  if (!combo) return;
  const existing = cart.find(item => item.key === comboKey);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...comboSnapshot(combo), quantity: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}


function updateCartItem(key, action) {
  const item = cart.find(product => product.key === key);
  if (!item) return;
  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity -= 1;
  if (action === 'remove' || item.quantity <= 0) {
    cart = cart.filter(product => product.key !== key);
  }
  saveCart();
  renderCart();
}

function renderCart() {
  updateCartCount();
  updateCartTotals();
  if (!cartItemsContainer) return;
  if (!cart.length) {
    cartItemsContainer.innerHTML = '';
    if (cartEmptyMessage) cartEmptyMessage.classList.remove('hidden');
    if (checkoutForm) checkoutForm.classList.add('checkout-disabled');
    return;
  }
  if (cartEmptyMessage) cartEmptyMessage.classList.add('hidden');
  if (checkoutForm) checkoutForm.classList.remove('checkout-disabled');
  cartItemsContainer.innerHTML = cart.map(item => `
    <article class="cart-item ${item.itemType === 'combo' ? 'cart-combo-item' : ''}">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <strong>${item.name}</strong>
        <small>${item.itemType === 'combo' ? 'Combo deal' : item.brand}${item.size ? ` • ${item.size}` : ''}</small>
        ${item.itemType === 'combo' && item.includedItems ? `<small class="cart-includes">Contains: ${item.includedItems}</small>` : ''}
        <span class="cart-price-line">
          ${item.originalPriceText ? `<em>${item.originalPriceText}</em> ` : ''}
          ${item.priceText}
          ${item.discountText ? `<b class="cart-discount">${item.discountText}</b>` : ''}
        </span>
        <div class="cart-qty" aria-label="Quantity controls for ${item.name}">
          <button type="button" data-cart-action="decrease" data-cart-key="${item.key}" aria-label="Decrease quantity">−</button>
          <b>${item.quantity}</b>
          <button type="button" data-cart-action="increase" data-cart-key="${item.key}" aria-label="Increase quantity">+</button>
          <button type="button" class="remove" data-cart-action="remove" data-cart-key="${item.key}">Remove</button>
        </div>
      </div>
    </article>
  `).join('');
}

function openCart() {
  if (typeof window.scentivityCloseHeaderMenu === 'function') {
    window.scentivityCloseHeaderMenu();
  }
  renderCart();
  cartDrawer?.classList.add('open');
  cartOverlay?.classList.add('visible');
  cartDrawer?.setAttribute('aria-hidden', 'false');
  cartOverlay?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('cart-open');
}

function closeCart() {
  cartDrawer?.classList.remove('open');
  cartOverlay?.classList.remove('visible');
  cartDrawer?.setAttribute('aria-hidden', 'true');
  cartOverlay?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('cart-open');
}

function updateFulfillmentFields() {
  const selected = getSelectedFulfillment();
  if (deliveryFields) deliveryFields.classList.toggle('hidden', selected !== 'delivery');
  if (pickupFields) pickupFields.classList.toggle('hidden', selected !== 'pickup');
  updateCartTotals();
}

function orderSummaryForMessage(order) {
  const itemLines = order.items
    .map(item => `- ${item.itemType === 'combo' ? 'Combo: ' : ''}${item.name}${item.size ? ` (${item.size})` : ''} x ${item.quantity} — ${formatGHS(item.unitPrice * item.quantity)}${item.itemType !== 'combo' && item.originalPriceText ? ` (old price: ${item.originalPriceText})` : ''}${item.discountText ? ` [${item.discountText}]` : ''}${item.includedItems ? `\n  Contains: ${item.includedItems}` : ''}`)
    .join('\n');

  return `Hello Scentivity,

I would like to place this order:

${itemLines}

Total before delivery: ${formatGHS(order.totalGHS)}
Fulfillment: ${order.fulfillment}
Delivery address: ${order.deliveryAddress || 'N/A'}
Delivery fee note: Applies to delivery orders and will be determined after checkout based on location.
Payment method: ${order.paymentMethodLabel}

Customer name: ${order.customer.name}
Phone: ${order.customer.phone}
Additional notes: ${order.notes || 'N/A'}

Please confirm availability and payment/delivery details.`;
}

function showPaymentStatus(message, type = 'info') {
  if (!paymentStatus) return;
  paymentStatus.textContent = message;
  paymentStatus.className = `payment-status ${type}`;
}

function buildOrderFromForm() {
  const formData = new FormData(checkoutForm);
  const fulfillment = formData.get('fulfillment') || 'delivery';
  const paymentMethod = formData.get('paymentMethod') || CHECKOUT_PAYMENT_METHOD_CARD;
  const paymentLabel = paymentMethodSelect?.selectedOptions?.[0]?.textContent?.trim() || paymentMethod;
  const subtotalGHS = getCartTotal();

  return {
    customer: {
      name: cleanText(formData.get('customerName') || ''),
      phone: cleanText(formData.get('customerPhone') || '')
    },
    fulfillment: fulfillment === 'pickup' ? 'Pickup' : 'Delivery',
    shippingCountry: fulfillment === 'delivery' ? 'Ghana' : '',
    deliveryAddress: fulfillment === 'delivery' ? cleanText(formData.get('deliveryAddress') || '') : '',
    deliveryFeeNote: 'Delivery fee applies to delivery orders and will be determined after checkout based on location.',
    paymentMethod,
    paymentMethodLabel: paymentLabel,
    notes: cleanText(formData.get('orderNotes') || ''),
    items: cart.map(item => ({
      name: item.name,
      brand: item.brand,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      priceText: item.priceText,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      itemType: item.itemType || 'product',
      includedItems: item.includedItems || '',
      originalPriceText: item.originalPriceText || '',
      discountText: item.discountText || ''
    })),
    subtotalGHS,
    totalGHS: subtotalGHS,
    currency: 'GHS'
  };
}

async function checkoutOnline(order) {
  showPaymentStatus(`Opening secure ${order.paymentMethod === CHECKOUT_PAYMENT_METHOD_MOMO ? 'MoMo' : 'card'} checkout...`, 'info');
  const response = await fetch('/.netlify/functions/create-paystack-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.authorization_url) {
    throw new Error(result.error || 'Online payment is not ready yet. Please check Paystack setup or choose Pay on pickup.');
  }
  localStorage.setItem('scentivityLastOrder', JSON.stringify({ ...order, paystackReference: result.reference || '' }));
  window.location.href = result.authorization_url;
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (!cart.length) {
    showPaymentStatus('Your cart is empty. Add a product first.', 'error');
    return;
  }

  const order = buildOrderFromForm();
  if (!order.customer.name || !order.customer.phone) {
    showPaymentStatus('Please enter your name and phone/WhatsApp number.', 'error');
    return;
  }
  if (order.fulfillment === 'Delivery' && !order.deliveryAddress) {
    showPaymentStatus('Please enter the delivery address.', 'error');
    return;
  }

  if (order.paymentMethod === CHECKOUT_PAYMENT_METHOD_CARD || order.paymentMethod === CHECKOUT_PAYMENT_METHOD_MOMO) {
    try {
      await checkoutOnline(order);
      return;
    } catch (error) {
      showPaymentStatus(error.message, 'error');
      return;
    }
  }

  const whatsappMessage = orderSummaryForMessage(order);
  window.open(buildWhatsAppLink(whatsappMessage), '_blank', 'noopener,noreferrer');
  showPaymentStatus('Your order summary has been opened in WhatsApp for pickup confirmation.', 'success');
}

async function loadProducts() {
  products = enrichProducts(fallbackProducts);
  combos = enrichCombos(fallbackCombos);
  comboDealsSettings = { ...fallbackComboDealsSettings };
  dealOfWeek = { ...fallbackDealOfWeek };
  bundleBuilderSettings = { ...fallbackBundleBuilderSettings };
  customerReviews = [];
  homepageVideoSettings = normalizeHomepageVideoSettings({});
  productCatalogue = normalizeProductCatalogue(defaultProductCatalogue);
  try {
    const response = await fetch(`data/products.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load product data.');
    const data = await response.json();
    if (Array.isArray(data.productCatalogue) && data.productCatalogue.length) {
      productCatalogue = normalizeProductCatalogue(data.productCatalogue);
    }
    if (Array.isArray(data.products) && data.products.length) {
      products = enrichProducts(data.products);
    }
    if (Array.isArray(data.combos) && data.combos.length) {
      combos = enrichCombos(data.combos);
    }
    if (data.comboDealsSettings && typeof data.comboDealsSettings === 'object') {
      comboDealsSettings = { ...fallbackComboDealsSettings, ...data.comboDealsSettings };
    }
    if (data.dealOfWeek && typeof data.dealOfWeek === 'object') {
      dealOfWeek = { ...fallbackDealOfWeek, ...data.dealOfWeek };
    }
    if (data.bundleBuilder && typeof data.bundleBuilder === 'object') {
      bundleBuilderSettings = { ...fallbackBundleBuilderSettings, ...data.bundleBuilder };
    }
    if (Array.isArray(data.customerReviews)) {
      customerReviews = data.customerReviews;
    }
    if (data.homepageVideo && typeof data.homepageVideo === 'object') {
      homepageVideoSettings = normalizeHomepageVideoSettings(data.homepageVideo);
    }
  } catch (error) {
    console.warn('Using fallback products:', error.message);
  }
  refreshShop();
  renderDealOfWeek();
  renderCombos();
  renderBundleBuilder();
  renderHomepageVideo();
  renderFeedbackProductChoices();
  renderCustomerReviews();
  renderHomepageShowcase();
  startShowcaseAutoplay();
  renderCart();
}

if (mainCategoryFilters) {
  mainCategoryFilters.addEventListener('click', event => {
    const button = event.target.closest('[data-main]');
    if (!button) return;

    activeMainCategory = button.dataset.main;
    activeSubCategory = 'all';
    refreshShop();

    if (activeMainCategory === CATALOGUE_COMBOS) {
      closeCatalogueModalFn();
      if (comboDealsSettings.enabled === false) {
        alert('Combo Deals are currently not displayed. Check back later or contact Scentivity.');
        document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        document.querySelector('#comboDeals')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    closeCatalogueModalFn();
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}


productSearch?.addEventListener('input', event => {
  activeSearchTerm = cleanText(event.target.value);
  renderProducts();
});

navSearchButton?.addEventListener('click', () => {
  document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => productSearch?.focus(), 350);
});

if (subCategoryFilters) {
  subCategoryFilters.addEventListener('click', event => {
    const button = event.target.closest('[data-sub]');
    if (!button) return;
    activeSubCategory = button.dataset.sub;
    renderSubCategoryFilters();
    renderProducts();
    closeCatalogueModalFn();
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}




function openCartFromAnyButton(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
  openCart();
}

function addProductToCartFromButton(button, event) {
  const key = button?.dataset?.productKey || button?.dataset?.dealProductKey;
  if (!key) return;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
  addToCart(key);
}

function addComboToCartFromButton(button, event) {
  const key = button?.dataset?.comboKey || button?.dataset?.dealComboKey;
  if (!key) return;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
  addComboToCart(key);
}


function getProductByKey(productKey) {
  return products.find(product => product._key === productKey || product.id === productKey || product.slug === productKey);
}

function ratingSnapshotHtml(product = {}) {
  const reviews = Math.max(productReviewCount(product), 1);
  const rating = productRating(product);
  const five = Math.round(reviews * Math.min(0.85, rating / 5 * 0.9));
  const four = Math.round(reviews * 0.09);
  const three = Math.round(reviews * 0.03);
  const two = Math.round(reviews * 0.015);
  const one = Math.max(0, reviews - five - four - three - two);
  const rows = [['5 stars', five], ['4 stars', four], ['3 stars', three], ['2 stars', two], ['1 star', one]];
  const max = Math.max(...rows.map(row => row[1]), 1);
  return `
    <div class="rating-snapshot">
      ${rows.map(([label, count]) => `
        <div class="rating-row">
          <span>${label}</span>
          <b><i style="width:${Math.max(4, (count / max) * 100)}%"></i></b>
          <em>${count}</em>
        </div>
      `).join('')}
    </div>
  `;
}

function approvedReviewsForProduct(product = {}) {
  const productName = cleanText(product.name || '').toLowerCase();
  return (customerReviews || [])
    .filter(review => review && (review.approved === true || String(review.approved || '').toLowerCase() === 'true' || String(review.status || '').toLowerCase() === 'approved'))
    .filter(review => {
      const purchased = cleanText(review.productsPurchased || review.product || review.products || '').toLowerCase();
      return !purchased || !productName || purchased.includes(productName);
    })
    .slice(0, 4);
}

function relatedProductsHtml(currentKey = '') {
  const otherProducts = products
    .filter(product => isProductPublished(product) && product._key !== currentKey)
    .slice(0, 4);

  if (!otherProducts.length) {
    return '<p class="cart-small-note">More products will be added soon.</p>';
  }

  return `
    <div class="related-products-grid">
      ${otherProducts.map(product => `
        <button class="related-product-card product-click-card" type="button" data-product-key="${product._key}">
          <img src="${normalizeImagePath(product.image)}" alt="${cleanText(product.name || 'Product')}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
          <strong>${cleanText(product.name || 'Scentivity product')}</strong>
          <span>${cleanText(product.price || 'Price on request')}</span>
        </button>
      `).join('')}
    </div>
  `;
}

function renderProductDetail(productKey) {
  const product = getProductByKey(productKey);
  const productDetailContent = document.querySelector('#productDetailContent');
  if (!product || !productDetailContent) return;

  const name = cleanText(product.name || 'Scentivity product');
  const brand = cleanText(product.brand || 'Scentivity');
  const mainCategory = getMainCategory(product);
  const subCategory = getSubCategory(product);
  const price = cleanText(product.price || 'Price on request');
  const size = cleanText(product.size || '');
  const image = normalizeImagePath(product.image || 'assets/scentivity-logo-fused.png');
  const meta = productDetailMeta(product);
  const stock = meta.stock;
  const details = cleanText(product.productDetails || product.description || product.details || product.notes || 'Sweet, elegant scent selected by Scentivity.');
  const notes = cleanText(product.fragranceNotes || product.scentNotes || product.notes || 'Add fragrance notes in the admin dashboard.');
  const ingredients = cleanText(product.ingredients || 'Ingredients/details may vary by batch. Please check product packaging.');
  const reviews = approvedReviewsForProduct(product);

  productDetailContent.innerHTML = `
    <article class="product-detail-layout">
      <div class="product-detail-media">
        <img src="${image}" alt="${name}" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
      </div>
      <div class="product-detail-main">
        <div class="product-tags">
          <span>${brand}</span>
          <span>${mainCategory}</span>
          <span>${subCategory}</span>
          ${size ? `<span>${size}</span>` : ''}
        </div>
        <h2 id="productDetailTitle">${name}</h2>
        <div class="product-detail-rating-line">
          <span>${ratingStars(meta.rating)}</span>
          <b>${meta.rating.toFixed(1)}</b>
          ${meta.reviews ? `<em>${formatCompactCount(meta.reviews)} reviews</em>` : '<em>No reviews yet</em>'}
          ${meta.bought ? `<em>${formatCompactCount(meta.bought)} bought</em>` : ''}
        </div>
        <strong class="product-detail-price">${price}</strong>
        <p class="stock-note">${product.available === false ? 'Currently out of stock' : (stock ? `${stock} available` : 'Available')}</p>
        <div class="product-detail-actions">
          <div class="detail-qty-control" aria-label="Quantity selector">
            <button type="button" class="detail-qty-minus" aria-label="Decrease quantity">−</button>
            <b class="detail-qty-value">1</b>
            <button type="button" class="detail-qty-plus" aria-label="Increase quantity">+</button>
          </div>
          ${product.available !== false
            ? `<button class="btn primary detail-add-to-cart" type="button" data-product-key="${product._key}">Add to Cart</button>`
            : `<button class="btn ghost" type="button" disabled>Currently out of stock</button>`
          }
        </div>
        <section class="product-detail-section">
          <h3>Fragrance / Description</h3>
          <p>${notes}</p>
        </section>
        <section class="product-detail-section">
          <h3>Overview / Product information</h3>
          <p>${details}</p>
        </section>
        <section class="product-detail-section">
          <h3>Ingredients</h3>
          <p>${ingredients}</p>
        </section>
      </div>
    </article>
    <section class="product-detail-section product-detail-reviews">
      <h3>Reviews / Rating snapshot</h3>
      <div class="overall-rating-box">
        <strong>${meta.rating.toFixed(1)}</strong>
        <span>${ratingStars(meta.rating)}</span>
        <em>${formatCompactCount(meta.reviews)} reviews</em>
      </div>
      ${ratingSnapshotHtml(product)}
      <div class="review-list">
        ${reviews.length
          ? reviews.map(review => `
              <article>
                <span>${ratingStars(Number(review.rating || 5))}</span>
                <h4>${cleanText(review.title || review.name || 'Scentivity customer')}</h4>
                <small>${cleanText(review.name || 'Verified customer')}</small>
                ${cleanText(review.productsPurchased || '') ? `<small class="review-product">Purchased: ${cleanText(review.productsPurchased)}</small>` : ''}
                <p>${cleanText(review.message || review.feedback || review.review || '')}</p>
              </article>
            `).join('')
          : `<p class="cart-small-note">Approved customer reviews for this product will appear here.</p>`
        }
      </div>
    </section>
    <section class="product-detail-section">
      <h3>Other available products</h3>
      ${relatedProductsHtml(product._key)}
    </section>
  `;

  let quantity = 1;
  const qtyValue = productDetailContent.querySelector('.detail-qty-value');
  const maxQty = stock || 99;
  const setQty = value => {
    quantity = Math.max(1, Math.min(maxQty, value));
    qtyValue.textContent = String(quantity);
  };

  productDetailContent.querySelector('.detail-qty-minus')?.addEventListener('click', () => setQty(quantity - 1));
  productDetailContent.querySelector('.detail-qty-plus')?.addEventListener('click', () => setQty(quantity + 1));
  productDetailContent.querySelector('.detail-add-to-cart')?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product._key, quantity);
  });
}

function openProductDetail(productKey) {
  const modal = document.querySelector('#productDetailModal');
  if (!modal) return;
  renderProductDetail(productKey);
  modal.classList.add('open', 'visible');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeProductDetail() {
  const modal = document.querySelector('#productDetailModal');
  if (!modal) return;
  modal.classList.remove('open', 'visible');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}


// Product card/detail click behavior: card opens product page; only cart icon/button adds to cart.
document.addEventListener('click', event => {
  const logo = event.target.closest('[data-home-logo], .brand');
  if (logo) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.scrollTo(0, 0);
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
      window.location.href = `${window.location.pathname}?home=${Date.now()}`;
    } else {
      window.location.href = 'index.html?home=' + Date.now();
    }
    return;
  }

  const addProductButton = event.target.closest('.add-to-cart[data-product-key], [data-deal-product-key]');
  if (addProductButton) {
    addProductToCartFromButton(addProductButton, event);
    return;
  }

  const productTrigger = event.target.closest('.product-click-card[data-product-key], .product-view-button[data-product-key]');
  if (productTrigger && !event.target.closest('button.add-to-cart, [data-deal-product-key], a, input, select, textarea, label')) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const key = productTrigger.dataset.productKey;
    const product = products.find(item => item._key === key || item.id === key || item.slug === key);
    window.location.href = productPageUrl(product || key);
    return;
  }
}, true);

// High-priority mobile/desktop fix:
// prevents Add to Cart taps from bubbling into Contact/Preorder/menu handlers.
document.addEventListener('click', event => {
  const addProductButton = event.target.closest('.add-to-cart[data-product-key], [data-deal-product-key]');
  if (addProductButton) {
    addProductToCartFromButton(addProductButton, event);
    return;
  }

  const addComboButton = event.target.closest('.add-combo-to-cart[data-combo-key], [data-deal-combo-key]');
  if (addComboButton) {
    addComboToCartFromButton(addComboButton, event);
    return;
  }

  const cartButton = event.target.closest('#mobileCartButton, #cartToggle, #cartToggleFooter, .cart-nav-button, [data-open-cart]');
  if (cartButton) {
    openCartFromAnyButton(event);
  }
}, true);

document.addEventListener('click', event => {
  const productDealButton = event.target.closest('[data-deal-product-key]');
  const comboDealButton = event.target.closest('[data-deal-combo-key]');
  if (productDealButton) {
    addToCart(productDealButton.dataset.dealProductKey);
  }
  if (comboDealButton) {
    addComboToCart(comboDealButton.dataset.dealComboKey);
  }
});


if (comboGrid) {
  comboGrid.addEventListener('click', event => {
    const addComboButton = event.target.closest('[data-combo-key]');
    if (!addComboButton) return;
    addComboToCart(addComboButton.dataset.comboKey);
  });
}

// Fallback listener for combo buttons if the combo section is moved or re-rendered.
document.addEventListener('click', event => {
  const addComboButton = event.target.closest('.add-combo-to-cart[data-combo-key]');
  if (!addComboButton) return;
  if (comboGrid && comboGrid.contains(addComboButton)) return;
  addComboToCart(addComboButton.dataset.comboKey);
});


if (productGrid) {
  productGrid.addEventListener('click', event => {
    const addButton = event.target.closest('.add-to-cart');
    if (!addButton) return;
    addToCart(addButton.dataset.productKey);
  });
}


homepageProductSlides?.addEventListener('click', event => {
  const addButton = event.target.closest('.add-to-cart');
  if (!addButton) return;
  addToCart(addButton.dataset.productKey);
});

homepageProductDots?.addEventListener('click', event => {
  const dot = event.target.closest('[data-slide-index]');
  if (!dot) return;
  showcaseIndex = Number(dot.dataset.slideIndex || 0);
  renderHomepageShowcase();
  startShowcaseAutoplay();
});

showcasePrev?.addEventListener('click', () => {
  moveShowcase(-1);
  startShowcaseAutoplay();
});

showcaseNext?.addEventListener('click', () => {
  moveShowcase(1);
  startShowcaseAutoplay();
});

cartToggle?.addEventListener('click', openCart);
cartToggleFooter?.addEventListener('click', openCart);
mobileCartButton?.addEventListener('click', openCart);
closeCartButton?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

cartItemsContainer?.addEventListener('click', event => {
  const control = event.target.closest('[data-cart-action]');
  if (!control) return;
  updateCartItem(control.dataset.cartKey, control.dataset.cartAction);
});

fulfillmentRadios.forEach(radio => radio.addEventListener('change', updateFulfillmentFields));
checkoutForm?.addEventListener('submit', handleCheckoutSubmit);

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (emailRequestForm) {
  emailRequestForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(emailRequestForm);
    const name = cleanText(formData.get('name') || '');
    const contact = '';
    const message = cleanText(formData.get('message') || '');
    const body = `Hello Scentivity,\n\nI would like to send a product request.\n\nName: ${name}\nEmail/Phone: ${contact}\n\nRequest details:\n${message}\n\nThank you.`;
    window.location.href = buildEmailLink('Scentivity Product Request', body);
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
updateFulfillmentFields();

document.querySelectorAll('[data-scroll-search]').forEach(shortcut => {
  shortcut.addEventListener('click', () => {
    const term = shortcut.dataset.scrollSearch || '';
    if (productSearch && term) {
      productSearch.value = term;
      activeSearchTerm = term.toLowerCase();
      refreshShop();
    }
  });
});




function setFeedbackProductsOpen(isOpen) {
  if (!feedbackProductChoices || !toggleFeedbackProductsButton) return;
  feedbackProductChoices.hidden = !isOpen;
  feedbackProductChoices.classList.toggle('open', isOpen);
  toggleFeedbackProductsButton.setAttribute('aria-expanded', String(isOpen));
}

function updateFeedbackProductCount() {
  if (!feedbackProductCount) return;
  const selectedCount = document.querySelectorAll('input[name="feedbackProductChoice"]:checked').length;
  const other = cleanText(document.querySelector('input[name="productsPurchasedOther"]')?.value || '');
  const total = selectedCount + (other ? 1 : 0);
  feedbackProductCount.textContent = total === 1 ? '1 selected' : `${total} selected`;
}

function feedbackProductOptionLabel(item = {}, type = 'product') {
  const name = cleanText(item.name || 'Scentivity item');
  const brand = cleanText(item.brand || (type === 'combo' ? 'Combo Deal' : 'Scentivity'));
  const size = cleanText(item.size || '');
  const price = cleanText(type === 'combo' ? (item.comboPrice || item.price || '') : (item.price || ''));
  return [name, brand, size, price].filter(Boolean).join(' • ');
}

function renderFeedbackProductChoices() {
  if (!feedbackProductChoices) return;

  const productOptions = products
    .filter(product => product && product.name)
    .map(product => ({
      type: 'product',
      key: product._key,
      label: feedbackProductOptionLabel(product, 'product'),
      image: normalizeImagePath(product.image)
    }));

  const comboOptions = combos
    .filter(combo => combo && combo.name)
    .map(combo => ({
      type: 'combo',
      key: combo._key,
      label: feedbackProductOptionLabel(combo, 'combo'),
      image: normalizeImagePath(combo.image || 'assets/scentivity-logo-fused.png')
    }));

  const allOptions = [...productOptions, ...comboOptions];

  if (!allOptions.length) {
    feedbackProductChoices.innerHTML = '<p class="empty-state">Products will appear here after they are added in admin.</p>';
    updateFeedbackProductsPurchased();
    return;
  }

  feedbackProductChoices.innerHTML = allOptions.map(option => `
    <label class="feedback-product-option">
      <input type="checkbox" name="feedbackProductChoice" value="${option.label.replace(/"/g, '&quot;')}" />
      <span class="feedback-product-thumb"><img src="${option.image}" alt="" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" /></span>
      <span>${option.label}</span>
    </label>
  `).join('');

  updateFeedbackProductsPurchased();
  setFeedbackProductsOpen(false);
}

function updateFeedbackProductsPurchased() {
  if (!feedbackProductsPurchasedInput) return;

  const selected = [...document.querySelectorAll('input[name="feedbackProductChoice"]:checked')]
    .map(input => cleanText(input.value))
    .filter(Boolean);
  const other = cleanText(document.querySelector('input[name="productsPurchasedOther"]')?.value || '');
  if (other) selected.push(other);

  feedbackProductsPurchasedInput.value = selected.join('; ');
  updateFeedbackProductCount();
}

document.addEventListener('change', event => {
  if (event.target.matches('input[name="feedbackProductChoice"]')) {
    updateFeedbackProductsPurchased();
  }
});

document.addEventListener('input', event => {
  if (event.target.matches('input[name="productsPurchasedOther"]')) {
    updateFeedbackProductsPurchased();
  }
});


let testimonialIndex = 0;
let testimonialTimer = null;

function approvedCustomerReviews() {
  return customerReviews
    .filter(review => review && review.approved === true)
    .map(review => ({
      name: cleanText(review.name || 'Scentivity customer'),
      rating: Math.min(5, Math.max(1, Number(review.rating || 5))),
      message: cleanText(review.message || ''),
      productsPurchased: cleanText(review.productsPurchased || review.product || review.products || ''),
      date: cleanText(review.date || '')
    }))
    .filter(review => review.message);
}

function renderCustomerReviews() {
  const testimonialSlides = document.querySelector('#testimonialSlides');
  const testimonialDots = document.querySelector('#testimonialDots');
  const testimonialControls = document.querySelector('.testimonial-controls');
  if (!testimonialSlides) return;

  const reviews = approvedCustomerReviews();
  if (!reviews.length) {
    testimonialSlides.innerHTML = `
      <article class="review-empty-state active">
        <div class="stars">♡♡♡♡♡</div>
        <p>No customer reviews have been posted yet.</p>
        
      </article>
    `;
    if (testimonialDots) testimonialDots.innerHTML = '';
    if (testimonialControls) testimonialControls.classList.add('hidden');
    return;
  }

  if (testimonialControls) testimonialControls.classList.remove('hidden');
  if (testimonialIndex >= reviews.length) testimonialIndex = 0;

  testimonialSlides.innerHTML = reviews.map((review, index) => `
    <article class="${index === testimonialIndex ? 'active' : ''}">
      <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
      ${review.productsPurchased ? `<small class="review-product">Purchased: ${review.productsPurchased}</small>` : ''}
      <p>“${review.message}”</p>
      <span>${review.name}</span>
    </article>
  `).join('');

  showTestimonial(testimonialIndex);
}

function renderTestimonialDots() {
  const testimonialDots = document.querySelector('#testimonialDots');
  const slides = [...document.querySelectorAll('#testimonialSlides > article')];
  if (!testimonialDots) return;
  if (slides.length <= 1 || slides[0]?.classList.contains('review-empty-state')) {
    testimonialDots.innerHTML = '';
    return;
  }
  testimonialDots.innerHTML = slides.map((_, index) => `<button type="button" class="${index === testimonialIndex ? 'active' : ''}" data-testimonial-index="${index}" aria-label="Show review ${index + 1}"></button>`).join('');
}

function showTestimonial(index) {
  const testimonialSlides = document.querySelector('#testimonialSlides');
  if (!testimonialSlides) return;
  const slides = [...testimonialSlides.children];
  if (!slides.length) return;

  testimonialIndex = (index + slides.length) % slides.length;
  testimonialSlides.style.transform = 'translateX(0)';

  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === testimonialIndex);
    slide.style.display = slideIndex === testimonialIndex ? 'grid' : 'none';
    slide.style.opacity = slideIndex === testimonialIndex ? '1' : '0';
    slide.style.visibility = slideIndex === testimonialIndex ? 'visible' : 'hidden';
  });

  renderTestimonialDots();
}

function startTestimonialAutoplay() {
  window.clearInterval(testimonialTimer);
  const slides = [...document.querySelectorAll('#testimonialSlides > article')];
  if (slides.length <= 1 || slides[0]?.classList.contains('review-empty-state')) return;
  testimonialTimer = window.setInterval(() => showTestimonial(testimonialIndex + 1), 5500);
}

document.querySelector('#testimonialPrev')?.addEventListener('click', () => {
  showTestimonial(testimonialIndex - 1);
  startTestimonialAutoplay();
});

document.querySelector('#testimonialNext')?.addEventListener('click', () => {
  showTestimonial(testimonialIndex + 1);
  startTestimonialAutoplay();
});

document.querySelector('#testimonialDots')?.addEventListener('click', event => {
  const dot = event.target.closest('[data-testimonial-index]');
  if (!dot) return;
  showTestimonial(Number(dot.dataset.testimonialIndex || 0));
  startTestimonialAutoplay();
});

showTestimonial(0);
startTestimonialAutoplay();


if (bundleBuilderGrid) {
  bundleBuilderGrid.addEventListener('change', event => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked) {
      selectedBundleProductKeys.add(checkbox.value);
    } else {
      selectedBundleProductKeys.delete(checkbox.value);
    }
    updateBundleBuilderSummary();
  });
}

addBuiltBundleToCartButton?.addEventListener('click', addBuiltBundleToCart);



document.documentElement.classList.add('scentivity-mobile-overflow-fixed');


// Extra robust build-your-own-bundle handlers for mobile browsers and re-rendered bundle cards.
document.addEventListener('change', event => {
  const checkbox = event.target.closest('#bundleBuilderGrid input[type="checkbox"]');
  if (!checkbox) return;

  if (checkbox.checked) {
    selectedBundleProductKeys.add(checkbox.value);
  } else {
    selectedBundleProductKeys.delete(checkbox.value);
  }

  updateBundleBuilderSummary();
});

document.addEventListener('click', event => {
  const button = event.target.closest('#addBuiltBundleToCart');
  if (!button) return;

  event.preventDefault();

  if (button.disabled && getBundleSelectedProducts().length >= 2) {
    button.disabled = false;
  }

  addBuiltBundleToCart();
});


function syncMobileCartCountFix() {
  const count = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  document.querySelectorAll('#mobileCartCount').forEach(node => {
    node.textContent = count;
  });
}

document.addEventListener('click', event => {
  if (event.target.closest('[data-cart-action]') || event.target.closest('.add-to-cart') || event.target.closest('.add-combo-to-cart')) {
    window.setTimeout(syncMobileCartCountFix, 60);
  }
});


let orderSlideIndex = 0;
let statsSlideIndex = 0;

function renderSimpleSlider(trackSelector, dotsSelector, activeIndex) {
  const track = document.querySelector(trackSelector);
  const dots = document.querySelector(dotsSelector);
  if (!track) return;
  const slides = [...track.children];
  if (!slides.length) return;
  const index = ((activeIndex % slides.length) + slides.length) % slides.length;
  track.style.transform = `translateX(-${index * 100}%)`;
  if (dots) {
    dots.innerHTML = slides.map((_, i) => `<button type="button" class="${i === index ? 'active' : ''}" data-simple-slide="${i}" aria-label="Show item ${i + 1}"></button>`).join('');
  }
}

function showOrderSlide(index) {
  const total = document.querySelectorAll('#orderSlides > article').length || 1;
  orderSlideIndex = ((index % total) + total) % total;
  renderSimpleSlider('#orderSlides', '#orderDots', orderSlideIndex);
}

function showStatsSlide(index) {
  const total = document.querySelectorAll('#statsSlides > article').length || 1;
  statsSlideIndex = ((index % total) + total) % total;
  renderSimpleSlider('#statsSlides', '#statsDots', statsSlideIndex);
}

document.querySelector('#orderPrev')?.addEventListener('click', () => showOrderSlide(orderSlideIndex - 1));
document.querySelector('#orderNext')?.addEventListener('click', () => showOrderSlide(orderSlideIndex + 1));
document.querySelector('#orderDots')?.addEventListener('click', event => {
  const dot = event.target.closest('[data-simple-slide]');
  if (dot) showOrderSlide(Number(dot.dataset.simpleSlide || 0));
});
document.querySelector('#statsDots')?.addEventListener('click', event => {
  const dot = event.target.closest('[data-simple-slide]');
  if (dot) showStatsSlide(Number(dot.dataset.simpleSlide || 0));
});

showOrderSlide(0);
showStatsSlide(0);
window.setInterval(() => showStatsSlide(statsSlideIndex + 1), 4500);

const aboutModal = document.querySelector('#aboutModal');
const openAboutButton = document.querySelector('#openAboutButton');
const closeAboutModal = document.querySelector('#closeAboutModal');

function openAboutModal() {
  if (!aboutModal) return;
  aboutModal.classList.add('open');
  aboutModal.setAttribute('aria-hidden', 'false');
}

function closeAboutModalFn() {
  if (!aboutModal) return;
  aboutModal.classList.remove('open');
  aboutModal.setAttribute('aria-hidden', 'true');
}

openAboutButton?.addEventListener('click', openAboutModal);
closeAboutModal?.addEventListener('click', closeAboutModalFn);
aboutModal?.addEventListener('click', event => {
  if (event.target === aboutModal) closeAboutModalFn();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeAboutModalFn();
});


// Scentivity contact modal controls
const contactModal = document.querySelector('#contactModal');
const openContactButton = document.querySelector('#openContactButton');
const openPreorderButton = document.querySelector('#openPreorderButton');
const mobileContactButton = document.querySelector('#mobileContactButton');
const closeContactModal = document.querySelector('#closeContactModal');

function openContactModal() {
  if (!contactModal) return;
  contactModal.classList.add('open');
  contactModal.setAttribute('aria-hidden', 'false');
}

function closeContactModalFn() {
  if (!contactModal) return;
  contactModal.classList.remove('open');
  contactModal.setAttribute('aria-hidden', 'true');
}

openContactButton?.addEventListener('click', openContactModal);
openPreorderButton?.addEventListener('click', openContactModal);
mobileContactButton?.addEventListener('click', openContactModal);
closeContactModal?.addEventListener('click', closeContactModalFn);
contactModal?.addEventListener('click', event => {
  if (event.target === contactModal) closeContactModalFn();
});

// Make customer-love cards visible even if a mobile browser miscalculates the track.
function forceVisibleTestimonials() {
  const track = document.querySelector('#testimonialSlides');
  if (!track) return;
  track.querySelectorAll('article').forEach(article => {
    article.style.visibility = 'visible';
    article.style.opacity = '1';
  });
}

forceVisibleTestimonials();
window.setTimeout(forceVisibleTestimonials, 250);
window.setTimeout(() => {
  renderHomepageShowcase();
  forceVisibleTestimonials();
}, 500);


// Robust modal button fallback for About and Contact buttons
document.addEventListener('click', event => {
  const aboutButton = event.target.closest('#openAboutButton');
  const contactButton = event.target.closest('#openContactButton, #openPreorderButton, #mobileContactButton');
  if (aboutButton) {
    event.preventDefault();
    document.querySelector('#aboutModal')?.classList.add('open');
    document.querySelector('#aboutModal')?.setAttribute('aria-hidden', 'false');
  }
  if (contactButton) {
    event.preventDefault();
    document.querySelector('#contactModal')?.classList.add('open');
    document.querySelector('#contactModal')?.setAttribute('aria-hidden', 'false');
  }
});

// Re-render sliders after products load and mobile layout settles.
window.setTimeout(() => {
  renderHomepageShowcase();
  showTestimonial(testimonialIndex || 0);
}, 300);


const catalogueModal = document.querySelector('#catalogueModal');
const shippingModal = document.querySelector('#shippingModal');
const openCatalogueButton = document.querySelector('#openCatalogueButton');
const openCatalogueButtonQuick = document.querySelector('#openCatalogueButtonQuick');
const closeCatalogueModal = document.querySelector('#closeCatalogueModal');
const openShippingButton = document.querySelector('#openShippingButton');
const openShippingButtonQuick = document.querySelector('#openShippingButtonQuick');
const closeShippingModal = document.querySelector('#closeShippingModal');

function openCatalogueModal() {
  if (!catalogueModal) return;
  catalogueModal.classList.add('open');
  catalogueModal.setAttribute('aria-hidden', 'false');
}

function closeCatalogueModalFn() {
  if (!catalogueModal) return;
  catalogueModal.classList.remove('open');
  catalogueModal.setAttribute('aria-hidden', 'true');
}

function openShippingModal() {
  if (!shippingModal) return;
  shippingModal.classList.add('open');
  shippingModal.setAttribute('aria-hidden', 'false');
}

function closeShippingModalFn() {
  if (!shippingModal) return;
  shippingModal.classList.remove('open');
  shippingModal.setAttribute('aria-hidden', 'true');
}

openCatalogueButton?.addEventListener('click', openCatalogueModal);
openCatalogueButtonQuick?.addEventListener('click', openCatalogueModal);
closeCatalogueModal?.addEventListener('click', closeCatalogueModalFn);
catalogueModal?.addEventListener('click', event => {
  if (event.target === catalogueModal) closeCatalogueModalFn();
});

openShippingButton?.addEventListener('click', openShippingModal);
openShippingButtonQuick?.addEventListener('click', openShippingModal);
closeShippingModal?.addEventListener('click', closeShippingModalFn);
shippingModal?.addEventListener('click', event => {
  if (event.target === shippingModal) closeShippingModalFn();
});

document.addEventListener('click', event => {
  const catalogueButton = event.target.closest('#openCatalogueButton, #openCatalogueButtonQuick');
  const shippingButton = event.target.closest('#openShippingButton, #openShippingButtonQuick, [data-open-shipping]');
  if (catalogueButton) {
    event.preventDefault();
    openCatalogueModal();
  }
  if (shippingButton) {
    event.preventDefault();
    openShippingModal();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeCatalogueModalFn();
    closeShippingModalFn();
  }
});



toggleFeedbackProductsButton?.addEventListener('click', () => {
  const isOpen = toggleFeedbackProductsButton.getAttribute('aria-expanded') === 'true';
  setFeedbackProductsOpen(!isOpen);
});

const customerFeedbackForm = document.querySelector('#customerFeedbackForm');
customerFeedbackForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const submitButton = customerFeedbackForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || 'Submit Feedback';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
  }

  const formData = new FormData(customerFeedbackForm);
  const productsPurchased = cleanText(formData.get('productsPurchased') || '');
  if (!productsPurchased) {
    alert('Please select at least one product purchased, or type the product name under Other product / combo not listed.');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
    return;
  }
  if (!formData.get('form-name')) {
    formData.set('form-name', customerFeedbackForm.getAttribute('name') || 'customer-feedback');
  }

  let posted = false;
  try {
    const response = await fetch('/.netlify/functions/submit-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    });
    posted = response.ok;
  } catch (error) {
    console.warn('Feedback submission could not be posted automatically.', error);
  }

  customerFeedbackForm.reset();

  let note = customerFeedbackForm.querySelector('.feedback-submit-note');
  if (!note) {
    note = document.createElement('p');
    note.className = 'feedback-submit-note cart-small-note';
    customerFeedbackForm.appendChild(note);
  }
  note.textContent = posted
    ? 'Thank you. Your feedback has been submitted.'
    : 'Thank you. Your feedback has been received.';

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});


// Coming-soon Notify Me buttons open the Contact/Preorder popup and prefill the request.
document.addEventListener('click', event => {
  const notifyButton = event.target.closest('.notify-me-button, a[href="#preorder"]');
  if (!notifyButton) return;

  event.preventDefault();

  if (typeof openContactModal === 'function') {
    openContactModal();
  } else {
    document.querySelector('#contactModal')?.classList.add('open');
    document.querySelector('#contactModal')?.setAttribute('aria-hidden', 'false');
  }

  const productName = notifyButton.dataset.notifyProduct || 'this product';
  const productBrand = notifyButton.dataset.notifyBrand || '';
  const productSize = notifyButton.dataset.notifySize || '';
  const messageBox = document.querySelector('#emailRequestForm textarea[name="message"]');

  if (messageBox) {
    messageBox.value = `Hello Scentivity, please notify me when this coming-soon item becomes available:\n\nProduct: ${productName}${productBrand ? `\nBrand: ${productBrand}` : ''}${productSize ? `\nSize: ${productSize}` : ''}\n\nMy preferred pickup/delivery option is:`;
    window.setTimeout(() => messageBox.focus(), 150);
  }

  document.querySelector('#emailRequestForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

updateCartCount();
document.addEventListener('DOMContentLoaded', () => updateCartCount());
loadProducts();


// Product page bottom-nav landing support
(function scentivityProductPageBottomNavLanding() {
  function openRequestedPanel() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openCart') === 'true' || window.location.hash === '#cart') {
      window.setTimeout(() => {
        if (typeof openCart === 'function') openCart();
        else {
          document.querySelector('#cartOverlay')?.classList.add('visible');
          document.querySelector('#cartDrawer')?.classList.add('open');
        }
      }, 350);
    }
  }
  document.addEventListener('DOMContentLoaded', openRequestedPanel);
  window.addEventListener('load', openRequestedPanel);
})();


// Product page menu/cart return support
(function scentivityHomeProductPageReturnSupport() {
  function openRequestedPanel() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openCart') === 'true' || window.location.hash === '#cart') {
      window.setTimeout(() => {
        if (typeof openCart === 'function') openCart();
        else {
          document.querySelector('#cartOverlay')?.classList.add('visible');
          document.querySelector('#cartDrawer')?.classList.add('open');
        }
      }, 350);
    }
  }
  document.addEventListener('DOMContentLoaded', openRequestedPanel);
  window.addEventListener('load', openRequestedPanel);
})();


// ADMIN PRODUCT STATUS + RATING BAR COUNTS OVERRIDE 20260609
function normalizeProductStatus(product = {}) {
  const rawStatus = cleanText(product.productStatus || product.status || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
  if (['available', 'in stock', 'active'].includes(rawStatus)) return 'Available';
  if (['incoming', 'coming soon', 'preorder', 'pre order'].includes(rawStatus)) return 'Incoming';
  if (['out of stock', 'outofstock', 'sold out', 'unavailable'].includes(rawStatus)) return 'Out of Stock';
  if (product.available === false) return 'Incoming';
  return 'Available';
}

function isProductAvailable(product = {}) {
  return normalizeProductStatus(product) === 'Available';
}

function isProductIncoming(product = {}) {
  return normalizeProductStatus(product) === 'Incoming';
}

function productStatusLabel(product = {}) {
  return normalizeProductStatus(product);
}

function productRatingBarCounts(product = {}) {
  const values = [
    Number(product.rating5Count ?? product.fiveStarCount ?? product.star5Count ?? product.rating5 ?? 0),
    Number(product.rating4Count ?? product.fourStarCount ?? product.star4Count ?? product.rating4 ?? 0),
    Number(product.rating3Count ?? product.threeStarCount ?? product.star3Count ?? product.rating3 ?? 0),
    Number(product.rating2Count ?? product.twoStarCount ?? product.star2Count ?? product.rating2 ?? 0),
    Number(product.rating1Count ?? product.oneStarCount ?? product.star1Count ?? product.rating1 ?? 0)
  ].map(value => Number.isFinite(value) && value >= 0 ? Math.round(value) : 0);

  return {
    five: values[0],
    four: values[1],
    three: values[2],
    two: values[3],
    one: values[4],
    total: values.reduce((sum, value) => sum + value, 0)
  };
}

function enrichProducts(list) {
  return list.map((product, index) => {
    const productStatus = normalizeProductStatus(product);
    const bars = productRatingBarCounts(product);
    return {
      ...product,
      productStatus,
      available: productStatus === 'Available',
      _key: product.id || product.slug || makeProductKey(product, index),
      _unitPrice: parseGHSPrice(product.price),
      rating: product.rating ?? product.averageRating ?? 4.8,
      reviewCount: product.reviewCount ?? product.reviewsCount ?? product.numberOfReviews ?? bars.total ?? 0,
      purchaseCount: product.purchaseCount ?? product.numberPurchased ?? product.purchases ?? product.soldCount ?? 0,
      availableQuantity: product.availableQuantity ?? product.stockQuantity ?? product.quantityAvailable ?? product.stock ?? 0,
      rating5Count: bars.five,
      rating4Count: bars.four,
      rating3Count: bars.three,
      rating2Count: bars.two,
      rating1Count: bars.one,
      productDetails: product.productDetails || product.description || product.details || product.notes || '',
      fragranceNotes: product.fragranceNotes || product.scentNotes || product.notes || '',
      ingredients: product.ingredients || '',
      showOnWebsite: product.showOnWebsite !== false
    };
  });
}

function productReviewCount(product = {}) {
  const direct = Number(product.reviewCount ?? product.reviewsCount ?? product.numberOfReviews ?? 0);
  if (Number.isFinite(direct) && direct > 0) return Math.round(direct);
  const bars = productRatingBarCounts(product);
  return bars.total > 0 ? bars.total : 0;
}

function compactProductCard(product = {}) {
  const name = cleanText(product.name || 'Untitled product');
  const brand = cleanText(product.brand || 'Scentivity');
  const statusLabel = productStatusLabel(product);
  const available = isProductAvailable(product);
  const incoming = isProductIncoming(product);
  const price = cleanText(product.price || (incoming ? 'Coming soon' : 'Price on request'));
  const image = normalizeImagePath(product.image || 'assets/scentivity-logo-fused.png');
  const key = cleanText(product._key || '');
  const meta = productDetailMeta(product);
  return `
    <article class="product-card compact-product-card product-click-card ${available ? '' : 'is-unavailable'}" data-product-key="${key}" tabindex="0" aria-label="View details for ${name}">
      <div class="compact-product-image">
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
        <span class="compact-product-badge ${available ? '' : 'coming'}">${statusLabel}</span>
      </div>
      <div class="compact-product-info">
        <small>${brand}</small>
        <h3>${name}</h3>
        <div class="compact-product-meta">
          <span class="star-rating-symbol">★</span>
          <span>${meta.rating.toFixed(1)}</span>
          ${meta.reviews ? `<span>| ${formatCompactCount(meta.reviews)} reviews</span>` : ''}
          ${meta.bought ? `<span>| ${formatCompactCount(meta.bought)} bought</span>` : ''}
        </div>
        <div class="compact-product-bottom">
          <strong>${price}</strong>
          ${available
            ? `<button class="compact-cart-button add-to-cart" type="button" data-product-key="${key}" aria-label="Add ${name} to cart">🛒</button>`
            : `<button class="compact-cart-button notify-me-button" type="button" data-notify-product="${name}" data-notify-brand="${brand}" data-notify-size="${cleanText(product.size || '')}" aria-label="Notify me about ${name}">🔔</button>`
          }
        </div>
      </div>
    </article>
  `;
}

function getHomepageSlides() {
  const publishedProducts = products.filter(product => isProductPublished(product));
  const availableSlides = publishedProducts
    .filter(product => isProductAvailable(product))
    .slice(0, 8)
    .map(product => ({ ...product, _slideStatus: 'Available now', _slideType: 'available' }));

  const incomingSlides = publishedProducts
    .filter(product => isProductIncoming(product))
    .slice(0, 4)
    .map(product => ({ ...product, _slideStatus: 'Incoming', _slideType: 'coming-soon' }));

  return [...availableSlides, ...incomingSlides].slice(0, 10);
}

function renderHomepageShowcase() {
  if (!homepageProductSlides) return;
  const slides = getHomepageSlides();
  if (!slides.length) {
    homepageProductSlides.innerHTML = `
      <article class="showcase-slide active fallback-showcase">
        <div class="showcase-image-wrap">
          <img src="assets/scentivity-logo-fused.png" alt="Scentivity logo" loading="lazy" />
          <span class="showcase-badge soon">No products yet</span>
        </div>
        <div class="showcase-copy">
          <p class="eyebrow">Scentivity</p>
          <h3>Products will appear here</h3>
          <p>Turn on Show Product on Website for products in the admin page.</p>
        </div>
      </article>
    `;
    if (homepageProductDots) homepageProductDots.innerHTML = '';
    return;
  }

  showcaseIndex = ((showcaseIndex % slides.length) + slides.length) % slides.length;
  const product = slides[showcaseIndex];
  const name = cleanText(product.name || 'Scentivity product');
  const price = cleanText(product.price || (isProductIncoming(product) ? 'Coming soon' : 'Price on request'));
  const image = normalizeImagePath(product.image || 'assets/scentivity-logo-fused.png');
  const available = isProductAvailable(product);
  const key = cleanText(product._key || '');
  const meta = productDetailMeta(product);
  const statusLabel = cleanText(product._slideStatus || productStatusLabel(product));

  homepageProductSlides.innerHTML = `
    <article class="showcase-slide active simplified-showcase-slide product-click-card" data-product-key="${key}" tabindex="0" aria-label="View details for ${name}">
      <div class="showcase-image-wrap">
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
        <span class="showcase-badge ${available ? 'available' : 'soon'}">${statusLabel}</span>
      </div>
      <div class="showcase-copy">
        <p class="eyebrow">${statusLabel} • ${showcaseIndex + 1} of ${slides.length}</p>
        <h3>${name}</h3>
        <div class="compact-product-meta showcase-quick-meta">
          <span class="star-rating-symbol">★</span>
          <span>${meta.rating.toFixed(1)}</span>
          ${meta.reviews ? `<span>| ${formatCompactCount(meta.reviews)} reviews</span>` : ''}
          ${meta.bought ? `<span>| ${formatCompactCount(meta.bought)} bought</span>` : ''}
        </div>
        <div class="showcase-bottom">
          <strong>${price}</strong>
          ${available
            ? `<button class="btn primary add-to-cart" type="button" data-product-key="${key}">Add to Cart</button>`
            : `<button class="btn ghost" type="button" disabled>${isProductIncoming(product) ? 'Coming Soon' : 'Out of Stock'}</button>`
          }
        </div>
      </div>
    </article>
  `;
  if (homepageProductDots) {
    homepageProductDots.innerHTML = slides.map((_, index) => `<button type="button" class="showcase-dot ${index === showcaseIndex ? 'active' : ''}" data-slide-index="${index}" aria-label="Show product ${index + 1}"></button>`).join('');
  }
}


// CUSTOMER FAVORITES ADMIN TOGGLE OVERRIDE 20260609
function showInCustomerFavorites(product = {}) {
  return product.showInCustomerFavorites === true ||
    String(product.showInCustomerFavorites || '').toLowerCase() === 'true' ||
    product.showInHomepageFavorites === true ||
    String(product.showInHomepageFavorites || '').toLowerCase() === 'true' ||
    product.featuredOnHomepage === true ||
    String(product.featuredOnHomepage || '').toLowerCase() === 'true';
}

function getHomepageSlides() {
  const publishedProducts = products
    .filter(product => isProductPublished(product))
    .filter(product => showInCustomerFavorites(product));

  const availableSlides = publishedProducts
    .filter(product => typeof isProductAvailable === 'function' ? isProductAvailable(product) : product.available !== false)
    .slice(0, 8)
    .map(product => ({ ...product, _slideStatus: 'Available now', _slideType: 'available' }));

  const incomingSlides = publishedProducts
    .filter(product => typeof isProductIncoming === 'function' ? isProductIncoming(product) : product.available === false)
    .slice(0, 4)
    .map(product => ({ ...product, _slideStatus: 'Incoming', _slideType: 'coming-soon' }));

  return [...availableSlides, ...incomingSlides].slice(0, 10);
}

function renderHomepageShowcase() {
  if (!homepageProductSlides) return;
  const slides = getHomepageSlides();
  if (!slides.length) {
    homepageProductSlides.innerHTML = `
      <article class="showcase-slide active fallback-showcase">
        <div class="showcase-image-wrap">
          <img src="assets/scentivity-logo-fused.png" alt="Scentivity logo" loading="lazy" />
          <span class="showcase-badge soon">No featured products</span>
        </div>
        <div class="showcase-copy">
          <p class="eyebrow">Customer favorites</p>
          <h3>Select products from admin</h3>
          <p>Open a product in the admin page and turn on “Show in Customer Favorites / Coming Soon Section”.</p>
        </div>
      </article>
    `;
    if (homepageProductDots) homepageProductDots.innerHTML = '';
    return;
  }

  showcaseIndex = ((showcaseIndex % slides.length) + slides.length) % slides.length;
  const product = slides[showcaseIndex];
  const name = cleanText(product.name || 'Scentivity product');
  const price = cleanText(product.price || ((typeof isProductIncoming === 'function' && isProductIncoming(product)) ? 'Coming soon' : 'Price on request'));
  const image = normalizeImagePath(product.image || 'assets/scentivity-logo-fused.png');
  const available = typeof isProductAvailable === 'function' ? isProductAvailable(product) : product.available !== false;
  const incoming = typeof isProductIncoming === 'function' ? isProductIncoming(product) : product.available === false;
  const key = cleanText(product._key || '');
  const meta = productDetailMeta(product);
  const statusLabel = cleanText(product._slideStatus || (typeof productStatusLabel === 'function' ? productStatusLabel(product) : (available ? 'Available now' : 'Coming soon')));

  homepageProductSlides.innerHTML = `
    <article class="showcase-slide active simplified-showcase-slide product-click-card" data-product-key="${key}" tabindex="0" aria-label="View details for ${name}">
      <div class="showcase-image-wrap">
        <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='assets/scentivity-logo-fused.png';" />
        <span class="showcase-badge ${available ? 'available' : 'soon'}">${statusLabel}</span>
      </div>
      <div class="showcase-copy">
        <p class="eyebrow">${statusLabel} • ${showcaseIndex + 1} of ${slides.length}</p>
        <h3>${name}</h3>
        <div class="compact-product-meta showcase-quick-meta">
          <span class="star-rating-symbol">★</span>
          <span>${meta.rating.toFixed(1)}</span>
          ${meta.reviews ? `<span>| ${formatCompactCount(meta.reviews)} reviews</span>` : ''}
          ${meta.bought ? `<span>| ${formatCompactCount(meta.bought)} bought</span>` : ''}
        </div>
        <div class="showcase-bottom">
          <strong>${price}</strong>
          ${available
            ? `<button class="btn primary add-to-cart" type="button" data-product-key="${key}">Add to Cart</button>`
            : `<button class="btn ghost" type="button" disabled>${incoming ? 'Coming Soon' : 'Out of Stock'}</button>`
          }
        </div>
      </div>
    </article>
  `;
  if (homepageProductDots) {
    homepageProductDots.innerHTML = slides.map((_, index) => `<button type="button" class="showcase-dot ${index === showcaseIndex ? 'active' : ''}" data-slide-index="${index}" aria-label="Show product ${index + 1}"></button>`).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.setTimeout(() => {
    if (homepageProductSlides && products.length) renderHomepageShowcase();
  }, 500);
});
