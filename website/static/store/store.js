/**
 * store.js — EtchCentric Creations Laser Store
 *
 * Architecture:
 *  1. Landing: Category selector (Bottle Openers / Coasters / Commissions)
 *  2. Category view: All product variants in that category with thumbnails
 *  3. Lightbox: Swipeable full-screen gallery for each product's photos
 *  4. General Gallery: Browse ALL project photos
 *  5. Order cart + backend webhook request form
 */

(function() {
// ─── DATA ─────────────────────────────────────────────────────────────────────

var categories = [
  {
    id: 'openers',
    label: 'Bottle Openers',
    emoji: '🍺',
    desc: 'Custom engraved bottle openers. Perfect for gifts, weddings, or stocking up the bar.',
    coverImg: '/store/images/bottle-opener/opener_handle_01.jpg'
  },
  {
    id: 'coasters',
    label: 'Coasters',
    emoji: '🪵',
    desc: 'Slate, acacia granite, and pine wood coasters engraved to order. Sets of 4.',
    coverImg: '/store/images/coasters/coaster_slate_circle_01.jpg'
  },
  {
    id: 'commission',
    label: 'Custom Commissions',
    emoji: '✉️',
    desc: 'Send in your own item — Yeti mugs, knives, tech, wood panels. Price by quote.',
    coverImg: '/store/images/bottle-opener/opener_handle_03.jpg'
  }
];

var inventory = [
  // ── BOTTLE OPENERS ──────────────────────────────────────────────────────────
  {
    id: 'b1', category: 'openers', type: 'blank',
    name: 'Bottle Opener — Handle Style',
    tagline: 'Classic engraved wood handle opener',
    price: 15, qty: 10,
    desc: 'Solid oak handle bottle opener with stainless head. Engrave any name, quote, or design. Great as personalized gifts or event favours.',
    img: '/store/images/bottle-opener/opener_handle_01.jpg',
    gallery: [
      '/store/images/bottle-opener/opener_handle_01.jpg',
      '/store/images/bottle-opener/opener_handle_02.jpg',
      '/store/images/bottle-opener/opener_handle_03.jpg',
      '/store/images/bottle-opener/opener_handle_04.jpg',
      '/store/images/bottle-opener/opener_handle_05.jpg'
    ]
  },
  {
    id: 'b2', category: 'openers', type: 'blank',
    name: 'Bottle Opener — Circle Magnet',
    tagline: 'Magnetic fridge-mount circle opener',
    price: 10, qty: 15,
    desc: 'Compact wooden circle bottle opener with a strong magnet back. Sticks right to your fridge. Engrave a name, logo, or short message.',
    img: '/store/images/bottle-opener/opener_circle_magnet_01.jpg',
    gallery: [
      '/store/images/bottle-opener/opener_circle_magnet_01.jpg'
    ]
  },

  // ── COASTERS ────────────────────────────────────────────────────────────────
  {
    id: 'c1', category: 'coasters', type: 'blank',
    name: 'Slate Coasters — Circle (Set of 4)',
    tagline: 'Black slate, bright white engrave',
    price: 30, qty: 8,
    desc: 'Natural slate stone circle coasters. Laser engraving burns to a crisp frosted white against the dark stone. Cork-backed for surface protection.',
    img: '/store/images/coasters/coaster_slate_circle_01.jpg',
    gallery: [
      '/store/images/coasters/coaster_slate_circle_01.jpg',
      '/store/images/coasters/coaster_slate_circle_02.jpg',
      '/store/images/coasters/coaster_slate_circle_05.jpg',
      '/store/images/coasters/coaster_slate_circle_06.jpg',
      '/store/images/coasters/coaster_slate_circle_07.jpg',
      '/store/images/coasters/coaster_slate_circle_08.jpg',
      '/store/images/coasters/coaster_slate_circle_09.jpg',
      '/store/images/coasters/coaster_slate_circle_extra_01.jpg',
      '/store/images/coasters/coaster_slate_circle_extra_02.jpg',
      '/store/images/coasters/coaster_slate_circle_extra_03.jpg'
    ]
  },
  {
    id: 'c2', category: 'coasters', type: 'blank',
    name: 'Slate Coasters — Square (Set of 4)',
    tagline: 'Black slate, bright white engrave',
    price: 30, qty: 8,
    desc: 'Natural slate stone square coasters. Same high-contrast frosted white engraving as the circles, in a clean square format. Cork-backed.',
    img: '/store/images/coasters/coaster_slate_square_08.jpg',
    gallery: [
      '/store/images/coasters/coaster_slate_square_08.jpg'
    ]
  },
  {
    id: 'c3', category: 'coasters', type: 'blank',
    name: 'Acacia & Granite Coasters (Set of 4)',
    tagline: 'Half warm acacia, half dark granite',
    price: 45, qty: 5,
    desc: 'Elegant two-material coasters — one half warm acacia wood, one half dark granite. Available in circle and square. Each piece is naturally unique. Engraves beautifully on both halves.',
    img: '/store/images/coasters/coaster_acacia_granite_circle_01.jpg',
    gallery: [
      '/store/images/coasters/coaster_acacia_granite_circle_01.jpg',
      '/store/images/coasters/coaster_acacia_granite_square_03.jpg'
    ]
  },
  {
    id: 'c5', category: 'coasters', type: 'blank',
    name: 'Pine Wood Coasters — Square (Set of 4)',
    tagline: 'Natural light pine, warm engrave',
    price: 25, qty: 10,
    desc: 'Warm natural pine wood square coasters. Engraving produces a rich dark-brown contrast against the light wood grain. Great for rustic, cabin, or novelty aesthetics.',
    img: '/store/images/coasters/coaster_pine_square_01.jpg',
    gallery: [
      '/store/images/coasters/coaster_pine_square_01.jpg',
      '/store/images/coasters/coaster_pine_square_02.jpg',
      '/store/images/coasters/coaster_pine_square_03.jpg',
      '/store/images/coasters/coaster_pine_square_04.jpg'
    ]
  },

  // ── COMMISSIONS ─────────────────────────────────────────────────────────────
  {
    id: 'x1', category: 'commission', type: 'commission',
    name: 'Send-In Item — Custom Quote',
    tagline: 'Engrave your own item',
    price: 0, qty: 999,
    desc: 'Mail me your Yeti tumbler, pocket knife, wood panel, acrylic piece, or whatever you have in mind. Price is quoted after reviewing your item and design. Contact first.',
    img: '/store/images/commissions/commission_01.jpg',
    gallery: [
      '/store/images/commissions/commission_01.jpg',
      '/store/images/commissions/commission_02.jpg',
      '/store/images/commissions/commission_03.jpg',
      '/store/images/commissions/commission_04.jpg',
      '/store/images/commissions/commission_05.jpg'
    ]
  }
];

// Build a flat array of all real project photos for the general gallery
var allGalleryPhotos = [];
inventory.forEach(function(item) {
  if (item.type !== 'blank') {
    item.gallery.forEach(function(src) {
      if (!src.includes('placeholder') && !allGalleryPhotos.find(p => p.src === src)) {
        allGalleryPhotos.push({ src: src, caption: item.name + ' — ' + item.tagline });
      }
    });
  }
});

var samples = [
  '/store/images/samples/FB_IMG_1718226965411.jpg',
  '/store/images/samples/PXL_20240613_230009538.jpg',
  '/store/images/samples/PXL_20240614_151115728.jpg',
  '/store/images/samples/PXL_20240618_181404706.jpg',
  '/store/images/samples/PXL_20240618_211002674.jpg',
  '/store/images/samples/PXL_20240620_004749430.jpg',
  '/store/images/samples/PXL_20240626_185711951.jpg',
  '/store/images/samples/PXL_20240704_032500587.MP.jpg',
  '/store/images/samples/PXL_20240704_034648776.jpg',
  '/store/images/samples/PXL_20240704_145805455.jpg',
  '/store/images/samples/PXL_20240704_183007489.jpg',
  '/store/images/samples/PXL_20240706_033305751.jpg',
  '/store/images/samples/PXL_20240715_140159328.jpg',
  '/store/images/samples/PXL_20240715_141249717.jpg',
  '/store/images/samples/PXL_20240724_164140372.jpg',
  '/store/images/samples/original_1d5d8fb3-16ad-43cc-bcbe-455c11976fd4_PXL_20240620_185504545.MP.jpg'
];
samples.forEach(function(src) {
  if (!allGalleryPhotos.find(p => p.src === src)) {
    allGalleryPhotos.push({ src: src, caption: 'Custom Commission / Portfolio Example' });
  }
});

// ─── STATE ────────────────────────────────────────────────────────────────────
var cart = {};
try {
  var saved = localStorage.getItem('etchcentric_cart');
  if (saved) cart = JSON.parse(saved);
} catch(e) {}

var currentCategory = null;
var lightboxPhotos = [];
var lightboxIndex = 0;

// ─── CATEGORY LANDING ─────────────────────────────────────────────────────────
function renderLanding() {
  currentCategory = null;
  var container = document.getElementById('catalog');
  container.innerHTML = '';

  // Back button hidden
  var backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.style.display = 'none';

  // Page title reset
  var pageTitle = document.getElementById('page-category-title');
  if (pageTitle) {
    pageTitle.textContent = 'What are you looking for?';
    pageTitle.style.display = 'block';
  }

  // Hide filter tabs, show landing grid
  var tabs = document.getElementById('filter-tabs');
  if (tabs) tabs.style.display = 'none';

  // Gallery button visible on landing
  var galleryBtn = document.getElementById('gallery-all-btn');
  if (galleryBtn) galleryBtn.style.display = 'inline-flex';

  categories.forEach(function(cat) {
    var card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML =
      '<div class="category-cover" style="background-image:url(\'' + cat.coverImg + '\')"></div>' +
      '<div class="category-body">' +
        '<div class="category-emoji">' + cat.emoji + '</div>' +
        '<div class="category-name">' + cat.label + '</div>' +
        '<div class="category-desc">' + cat.desc + '</div>' +
        '<button class="category-btn">Browse ' + cat.label + ' →</button>' +
      '</div>';
    card.addEventListener('click', function() {
      showCategory(cat.id);
    });
    container.appendChild(card);
  });

  // Add a dedicated Gallery card
  var galleryCard = document.createElement('div');
  galleryCard.className = 'category-card';
  galleryCard.innerHTML =
    '<div class="category-cover" style="background-image:url(\'/store/images/samples/PXL_20240704_183007489.jpg\')"></div>' +
    '<div class="category-body">' +
      '<div class="category-emoji">🖼️</div>' +
      '<div class="category-name">Full Gallery</div>' +
      '<div class="category-desc">Browse all project photos, commissions, and materials in one place.</div>' +
      '<button class="category-btn">Open Gallery →</button>' +
    '</div>';
  galleryCard.addEventListener('click', openGeneralGallery);
  container.appendChild(galleryCard);
}

// ─── CATEGORY VIEW ────────────────────────────────────────────────────────────
function showCategory(catId) {
  currentCategory = catId;
  var cat = categories.find(function(c) { return c.id === catId; });

  var backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.style.display = 'inline-flex';
    backBtn.textContent = '← All Categories';
  }

  var pageTitle = document.getElementById('page-category-title');
  if (pageTitle) {
    pageTitle.textContent = cat.emoji + ' ' + cat.label;
  }

  var galleryBtn = document.getElementById('gallery-all-btn');
  if (galleryBtn) galleryBtn.style.display = 'none';

  var container = document.getElementById('catalog');
  container.innerHTML = '';

  var filtered = inventory.filter(function(i) { return i.category === catId; });

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color:var(--text-light); grid-column:1/-1; text-align:center; padding:2rem;">No items in this category currently. Check back soon!</p>';
    return;
  }

  filtered.forEach(function(item) {
    var inCart = cart[item.id] || 0;
    var remaining = item.qty - inCart;
    var priceStr = item.price > 0 ? '$' + item.price.toFixed(2) : 'Custom Quote';
    var stockStr = item.qty === 999 ? 'Custom order' : remaining + ' sets in stock';
    var btnLabel = remaining <= 0 ? 'Out of Stock' : 'Add to Request';
    var btnDisabled = remaining <= 0 ? 'disabled' : '';
    var galleryCount = item.gallery.filter(function(s) { return !s.includes('placeholder'); }).length;
    var photoBadge = galleryCount > 0 ? '<span class="photo-badge">📷 ' + galleryCount + ' photo' + (galleryCount !== 1 ? 's' : '') + '</span>' : '';

    var card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML =
      '<div class="item-img-wrap">' +
        '<img src="' + item.img + '" class="item-img" loading="lazy" width="400" height="400" title="Click to view gallery">' +
        photoBadge +
        '<div class="img-overlay"><span>View Examples →</span></div>' +
      '</div>' +
      '<div class="item-content">' +
        '<div class="item-tagline">' + item.tagline + '</div>' +
        '<div class="item-header">' +
          '<div class="item-title">' + item.name + '</div>' +
          '<div class="item-price">' + priceStr + '</div>' +
        '</div>' +
        '<p class="item-desc">' + item.desc + '</p>' +
        '<div class="item-qty">' + stockStr + '</div>' +
        '<button class="add-btn" ' + btnDisabled + '>' + btnLabel + '</button>' +
      '</div>';

    card.querySelector('.item-img-wrap').addEventListener('click', function() {
      var mappedGallery = item.gallery
        .filter(function(s) { return !s.includes('placeholder'); })
        .map(function(s) { return { src: s, caption: item.name + ' — ' + item.tagline }; });
      openLightbox(mappedGallery, 0, item.name);
    });
    card.querySelector('.add-btn').addEventListener('click', function(e) { addToCart(item.id, e.target); });
    container.appendChild(card);
  });
}

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function openLightbox(photos, startIndex, title) {
  if (!photos || photos.length === 0) return;
  lightboxPhotos = photos;
  lightboxIndex = startIndex || 0;

  document.getElementById('lightbox-title').textContent = title || '';
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
  document.getElementById('lightbox-overlay').style.display = 'none';
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

// Touch/swipe on lightbox
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

// ─── GENERAL GALLERY ─────────────────────────────────────────────────────────
function openGeneralGallery() {
  openLightbox(allGalleryPhotos, 0, 'All Projects Gallery');
}

// ─── CART ─────────────────────────────────────────────────────────────────────
function saveCart() {
  localStorage.setItem('etchcentric_cart', JSON.stringify(cart));
}

function addToCart(id, btnElement) {
  var item = inventory.find(function(i) { return i.id === id; });
  if (!cart[id]) cart[id] = 0;
  
  if (cart[id] >= item.qty) {
    alert('Cannot add more of this item. Stock limit reached.');
    return;
  }
  
  cart[id]++;
  saveCart();
  updateCartBadge();
  
  if (btnElement) {
    var originalText = btnElement.textContent;
    btnElement.textContent = 'Added! ✅';
    btnElement.style.background = 'var(--green)';
    btnElement.style.color = 'white';
    
    var remaining = item.qty - cart[id];
    var qtyDiv = btnElement.parentElement.querySelector('.item-qty');
    if (qtyDiv) {
        qtyDiv.textContent = item.qty === 999 ? 'Custom order' : remaining + ' sets in stock';
    }
    
    if (remaining <= 0) {
        setTimeout(function() {
            btnElement.textContent = 'Out of Stock';
            btnElement.disabled = true;
            btnElement.style.background = '';
            btnElement.style.color = '';
        }, 1500);
    } else {
        setTimeout(function() {
            btnElement.textContent = originalText;
            btnElement.style.background = '';
            btnElement.style.color = '';
        }, 1500);
    }
  } else if (currentCategory) {
    showCategory(currentCategory);
  }
}

function removeFromCart(id) {
  if (!cart[id]) return;
  cart[id]--;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  updateCartBadge();
  updateCartUI();
  if (currentCategory) showCategory(currentCategory);
}

function updateCartBadge() {
  var count = Object.values(cart).reduce(function(a, b) { return a + b; }, 0);
  document.getElementById('cartCount').textContent = count;
}

function updateCartUI() {
  var total = 0;
  var totalItems = 0;
  var cartDiv = document.getElementById('cartItems');
  cartDiv.innerHTML = '';

  Object.keys(cart).forEach(function(id) {
    var item = inventory.find(function(i) { return i.id === id; });
    var qty = cart[id];
    totalItems += qty;
    total += item.price * qty;

    var row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML =
      '<div>' +
        '<div style="font-weight:bold;">' + item.name + '</div>' +
        '<div style="font-size:0.85rem; color:var(--text-light);">' + qty + 'x @ $' + item.price + '</div>' +
      '</div>' +
      '<div><button class="remove-btn">Remove</button></div>';
    row.querySelector('.remove-btn').addEventListener('click', function() { removeFromCart(id); });
    cartDiv.appendChild(row);
  });

  document.getElementById('cartTotal').textContent = 'Estimated Total: $' + total.toFixed(2) + ' CAD';
  if (totalItems === 0) {
    cartDiv.innerHTML = '<p style="color:var(--text-light); margin-bottom:1rem;">Your request cart is empty.</p>';
  }
}

function openCart() {
  updateCartUI();
  document.getElementById('cartModal').style.display = 'flex';
}

function closeCartModal() {
  document.getElementById('cartModal').style.display = 'none';
}

// ─── GALLERY MODAL (legacy — now replaced by lightbox) ────────────────────────
function closeModals() {
  document.getElementById('cartModal').style.display = 'none';
  closeLightbox();
}

document.querySelectorAll('.modal-overlay').forEach(function(el) {
  el.addEventListener('click', function(e) {
    if (e.target === el) closeModals();
  });
});

// ─── FORM SUBMISSION ─────────────────────────────────────────────────────────
document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (Object.keys(cart).length === 0) { alert('Please add items to your request first.'); return; }

  var name = document.getElementById('contactName').value;
  var email = document.getElementById('contactEmail').value;
  var notes = document.getElementById('contactNotes').value;
  var btn = document.querySelector('.submit-btn');
  var status = document.getElementById('formStatus');

  btn.disabled = true;
  btn.textContent = 'Sending...';

  var orderDetails = Object.keys(cart).map(function(id) {
    var item = inventory.find(function(i) { return i.id === id; });
    return '- ' + cart[id] + 'x ' + item.name + ' ($' + (item.price * cart[id]) + ')';
  }).join('\n');

  var locationInfo = document.getElementById('contactLocation') ? document.getElementById('contactLocation').value : 'N/A';
  var timeline = document.getElementById('contactTimeline') ? document.getElementById('contactTimeline').value : 'N/A';

  var payload = {
    content: '🚨 **NEW ENGRAVING ORDER REQUEST** 🚨\n\n**From:** ' + name + '\n**Email:** ' + email + '\n**Location:** ' + locationInfo + '\n**Timeline:** ' + timeline + '\n\n**Requested Items:**\n' + orderDetails + '\n\n**Design Notes:**\n' + notes
  };

  var WEBHOOK_URL = '/.netlify/functions/submit-order';

  fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(function(res) {
      if (!res.ok) throw new Error('Network response was not ok');
      status.style.color = 'var(--green)';
      status.textContent = 'Request sent to Jonathan!';
      cart = {}; saveCart(); updateCartBadge(); updateCartUI();
      btn.textContent = 'Order Request Sent';
    })
    .catch(function() {
      status.style.color = 'var(--red)';
      status.textContent = 'Error sending. Please email directly.';
      btn.disabled = false;
      btn.textContent = 'Send Order Request';
    });
});

// ─── EXPORT TO HTML ─────────────────────────────────────────────────────────
window.openGeneralGallery = openGeneralGallery;
window.openCart = openCart;
window.renderLanding = renderLanding;
window.closeLightbox = closeLightbox;
window.lightboxPrev = lightboxPrev;
window.lightboxNext = lightboxNext;
window.closeCartModal = closeCartModal;
window.addToCart = addToCart;

// ─── INIT ────────────────────────────────────────────────────────────────────
renderLanding();
updateCartBadge();
})();
