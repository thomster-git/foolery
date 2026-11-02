/**
 * store.js — EtchCentric Creations Laser Store
 *
 * Studio Photography & Precision Laser Craftsmanship by Jonathan Thoms
 *
 * Three-Tier Pricing Architecture:
 *  - Tier 1: Zero-Prep Stock Vectors & Craft Fair Clearance Slate ($12 single / $35 set of 4)
 *  - Tier 2: Bespoke Customer Photo Slate ($15 single / $45 set of 4 shared / $55 set of 4 unique)
 *  - Tier 3: Custom Acacia + Marble Coasters ($16 single / $48 set of 4 shared / $54 set of 4 unique)
 *
 * Features:
 *  - Real-time piece-level inventory deduplication (140 sq slate, 132 circ slate, 37 circ marble, 34 sq marble)
 *  - Interactive pack size (Set of 4 vs Single) and engraving tier selectors
 *  - Swipeable full-screen lightbox gallery
 *  - Request cart with quantity controls and Discord webhook submission
 */

(function() {
// ─── PRODUCT & TIER CATALOG ─────────────────────────────────────────────────

var products = [
  {
    id: 'c_slate_square',
    material: 'slate',
    shape: 'square',
    name: 'Slate Coasters — Square',
    tagline: 'Natural black slate · Chiseled square edge',
    desc: 'Hand-finished natural cleft slate coasters. Laser engraving reveals a crisp, high-contrast frosted white against dark charcoal stone. Cork-backed for furniture protection.',
    totalPieces: 140,
    img: '/store/images/coasters/slate/square/slate-square-blank.jpg',
    gallery: [
      { src: '/store/images/coasters/slate/square/slate-square-blank.jpg', caption: 'Square Slate Coaster — Blank natural stone' },
      { src: '/store/images/coasters/slate/square/slate-square-set.jpg', caption: 'Square Slate Coasters — Complete set of 4' },
      { src: '/store/images/coasters/slate/square/slate-square-nativity.jpg', caption: 'Fine-Detail Engraving — Nativity scene on square slate' },
      { src: '/store/images/coasters/slate/square/slate-square-puppy.jpg', caption: 'Bespoke Customer Photo — Pet portrait engraving' },
      { src: '/store/images/coasters/slate/square/slate-square-santa.jpg', caption: 'High-Contrast Engraving — Santa Claus portrait' }
    ],
    packTypes: {
      set4: {
        label: 'Set of 4',
        pieces: 4,
        badge: 'Save up to $15',
        options: {
          stock: {
            tier: 'Tier 1',
            label: 'Stock Vector / Classic Design',
            desc: 'Pre-made sports logos, holiday artwork, geometric vectors, or monograms',
            price: 35.00,
            unitNote: '$8.75 / coaster · Save $13 vs singles'
          },
          photo1: {
            tier: 'Tier 2',
            label: 'Custom Photo (1 Shared Across Set)',
            desc: 'Bespoke customer pet or family photo dithered for high-DPI stone pass',
            price: 45.00,
            unitNote: '$11.25 / coaster · Save $15 vs singles'
          },
          photo4: {
            tier: 'Tier 2',
            label: 'Custom Photos (4 Unique Photos)',
            desc: '4 different customer photos edited, background-removed & engraved',
            price: 55.00,
            unitNote: '$13.75 / coaster'
          }
        }
      },
      single: {
        label: 'Single (1x)',
        pieces: 1,
        badge: 'Individual',
        options: {
          stock: {
            tier: 'Tier 1',
            label: 'Stock Vector / Classic Design',
            desc: 'Zero-prep sports logos, holiday art, or clean text graphics',
            price: 12.00,
            unitNote: 'per individual coaster'
          },
          photo: {
            tier: 'Tier 2',
            label: 'Bespoke Customer Photo',
            desc: 'Customer photo conversion with background removal & high-DPI pass',
            price: 15.00,
            unitNote: 'per individual coaster'
          }
        }
      }
    }
  },
  {
    id: 'c_slate_circle',
    material: 'slate',
    shape: 'circle',
    name: 'Slate Coasters — Circle',
    tagline: 'Natural black slate · Chiseled round edge',
    desc: 'Circular natural slate stone with organic chiseled edges. Burns to an elegant bright white frost. Fitted with protective cork backing.',
    totalPieces: 132,
    img: '/store/images/coasters/slate/circle/slate-circle-blank.jpg',
    gallery: [
      { src: '/store/images/coasters/slate/circle/slate-circle-blank.jpg', caption: 'Circle Slate Coaster — Blank natural stone' },
      { src: '/store/images/coasters/slate/circle/slate-circle-santa.jpg', caption: 'High-Contrast Engraving — Santa Claus on circle slate' },
      { src: '/store/images/coasters/slate/circle/slate-circle-sleigh.jpg', caption: 'Fine-Detail Engraving — Santa & Reindeer night flight' }
    ],
    packTypes: {
      set4: {
        label: 'Set of 4',
        pieces: 4,
        badge: 'Save up to $15',
        options: {
          stock: {
            tier: 'Tier 1',
            label: 'Stock Vector / Classic Design',
            desc: 'Pre-made sports logos, holiday artwork, geometric vectors, or monograms',
            price: 35.00,
            unitNote: '$8.75 / coaster · Save $13 vs singles'
          },
          photo1: {
            tier: 'Tier 2',
            label: 'Custom Photo (1 Shared Across Set)',
            desc: 'Bespoke customer pet or family photo dithered for high-DPI stone pass',
            price: 45.00,
            unitNote: '$11.25 / coaster · Save $15 vs singles'
          },
          photo4: {
            tier: 'Tier 2',
            label: 'Custom Photos (4 Unique Photos)',
            desc: '4 different customer photos edited, background-removed & engraved',
            price: 55.00,
            unitNote: '$13.75 / coaster'
          }
        }
      },
      single: {
        label: 'Single (1x)',
        pieces: 1,
        badge: 'Individual',
        options: {
          stock: {
            tier: 'Tier 1',
            label: 'Stock Vector / Classic Design',
            desc: 'Zero-prep sports logos, holiday art, or clean text graphics',
            price: 12.00,
            unitNote: 'per individual coaster'
          },
          photo: {
            tier: 'Tier 2',
            label: 'Bespoke Customer Photo',
            desc: 'Customer photo conversion with background removal & high-DPI pass',
            price: 15.00,
            unitNote: 'per individual coaster'
          }
        }
      }
    }
  },
  {
    id: 'c_marble_circle',
    material: 'marble',
    shape: 'circle',
    name: 'Marble & Acacia Coasters — Circle',
    tagline: 'Dual-material · Natural white marble & acacia hardwood',
    desc: 'Modern circular profile pairing cool natural white marble with rich, warm acacia wood. Laser burns dark into the hardwood section for a high-end gift finish.',
    totalPieces: 37,
    img: '/store/images/coasters/marble+acacia/circle/marble-acacia-circle-blank.jpg',
    gallery: [
      { src: '/store/images/coasters/marble+acacia/circle/marble-acacia-circle-blank.jpg', caption: 'Circle Marble & Acacia Coaster — Blank dual-material' }
    ],
    packTypes: {
      set4: {
        label: 'Set of 4',
        pieces: 4,
        badge: 'Save $16',
        options: {
          shared: {
            tier: 'Tier 3',
            label: 'Shared Monogram / Family Crest',
            desc: 'Matching family crest, initials, or coordinates engraved across all 4',
            price: 48.00,
            unitNote: '$12.00 / coaster · Save $16 vs singles'
          },
          unique4: {
            tier: 'Tier 3',
            label: '4 Unique Names / Individual Styles',
            desc: 'Different family member names, titles, or personalized text per coaster',
            price: 54.00,
            unitNote: '$13.50 / coaster'
          }
        }
      },
      single: {
        label: 'Single (1x)',
        pieces: 1,
        badge: 'Individual',
        options: {
          custom: {
            tier: 'Tier 3',
            label: 'Custom Engraved Design',
            desc: 'Precision laser-etched hardwood monogram or graphic',
            price: 16.00,
            unitNote: 'per individual coaster'
          }
        }
      }
    }
  },
  {
    id: 'c_marble_square',
    material: 'marble',
    shape: 'square',
    name: 'Marble & Acacia Coasters — Square',
    tagline: 'Dual-material · Natural white marble & acacia hardwood',
    desc: 'Geometric square coasters blending smooth natural white marble with rich acacia wood grain. Each coaster features unique stone veining and natural timber variations.',
    totalPieces: 34,
    img: '/store/images/coasters/marble+acacia/square/marble-acacia-square-blank.jpg',
    gallery: [
      { src: '/store/images/coasters/marble+acacia/square/marble-acacia-square-blank.jpg', caption: 'Square Marble & Acacia Coaster — Blank dual-material' }
    ],
    packTypes: {
      set4: {
        label: 'Set of 4',
        pieces: 4,
        badge: 'Save $16',
        options: {
          shared: {
            tier: 'Tier 3',
            label: 'Shared Monogram / Family Crest',
            desc: 'Matching family crest, initials, or coordinates engraved across all 4',
            price: 48.00,
            unitNote: '$12.00 / coaster · Save $16 vs singles'
          },
          unique4: {
            tier: 'Tier 3',
            label: '4 Unique Names / Individual Styles',
            desc: 'Different family member names, titles, or personalized text per coaster',
            price: 54.00,
            unitNote: '$13.50 / coaster'
          }
        }
      },
      single: {
        label: 'Single (1x)',
        pieces: 1,
        badge: 'Individual',
        options: {
          custom: {
            tier: 'Tier 3',
            label: 'Custom Engraved Design',
            desc: 'Precision laser-etched hardwood monogram or graphic',
            price: 16.00,
            unitNote: 'per individual coaster'
          }
        }
      }
    }
  }
];

// All Gallery Photos for "Browse All Work" Lightbox
var allGalleryPhotos = [
  { src: '/store/images/coasters/slate/square/slate-square-blank.jpg', caption: 'Square Slate Coaster — Blank natural stone' },
  { src: '/store/images/coasters/slate/square/slate-square-set.jpg', caption: 'Square Slate Coasters — Complete set of 4' },
  { src: '/store/images/coasters/slate/square/slate-square-nativity.jpg', caption: 'Detailed Nativity Scene — High-contrast laser etch on slate' },
  { src: '/store/images/coasters/slate/square/slate-square-puppy.jpg', caption: 'Bespoke Customer Photo — Pet portrait engraving' },
  { src: '/store/images/coasters/slate/square/slate-square-santa.jpg', caption: 'Santa Claus Portrait — Detailed facial tone engraving on slate' },
  { src: '/store/images/coasters/slate/circle/slate-circle-blank.jpg', caption: 'Circle Slate Coaster — Blank natural stone' },
  { src: '/store/images/coasters/slate/circle/slate-circle-santa.jpg', caption: 'Circle Slate — Detailed Santa Claus engraving' },
  { src: '/store/images/coasters/slate/circle/slate-circle-sleigh.jpg', caption: 'Circle Slate — Santa & Reindeer night flight' },
  { src: '/store/images/coasters/marble+acacia/circle/marble-acacia-circle-blank.jpg', caption: 'Circle Marble & Acacia Coaster — Premium dual-tone blank' },
  { src: '/store/images/coasters/marble+acacia/square/marble-acacia-square-blank.jpg', caption: 'Square Marble & Acacia Coaster — Premium dual-tone blank' },
  { src: '/store/images/coasters/wood/square/wood-square-puppy.jpg', caption: 'Pine Wood Coaster — Holiday puppy engraving sample' },
  { src: '/store/images/archive/bottle-opener/opener_handle_01.jpg', caption: 'Oak Handle Bottle Opener — Laser-engraved portfolio sample' },
  { src: '/store/images/archive/bottle-opener/opener_circle_magnet_01.jpg', caption: 'Magnetic Circle Bottle Opener — Fridge mount sample' },
  { src: '/store/images/archive/commissions/commission_01.jpg', caption: 'Custom Send-In Item Commission — Etched stainless drinkware' },
  { src: '/store/images/archive/commissions/commission_02.jpg', caption: 'Custom Send-In Item Commission — Laser branding' },
  { src: '/store/images/archive/samples/PXL_20240704_183007489.jpg', caption: 'Detailed Vector Laser Artwork — Multi-contrast craft' },
  { src: '/store/images/archive/samples/PXL_20240620_004749430.jpg', caption: 'Hardwood and slate material testing' }
];

// ─── STATE ──────────────────────────────────────────────────────────────────
var currentFilter = 'all';

var cardState = {
  c_slate_square: { pack: 'set4', option: 'stock' },
  c_slate_circle: { pack: 'set4', option: 'stock' },
  c_marble_circle: { pack: 'set4', option: 'shared' },
  c_marble_square: { pack: 'set4', option: 'shared' }
};

var cart = {};
try {
  var saved = localStorage.getItem('etchcentric_cart_v3');
  if (saved) cart = JSON.parse(saved);
} catch(e) {}

var lightboxPhotos = [];
var lightboxIndex = 0;

// ─── INVENTORY COMPUTATIONS ─────────────────────────────────────────────────
function getUsedPieces(productId) {
  var used = 0;
  Object.keys(cart).forEach(function(cartKey) {
    if (cartKey.indexOf(productId + '__') === 0) {
      var parts = cartKey.split('__');
      var packType = parts[1]; // 'set4' or 'single'
      var piecesPerItem = packType === 'set4' ? 4 : 1;
      used += piecesPerItem * cart[cartKey];
    }
  });
  return used;
}

function getRemainingPieces(productId) {
  var prod = products.find(function(p) { return p.id === productId; });
  if (!prod) return 0;
  return Math.max(0, prod.totalPieces - getUsedPieces(productId));
}

// ─── CATALOG RENDERING ──────────────────────────────────────────────────────
function renderCatalog() {
  var container = document.getElementById('catalog');
  if (!container) return;
  container.innerHTML = '';

  var filtered = products.filter(function(p) {
    if (currentFilter === 'all') return true;
    return p.material === currentFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color:var(--text-light); grid-column:1/-1; text-align:center; padding:3rem;">No products match this filter.</p>';
    return;
  }

  filtered.forEach(function(item) {
    var state = cardState[item.id] || { pack: 'set4', option: 'stock' };
    var currentPackType = state.pack;
    var packConfig = item.packTypes[currentPackType];

    // Ensure valid option for current pack type
    if (!packConfig.options[state.option]) {
      state.option = Object.keys(packConfig.options)[0];
    }
    var currentOptKey = state.option;
    var currentOpt = packConfig.options[currentOptKey];

    var remaining = getRemainingPieces(item.id);
    var piecesNeeded = packConfig.pieces;

    // Stock label logic
    var maxSetsPossible = Math.floor(remaining / 4);
    var stockLabel = '';
    var stockDotClass = '';
    var btnDisabled = false;
    var btnLabel = 'Add ' + packConfig.label + ' to Request ($' + currentOpt.price.toFixed(2) + ')';

    if (remaining <= 0) {
      stockLabel = 'Out of stock';
      stockDotClass = 'out';
      btnDisabled = true;
      btnLabel = 'Out of Stock';
    } else if (currentPackType === 'set4' && remaining < 4) {
      stockLabel = remaining + ' coaster' + (remaining === 1 ? '' : 's') + ' left — singles only';
      stockDotClass = 'low';
      btnDisabled = true;
      btnLabel = 'Set of 4 Unavailable (' + remaining + ' left)';
    } else if (currentPackType === 'set4') {
      stockLabel = remaining + ' coasters in stock (up to ' + maxSetsPossible + ' sets)';
      stockDotClass = remaining < 16 ? 'low' : '';
    } else {
      stockLabel = remaining + ' coasters in stock';
      stockDotClass = remaining < 10 ? 'low' : '';
    }

    var card = document.createElement('div');
    card.className = 'item-card';
    card.id = 'card-' + item.id;

    var galleryCount = item.gallery.length;
    var photoBadge = galleryCount > 0 ? '<span class="photo-badge">📷 ' + galleryCount + ' photo' + (galleryCount !== 1 ? 's' : '') + '</span>' : '';

    // Render design option buttons
    var designOptsHtml = '';
    Object.keys(packConfig.options).forEach(function(optKey) {
      var opt = packConfig.options[optKey];
      var isActive = optKey === currentOptKey;
      designOptsHtml +=
        '<button type="button" class="design-opt-btn ' + (isActive ? 'active' : '') + '" data-opt="' + optKey + '">' +
          '<div>' +
            '<div class="design-opt-title">' + opt.label + '</div>' +
            '<div class="design-opt-desc">' + opt.desc + '</div>' +
          '</div>' +
          '<div class="design-opt-price">$' + opt.price.toFixed(2) + '</div>' +
        '</button>';
    });

    card.innerHTML =
      '<div class="item-img-wrap" title="Click to view photo gallery">' +
        '<img src="' + item.img + '" class="item-img" loading="lazy" width="400" height="400" alt="' + item.name + '">' +
        photoBadge +
        '<div class="img-overlay"><span>View Gallery (' + galleryCount + ') →</span></div>' +
      '</div>' +
      '<div class="item-content">' +
        '<div class="item-tagline">' + item.tagline + '</div>' +
        '<div class="item-title">' + item.name + '</div>' +
        '<p class="item-desc">' + item.desc + '</p>' +

        // Pack Selector Segment
        '<div class="option-group-label">1. Choose Pack Size:</div>' +
        '<div class="pack-selector">' +
          '<button type="button" class="pack-opt ' + (currentPackType === 'set4' ? 'active' : '') + '" data-pack="set4">' +
            '<span>Set of 4</span>' +
            '<span class="pack-badge">' + item.packTypes.set4.badge + '</span>' +
          '</button>' +
          '<button type="button" class="pack-opt ' + (currentPackType === 'single' ? 'active' : '') + '" data-pack="single">' +
            '<span>Single (1x)</span>' +
            '<span class="pack-badge" style="color:var(--text-light); font-weight:normal;">Individual</span>' +
          '</button>' +
        '</div>' +

        // Design Options Segment
        '<div class="option-group-label">2. Personalization & Engraving Tier:</div>' +
        '<div class="design-opts-wrap">' +
          designOptsHtml +
        '</div>' +

        // Price Row
        '<div class="item-pricing-row">' +
          '<div class="item-main-price">$' + currentOpt.price.toFixed(2) + ' <span style="font-size:0.75rem; font-weight:600; color:var(--text-light);">CAD</span></div>' +
          '<div class="item-unit-note">' + currentOpt.unitNote + '</div>' +
        '</div>' +

        // Stock Badge
        '<div class="stock-badge">' +
          '<span class="stock-dot ' + stockDotClass + '"></span>' +
          '<span>' + stockLabel + '</span>' +
        '</div>' +

        // Add to Request Button
        '<button class="add-btn" ' + (btnDisabled ? 'disabled' : '') + '>' + btnLabel + '</button>' +
      '</div>';

    // Gallery Lightbox trigger
    card.querySelector('.item-img-wrap').addEventListener('click', function() {
      openLightbox(item.gallery, 0, item.name);
    });

    // Pack Selector buttons
    card.querySelectorAll('.pack-opt').forEach(function(optBtn) {
      optBtn.addEventListener('click', function() {
        var newPack = optBtn.getAttribute('data-pack');
        cardState[item.id].pack = newPack;
        // Default to first option for that pack
        var newPackConfig = item.packTypes[newPack];
        cardState[item.id].option = Object.keys(newPackConfig.options)[0];
        renderCatalog();
      });
    });

    // Design option buttons
    card.querySelectorAll('.design-opt-btn').forEach(function(designBtn) {
      designBtn.addEventListener('click', function() {
        var optKey = designBtn.getAttribute('data-opt');
        cardState[item.id].option = optKey;
        renderCatalog();
      });
    });

    // Add button
    card.querySelector('.add-btn').addEventListener('click', function(e) {
      addToCart(item.id, currentPackType, currentOptKey, e.target);
    });

    container.appendChild(card);
  });
}

function setMaterialFilter(material, btn) {
  currentFilter = material;
  document.querySelectorAll('.filter-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  if (btn) btn.classList.add('active');
  renderCatalog();
}

function togglePricingGuide() {
  var content = document.getElementById('pricing-guide-content');
  var icon = document.getElementById('guide-toggle-icon');
  if (!content) return;
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'block';
    if (icon) icon.textContent = 'Hide details ▴';
  } else {
    content.style.display = 'none';
    if (icon) icon.textContent = 'View details ▾';
  }
}

// ─── CART LOGIC ─────────────────────────────────────────────────────────────
function saveCart() {
  localStorage.setItem('etchcentric_cart_v3', JSON.stringify(cart));
}

function addToCart(productId, packType, optKey, btnElement) {
  var prod = products.find(function(p) { return p.id === productId; });
  if (!prod) return;
  var pack = prod.packTypes[packType];
  var needed = pack.pieces;
  var remaining = getRemainingPieces(productId);

  if (remaining < needed) {
    alert('Sorry, there is not enough stock remaining for this pack option.');
    return;
  }

  var cartKey = productId + '__' + packType + '__' + optKey;
  cart[cartKey] = (cart[cartKey] || 0) + 1;
  saveCart();
  updateCartBadge();

  if (btnElement) {
    var originalText = btnElement.textContent;
    btnElement.textContent = 'Added to Request! ✅';
    btnElement.style.background = 'var(--green)';
    btnElement.style.borderColor = 'var(--green)';
    btnElement.style.color = 'white';

    setTimeout(function() {
      btnElement.style.background = '';
      btnElement.style.borderColor = '';
      btnElement.style.color = '';
      renderCatalog();
    }, 1200);
  } else {
    renderCatalog();
  }
}

function updateCartItemQty(cartKey, delta) {
  if (!cart[cartKey]) return;
  var parts = cartKey.split('__');
  var productId = parts[0];
  var packType = parts[1];
  var prod = products.find(function(p) { return p.id === productId; });
  if (!prod) return;
  var pack = prod.packTypes[packType];

  if (delta > 0) {
    var remaining = getRemainingPieces(productId);
    if (remaining < pack.pieces) {
      alert('Cannot add more. No additional stock available for this item.');
      return;
    }
    cart[cartKey]++;
  } else {
    cart[cartKey]--;
    if (cart[cartKey] <= 0) {
      delete cart[cartKey];
    }
  }

  saveCart();
  updateCartBadge();
  updateCartUI();
  renderCatalog();
}

function removeCartItem(cartKey) {
  if (cart[cartKey]) {
    delete cart[cartKey];
    saveCart();
    updateCartBadge();
    updateCartUI();
    renderCatalog();
  }
}

function updateCartBadge() {
  var totalCount = 0;
  Object.keys(cart).forEach(function(k) {
    totalCount += cart[k];
  });
  var badge = document.getElementById('cartCount');
  if (badge) badge.textContent = totalCount;
}

function updateCartUI() {
  var total = 0;
  var totalItems = 0;
  var totalPieces = 0;
  var cartDiv = document.getElementById('cartItems');
  if (!cartDiv) return;
  cartDiv.innerHTML = '';

  var keys = Object.keys(cart);

  keys.forEach(function(cartKey) {
    var parts = cartKey.split('__');
    var productId = parts[0];
    var packType = parts[1];
    var optKey = parts[2];
    var prod = products.find(function(p) { return p.id === productId; });
    if (!prod) return;
    var pack = prod.packTypes[packType];
    if (!pack) return;
    var opt = pack.options[optKey];
    if (!opt) return;

    var qty = cart[cartKey];
    totalItems += qty;
    var pieceCount = pack.pieces * qty;
    totalPieces += pieceCount;
    var rowTotal = opt.price * qty;
    total += rowTotal;

    var row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML =
      '<div style="flex-grow:1; padding-right:1rem;">' +
        '<div style="font-weight:700; color:var(--text); font-size:0.95rem;">' + prod.name + '</div>' +
        '<div style="font-size:0.82rem; color:var(--cyan); margin-top:2px;">' + pack.label + ' · ' + opt.label + '</div>' +
        '<div style="font-size:0.75rem; color:var(--text-light); margin-top:1px;">' + pieceCount + ' coaster' + (pieceCount !== 1 ? 's' : '') + ' total · $' + opt.price.toFixed(2) + ' CAD each</div>' +
        '<div class="cart-qty-ctrl">' +
          '<button type="button" class="cart-qty-btn dec-btn" aria-label="Decrease quantity">−</button>' +
          '<span style="font-size:0.88rem; font-weight:700; min-width:20px; text-align:center;">' + qty + '</span>' +
          '<button type="button" class="cart-qty-btn inc-btn" aria-label="Increase quantity">+</button>' +
        '</div>' +
      '</div>' +
      '<div style="text-align:right;">' +
        '<div style="font-weight:800; color:var(--green); font-size:1.05rem; margin-bottom:0.5rem;">$' + rowTotal.toFixed(2) + '</div>' +
        '<button type="button" class="remove-btn">Remove</button>' +
      '</div>';

    row.querySelector('.dec-btn').addEventListener('click', function() { updateCartItemQty(cartKey, -1); });
    row.querySelector('.inc-btn').addEventListener('click', function() { updateCartItemQty(cartKey, 1); });
    row.querySelector('.remove-btn').addEventListener('click', function() { removeCartItem(cartKey); });

    cartDiv.appendChild(row);
  });

  var totalEl = document.getElementById('cartTotal');
  if (totalEl) {
    totalEl.innerHTML =
      '<div style="font-size:0.85rem; color:var(--text-light); font-weight:normal; margin-bottom:4px;">Total Coasters: ' + totalPieces + ' piece' + (totalPieces !== 1 ? 's' : '') + '</div>' +
      'Estimated Total: $' + total.toFixed(2) + ' CAD';
  }

  if (totalItems === 0) {
    cartDiv.innerHTML = '<p style="color:var(--text-light); margin-bottom:1.5rem; text-align:center; padding:1.5rem 0;">Your request cart is empty. Pick a coaster and add it to start!</p>';
  }
}

function openCart() {
  updateCartUI();
  var modal = document.getElementById('cartModal');
  if (modal) modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeCartModal() {
  var modal = document.getElementById('cartModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

// ─── LIGHTBOX ───────────────────────────────────────────────────────────────
function openLightbox(photos, startIndex, title) {
  if (!photos || photos.length === 0) return;
  lightboxPhotos = photos;
  lightboxIndex = startIndex || 0;

  document.getElementById('lightbox-title').textContent = title || 'Coaster Gallery';
  document.getElementById('lightbox-counter').textContent = (lightboxIndex + 1) + ' / ' + lightboxPhotos.length;
  document.getElementById('lightbox-img').src = lightboxPhotos[lightboxIndex].src;

  var captionEl = document.getElementById('lightbox-caption');
  if (captionEl) captionEl.textContent = lightboxPhotos[lightboxIndex].caption || '';

  document.getElementById('lightbox-prev').style.display = lightboxPhotos.length > 1 ? 'flex' : 'none';
  document.getElementById('lightbox-next').style.display = lightboxPhotos.length > 1 ? 'flex' : 'none';

  var thumbContainer = document.getElementById('lightbox-thumbnails');
  thumbContainer.innerHTML = '';
  if (lightboxPhotos.length > 1) {
    var frag = document.createDocumentFragment();
    lightboxPhotos.forEach(function(photoObj, idx) {
      var img = document.createElement('img');
      img.src = photoObj.src;
      img.className = 'lb-thumb';
      img.loading = 'lazy';
      if (idx === lightboxIndex) img.classList.add('active');
      img.onclick = function() { lightboxIndex = idx; updateLightboxImage(); };
      frag.appendChild(img);
    });
    thumbContainer.appendChild(frag);
  }

  document.getElementById('lightbox-overlay').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  var lb = document.getElementById('lightbox-overlay');
  if (lb) lb.style.display = 'none';
  document.body.style.overflow = '';
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
  updateLightboxImage();
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  var img = document.getElementById('lightbox-img');
  if (!img) return;
  img.style.opacity = '0';
  setTimeout(function() {
    img.src = lightboxPhotos[lightboxIndex].src;
    document.getElementById('lightbox-counter').textContent = (lightboxIndex + 1) + ' / ' + lightboxPhotos.length;

    var captionEl = document.getElementById('lightbox-caption');
    if (captionEl) captionEl.textContent = lightboxPhotos[lightboxIndex].caption || '';

    img.style.opacity = '1';

    var thumbs = document.querySelectorAll('.lb-thumb');
    thumbs.forEach(function(t, idx) {
      if (idx === lightboxIndex) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        t.classList.remove('active');
      }
    });
  }, 120);
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLightbox();
    closeCartModal();
  }
  var lb = document.getElementById('lightbox-overlay');
  if (!lb || lb.style.display === 'none') return;
  if (e.key === 'ArrowLeft') lightboxPrev();
  if (e.key === 'ArrowRight') lightboxNext();
});

// Touch/swipe navigation
(function() {
  var startX = 0;
  var lb = document.getElementById('lightbox-img');
  if (!lb) return;
  lb.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { dx < 0 ? lightboxNext() : lightboxPrev(); }
  });
})();

function openGeneralGallery() {
  openLightbox(allGalleryPhotos, 0, 'EtchCentric Coasters & Custom Work');
}

// ─── ORDER FORM SUBMISSION ──────────────────────────────────────────────────
var orderForm = document.getElementById('orderForm');
if (orderForm) {
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      alert('Please add items to your request before submitting.');
      return;
    }

    var name = document.getElementById('contactName').value;
    var email = document.getElementById('contactEmail').value;
    var notes = document.getElementById('contactNotes').value;
    var btn = orderForm.querySelector('.submit-btn');
    var status = document.getElementById('formStatus');

    btn.disabled = true;
    btn.textContent = 'Sending Request...';

    var totalCost = 0;
    var totalPieces = 0;

    var orderDetails = Object.keys(cart).map(function(cartKey) {
      var parts = cartKey.split('__');
      var prodId = parts[0];
      var packType = parts[1];
      var optKey = parts[2];
      var prod = products.find(function(p) { return p.id === prodId; });
      if (!prod) return '';
      var pack = prod.packTypes[packType];
      if (!pack) return '';
      var opt = pack.options[optKey];
      if (!opt) return '';

      var qty = cart[cartKey];
      var cost = opt.price * qty;
      var pieceCount = pack.pieces * qty;
      totalCost += cost;
      totalPieces += pieceCount;
      return '- ' + qty + 'x ' + prod.name + ' (' + pack.label + ' · ' + opt.label + ') — $' + cost.toFixed(2) + ' CAD [' + pieceCount + ' coasters]';
    }).filter(Boolean).join('\n');

    var locationInfo = document.getElementById('contactLocation') ? document.getElementById('contactLocation').value : 'N/A';
    var timeline = document.getElementById('contactTimeline') ? document.getElementById('contactTimeline').value : 'N/A';

    var payload = {
      content: '🚨 **NEW LASER ENGRAVING ORDER REQUEST** 🚨\n\n' +
               '**From:** ' + name + '\n' +
               '**Email:** ' + email + '\n' +
               '**Location / Postal:** ' + locationInfo + '\n' +
               '**Timeline:** ' + timeline + '\n\n' +
               '**Requested Items:**\n' + orderDetails + '\n\n' +
               '**Total Coaster Pieces Reserved:** ' + totalPieces + ' coasters\n' +
               '**Estimated Total:** $' + totalCost.toFixed(2) + ' CAD\n\n' +
               '**Design / Custom Notes:**\n' + notes
    };

    var WEBHOOK_URL = '/.netlify/functions/submit-order';

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function(res) {
        if (!res.ok) throw new Error('Network response was not ok');
        status.style.color = 'var(--green)';
        status.textContent = 'Order request sent directly to Jonathan! He will review your design and follow up shortly.';
        cart = {};
        saveCart();
        updateCartBadge();
        updateCartUI();
        renderCatalog();
        btn.textContent = 'Order Request Sent ✅';
      })
      .catch(function(err) {
        console.error('Submit error:', err);
        status.style.color = 'var(--red)';
        status.textContent = 'Error sending request via webhook. Please contact social@thomsfoolery.com directly.';
        btn.disabled = false;
        btn.textContent = 'Retry Order Request';
      });
  });
}

// ─── EXPORT TO WINDOW ───────────────────────────────────────────────────────
window.openGeneralGallery = openGeneralGallery;
window.openCart = openCart;
window.closeLightbox = closeLightbox;
window.lightboxPrev = lightboxPrev;
window.lightboxNext = lightboxNext;
window.closeCartModal = closeCartModal;
window.setMaterialFilter = setMaterialFilter;
window.togglePricingGuide = togglePricingGuide;
window.addToCart = addToCart;

// ─── INITIALIZATION ─────────────────────────────────────────────────────────
renderCatalog();
updateCartBadge();

})();
