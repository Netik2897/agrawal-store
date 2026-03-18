
// Configuration
const API_BASE_URL = '/management-portal/api/products/';
const API_CATEGORIES_URL = '/management-portal/api/categories/';
const API_AUTH_URL = '/management-portal/api/';
const API_RATES_URL = '/management-portal/api/rates/';

// Global State
let products = [];
let categories_list = [];
let searchQuery = '';

// Market Rates (Updated via API)
const marketRates = {
    'GOLD_22K': 6850,
    'GOLD_24K': 7350,
    'SILVER': 92,
};
const goldRates = { // For backward compatibility if used elsewhere
    '22k': 6850,
    '24k': 7350,
};

// Map Backend Data to Frontend Format
const mapProductData = (backendProduct) => {
    const weight = parseFloat(backendProduct.weight) || 0;
    const metalType = backendProduct.metal_type || 'FIXED';
    const makingCharges = parseFloat(backendProduct.making_charges) || 0;
    let manualPrice = parseFloat(backendProduct.price) || 0;

    let finalPrice = manualPrice;
    
    // Auto-calculate if price is 0 and metal type is not FIXED
    if (manualPrice === 0 && metalType !== 'FIXED') {
        const rate = marketRates[metalType] || 0;
        finalPrice = (weight * rate) + makingCharges;
        // Add 3% GST for jewelry
        finalPrice = finalPrice * 1.03;
    }

    // Use category-specific fallback if image_url is missing or a local path
    const categorySlug = backendProduct.category_slug || 'others';
    let imgUrl = backendProduct.image_url || '';
    
    // If image_url is missing or just "null", use fallback
    if (!imgUrl || imgUrl === 'null' || imgUrl === '') {
        imgUrl = CATEGORY_FALLBACKS[categorySlug] || CATEGORY_FALLBACKS['default'];
    }
    // If it's a relative path, ensure it doesn't get messed up (request handles it via building absolute URI on server, 
    // but just in case it reaches here as relative, we let it be)
    

    return {
        id: backendProduct.id,
        name: backendProduct.name,
        description: backendProduct.description,
        category: backendProduct.category__name || 'Others',
        category_slug: categorySlug,
        price: finalPrice,
        weight: weight,
        metal_type: metalType,
        making_charges: makingCharges,
        stock: backendProduct.stock,
        available: backendProduct.available,
        image_url: imgUrl,
        featured: backendProduct.is_featured
    };
};

// Category-specific fallback jewelry images from Unsplash (Verified working)
const CATEGORY_FALLBACKS = {
    'rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
    'necklaces': 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=800',
    'bangles': 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&q=80&w=800',
    'coins': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800',
    'silver': 'https://images.unsplash.com/photo-1558235281-c995535543ef?auto=format&fit=crop&q=80&w=800',
    'default': 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80&w=800'
};

const FALLBACK_PRODUCTS = [
    {
        id: 'f1',
        name: 'Antique Gold Necklace',
        description: 'Exquisite 22k gold necklace with traditional design.',
        category: 'Necklaces',
        category_slug: 'necklaces',
        price: 125000,
        stock: 5,
        available: true,
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=1000&auto=format&fit=crop',
        featured: true
    },
    {
        id: 'f2',
        name: 'Diamond Wedding Ring',
        description: 'Solid 24k gold band with centered diamond.',
        category: 'Rings',
        category_slug: 'rings',
        price: 45000,
        stock: 12,
        available: true,
        image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop',
        featured: true
    }
];

// Fetch Products from Backend
async function fetchProducts() {
    try {
        await fetchRates(); // Fetch rates first
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error(`API failed with status ${response.status}`);
        const data = await response.json();
        if (data.length === 0) {
            console.info("Database returned empty products list. Using fallback data for visual experience.");
            products = FALLBACK_PRODUCTS;
        } else {
            products = data.map(mapProductData);
        }
        await fetchCategories();
        renderAll();
        updateRateBarUI();
    } catch (error) {
        console.error('Database connection error:', error);
        const catalogContainer = document.getElementById('catalog-products');
        const featuredContainer = document.getElementById('featured-products');
        
        const errorMsg = `
            <div class="text-center" style="grid-column: 1/-1; padding: 40px; color: #d32f2f; background: rgba(211, 47, 47, 0.05); border: 1px solid rgba(211, 47, 47, 0.2); border-radius: 8px;">
                <i data-lucide="alert-triangle" style="width: 32px; height: 32px; margin-bottom: 10px;"></i>
                <h4 style="margin-bottom: 5px;">Collection Unavailable</h4>
                <p style="font-size: 0.9rem;">We're currently having trouble connecting to our specialized database. Please try refreshing the page or check back later.</p>
                <div style="margin-top: 15px; font-size: 0.75rem; opacity: 0.7; font-family: monospace;">Error: ${error.message}</div>
            </div>
        `;
        
        if (catalogContainer) catalogContainer.innerHTML = errorMsg;
        if (featuredContainer) featuredContainer.innerHTML = errorMsg;
        
        // Fallback to static sample data for visual proof if database is truly down
        products = FALLBACK_PRODUCTS;
        // renderAll(); // We don't call renderAll here because it would overwrite the error message
        if (window.lucide) lucide.createIcons();
    }
}

async function fetchRates() {
    try {
        const response = await fetch(API_RATES_URL);
        if (response.ok) {
            const data = await response.json();
            if (data.GOLD_24K) marketRates['GOLD_24K'] = parseFloat(data.GOLD_24K);
            if (data.GOLD_22K) marketRates['GOLD_22K'] = parseFloat(data.GOLD_22K);
            if (data.SILVER) marketRates['SILVER'] = parseFloat(data.SILVER);
            
            // Sync legacy object
            goldRates['24k'] = marketRates['GOLD_24K'];
            goldRates['22k'] = marketRates['GOLD_22K'];
        }
    } catch (e) {
        console.warn('Could not fetch rates, using defaults');
    }
}

function updateRateBarUI() {
    const rateBar = document.querySelector('.gold-rate-bar');
    if (!rateBar) return;
    
    const container = rateBar.querySelector('.container');
    if (!container) return;

    const silverVal = marketRates['SILVER'] ? `₹${marketRates['SILVER'].toLocaleString('en-IN')}/g` : '₹92/g';

    container.innerHTML = `
        <span><i data-lucide="gem" style="width: 12px; vertical-align: middle; margin-right: 8px; color: var(--gold);"></i> 24k Gold: <span style="color: var(--gold-light);">₹${goldRates['24k'].toLocaleString('en-IN')}/g</span></span>
        <span><i data-lucide="gem" style="width: 12px; vertical-align: middle; margin-right: 8px; color: var(--gold);"></i> 22k Gold: <span style="color: var(--gold-light);">₹${goldRates['22k'].toLocaleString('en-IN')}/g</span></span>
        <span><i data-lucide="sparkles" style="width: 12px; vertical-align: middle; margin-right: 8px; color: #e5e4e2;"></i> Silver: <span style="color: #e5e4e2;">${silverVal}</span></span>
        <span style="opacity: 0.6; font-weight: 300; display: flex; align-items: center;"><i data-lucide="clock" style="width: 12px; margin-right: 8px;"></i> Updated Today</span>
    `;
    if (window.lucide) lucide.createIcons();
}

async function fetchCategories() {
    try {
        const response = await fetch(API_CATEGORIES_URL);
        if (response.ok) {
            categories_list = await response.json();
        } else {
            throw new Error('Category API failed');
        }
    } catch (error) {
        console.warn('Using default categories');
        categories_list = [
            { name: 'Rings', slug: 'rings' },
            { name: 'Necklaces', slug: 'necklaces' },
            { name: 'Coins', slug: 'coins' }
        ];
    }
}

// Format Currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

// Create Product Card HTML
// Create Product Card HTML
const createProductCard = (product, index = 0) => {
    const totalPrice = product.price;

    return `
      <div class="product-card reveal-on-scroll" style="animation-delay: ${index * 0.1}s">
        <div class="product-image">
        <img src="${product.image_url}" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='${CATEGORY_FALLBACKS[product.category_slug] || CATEGORY_FALLBACKS.default}';">
          ${product.stock <= 5 && product.stock > 0 ? '<span class="metal-badge">Limited Edition</span>' : ''}
          ${product.stock === 0 ? '<span class="metal-badge" style="background: var(--text-muted);">Out of Stock</span>' : ''}
          <div class="image-overlay"></div>
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          
          <div class="product-meta">
              <div style="font-size: 0.7rem; color: #999; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.4;">
                ${product.metal_type !== 'FIXED' ? `<span>${product.metal_type.replace('_', ' ')}</span><br>` : ''}
                ${product.weight > 0 ? `<span>Net Wt: ${product.weight}g</span>` : ''}
              </div>
              <div class="text-right">
                  <span class="product-price">${formatCurrency(product.price)}</span>
                  <p class="gst-text" style="font-size: 0.65rem; color: #aaa; margin-top: 2px;">${product.metal_type !== 'FIXED' ? '*Inc. GST & Charges' : 'Flat Price'}</p>
              </div>
          </div>
  
          <div class="product-actions" style="margin-top: 20px; display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
              <button class="btn-cart" onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}')" title="Add to Collection">
                <i data-lucide="shopping-bag" style="width: 18px; color: var(--charcoal);"></i>
              </button>
              <button class="btn-buy premium-glow" onclick="initiatePayment('${product.name.replace(/'/g, "\\'")}', ${totalPrice})">Reserve Piece</button>
          </div>
        </div>
      </div>
    `;
};
 village_id = 0; // Placeholder for any village ID logic if needed

// Toast Notification System
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? 'check-circle' : 'info';
    toast.innerHTML = `<i data-lucide="${icon}" style="width: 18px; color: var(--gold);"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Payment Modal Logic
function initiatePayment(productName, amount) {
    const upiId = "6262527471@ybl";
    const payeeName = "Prem Jewellers";
    const transactionNote = `Payment for ${productName}`;
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&tn=${encodeURIComponent(transactionNote)}&am=${amount}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

    let modal = document.getElementById('payment-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'payment-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal" onclick="closePaymentModal()">&times;</button>
                <h3 style="color: var(--gold); margin-bottom: 15px;">Complete Your Payment</h3>
                <p id="modal-product-name" style="font-weight: bold; margin-bottom: 5px;"></p>
                <p id="modal-amount" style="font-size: 1.5rem; color: var(--charcoal); font-weight: bold;"></p>
                <img id="modal-qr" class="qr-code-img" src="" alt="Payment QR Code">
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">Scan with GPay, PhonePe, or Paytm</p>
                <div class="divider" style="width: 50px; margin: 10px auto;"></div>
                <a id="modal-upi-btn" href="#" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">Open UPI App (Mobile)</a>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closePaymentModal(); });
    }

    document.getElementById('modal-product-name').textContent = productName;
    document.getElementById('modal-amount').textContent = formatCurrency(amount);
    document.getElementById('modal-qr').src = qrUrl;
    document.getElementById('modal-upi-btn').href = upiLink;
    setTimeout(() => { modal.classList.add('modal-active'); }, 10);
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.remove('modal-active');
}

// Mobile Menu Toggle
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const menuBtn = document.querySelector('.mobile-menu-btn i');
    if (!navLinks || !menuBtn) return;

    navLinks.classList.toggle('active');
    
    if (navLinks.classList.contains('active')) {
        menuBtn.setAttribute('data-lucide', 'x');
        document.body.style.overflow = 'hidden';
    } else {
        menuBtn.setAttribute('data-lucide', 'menu');
        document.body.style.overflow = '';
    }
    if (window.lucide) lucide.createIcons();
}

function renderAll() {
    // Featured Section
    const featuredContainer = document.getElementById('featured-products');
    const silverContainer = document.getElementById('silver-products');

    if (featuredContainer) {
        const goldFeatured = products.filter(p => p.featured && p.metal_type.includes('GOLD'));
        featuredContainer.innerHTML = goldFeatured.length > 0
            ? goldFeatured.map((p, i) => createProductCard(p, i)).join('')
            : '<p class="text-center w-full">Coming soon: Our new gold masterpieces.</p>';
    }

    if (silverContainer) {
        const silverProducts = products.filter(p => p.metal_type === 'SILVER' || p.category_slug === 'silver');
        silverContainer.innerHTML = silverProducts.length > 0
            ? silverProducts.map((p, i) => createProductCard(p, i)).join('')
            : '<p class="text-center w-full">Coming soon: Our handcrafted silver collection.</p>';
    }
    
    if (window.lucide) lucide.createIcons();

    // Catalog Section
    const catalogContainer = document.getElementById('catalog-products');
    if (catalogContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('cat');

        // Render Category Filters dynamically
        const filterContainer = document.querySelector('.filters');
        if (filterContainer && categories_list.length > 0) {
            let filterHtml = `<a href="/catalog.html" class="filter-btn ${!category ? 'active' : ''}">All Pieces</a>`;
            categories_list.forEach(cat => {
                const isActive = category === cat.slug || category === cat.name;
                filterHtml += `<a href="/catalog.html?cat=${cat.slug}" class="filter-btn ${isActive ? 'active' : ''}">${cat.name}</a>`;
            });
            filterContainer.innerHTML = filterHtml;
        }

        let displayProducts = products;
        if (category) {
            displayProducts = products.filter(p =>
                p.category_slug === category.toLowerCase() ||
                p.category.toLowerCase() === category.toLowerCase()
            );
            const titleEl = document.getElementById('catalog-title');
            if (titleEl) {
                const catObj = categories_list.find(c => c.slug === category || c.name === category);
                titleEl.textContent = `${catObj ? catObj.name : category} Collection`;
            }
        }

        if (searchQuery) {
            displayProducts = displayProducts.filter(p => 
                p.name.toLowerCase().includes(searchQuery) || 
                p.category.toLowerCase().includes(searchQuery) ||
                p.description.toLowerCase().includes(searchQuery)
            );
            
            const countBadge = document.getElementById('search-count-badge');
            if (countBadge) {
                countBadge.textContent = `${displayProducts.length} items`;
                countBadge.style.display = searchQuery.length > 0 ? 'inline' : 'none';
            }
        } else {
            const countBadge = document.getElementById('search-count-badge');
            if (countBadge) countBadge.style.display = 'none';
        }

        if (displayProducts.length > 0) {
            catalogContainer.innerHTML = displayProducts.map((p, i) => createProductCard(p, i)).join('');
        } else {
            const noResultsMsg = searchQuery 
                ? `No pieces found matching "${searchQuery}".`
                : 'No pieces found in this category.';
            catalogContainer.innerHTML = `<p class="text-center" style="grid-column: 1/-1; padding: 40px; color: #888;">${noResultsMsg}</p>`;
        }
        if (window.lucide) lucide.createIcons();
    }
}

// Search & Suggestions Logic
function initSearch() {
    const searchInput = document.getElementById('catalog-search');
    const suggestionsBox = document.getElementById('search-suggestions');
    if (!searchInput || !suggestionsBox) return;

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        updateSuggestions(searchQuery);
        renderAll();
    });

    searchInput.addEventListener('focus', () => {
        if (searchQuery.length > 0) updateSuggestions(searchQuery);
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.classList.remove('active');
        }
    });
}

function updateSuggestions(query) {
    const suggestionsBox = document.getElementById('search-suggestions');
    if (!query || query.length < 1) {
        suggestionsBox.classList.remove('active');
        return;
    }

    const matches = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length > 0) {
        suggestionsBox.innerHTML = matches.map(p => `
            <div class="suggestion-item" onclick="applySuggestion('${p.name.replace(/'/g, "\\'")}')">
                <i data-lucide="search"></i>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 500;">${p.name}</span>
                    <span style="font-size: 0.7rem; color: #999;">${p.category}</span>
                </div>
                <span class="suggestion-category"><i data-lucide="arrow-up-left" style="width: 12px; opacity: 0.5;"></i></span>
            </div>
        `).join('');
        suggestionsBox.classList.add('active');
        if (window.lucide) lucide.createIcons();
    } else {
        suggestionsBox.classList.remove('active');
    }
}

function applySuggestion(name) {
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) {
        searchInput.value = name;
        searchQuery = name.toLowerCase();
        renderAll();
    }
    document.getElementById('search-suggestions').classList.remove('active');
}

// Side Cart Logic
let cart = [];

function toggleCart() {
    let sideCart = document.getElementById('side-cart');
    if (!sideCart) {
        sideCart = document.createElement('div');
        sideCart.id = 'side-cart';
        sideCart.className = 'side-cart';
        sideCart.innerHTML = `
            <div class="cart-header">
                <h3>Your Collection</h3>
                <button class="close-cart" onclick="toggleCart()">&times;</button>
            </div>
            <div id="cart-items" class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Subtotal</span>
                    <span id="cart-total-amount">₹0</span>
                </div>
                <button class="btn btn-primary" style="width: 100%; border-radius: 0;" onclick="checkout()">Proceed to Reserve</button>
            </div>
        `;
        document.body.appendChild(sideCart);
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.id = 'cart-overlay';
        overlay.className = 'modal-overlay';
        overlay.onclick = toggleCart;
        document.body.appendChild(overlay);
    }

    const isActive = sideCart.classList.toggle('active');
    document.getElementById('cart-overlay').classList.toggle('modal-active', isActive);
    if (isActive) renderCart();
}

function addToCart(productId, productName) {
    const product = products.find(p => p.id == productId) || FALLBACK_PRODUCTS.find(p => p.id == productId);
    if (product) {
        const existing = cart.find(item => item.id == productId);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        showToast(`${productName} added to collection`);
    }
}

function updateCartCount() {
    localStorage.setItem('prem_jewellers_cart', JSON.stringify(cart));
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        countEl.textContent = total;
        countEl.style.transform = 'scale(1.3)';
        setTimeout(() => countEl.style.transform = 'scale(1)', 200);
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalAmountEl = document.getElementById('cart-total-amount');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: #888;">Your collection is empty.</div>';
        totalAmountEl.textContent = '₹0';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatCurrency(item.price)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQty('${item.id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQty('${item.id}', 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="updateQty('${item.id}', -${item.quantity})">&times;</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmountEl.textContent = formatCurrency(total);
}

function updateQty(id, delta) {
    const itemIdx = cart.findIndex(item => item.id == id);
    if (itemIdx > -1) {
        cart[itemIdx].quantity += delta;
        if (cart[itemIdx].quantity <= 0) {
            cart.splice(itemIdx, 1);
        }
        updateCartCount();
        renderCart();
    }
}

function checkout() {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const names = cart.map(item => item.name).join(', ');
    initiatePayment(names, total);
}



// Close menu when clicking links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });
});
// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    initSearch();
    
    // Restore Cart
    const savedCart = localStorage.getItem('prem_jewellers_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
    
    // Navbar & Back to Top Scroll Effect
    const navbar = document.querySelector('.navbar');
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // Reveal on Scroll Initialization
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    // We observe both existing and dynamically added elements
    const observeElements = () => {
        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            revealObserver.observe(el);
        });
    };

    observeElements();
    
    // Create a MutationObserver to watch for newly added products
    const dynamicObserver = new MutationObserver(() => {
        observeElements();
    });
    
    const containers = ['featured-products', 'silver-products', 'catalog-products'];
    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) dynamicObserver.observe(el, { childList: true });
    });
});

// --- Authentication Logic ---

async function checkAuthStatus() {
    const loader = document.getElementById('auth-loading');
    const authForms = document.getElementById('auth-forms');
    const dashboard = document.getElementById('profile-dashboard');
    
    if (!loader) return; // Not on account page

    try {
        const response = await fetch(API_AUTH_URL + 'profile/');
        if (response.ok) {
            const data = await response.json();
            showDashboard(data.user);
        } else {
            showAuthForms();
        }
    } catch (error) {
        showAuthForms();
    }
}

function showDashboard(user) {
    document.getElementById('auth-loading').style.display = 'none';
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('profile-dashboard').style.display = 'block';
    document.getElementById('user-display-name').textContent = user.name;
    document.getElementById('user-display-email').textContent = user.email;
}

function showAuthForms() {
    document.getElementById('auth-loading').style.display = 'none';
    document.getElementById('auth-forms').style.display = 'block';
    document.getElementById('profile-dashboard').style.display = 'none';
}

function toggleAuthView(view) {
    if (view === 'register') {
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('register-view').style.display = 'block';
    } else {
        document.getElementById('login-view').style.display = 'block';
        document.getElementById('register-view').style.display = 'none';
    }
}

async function handleLogout() {
    try {
        await fetch(API_AUTH_URL + 'logout/');
        window.location.reload();
    } catch (e) {
        window.location.reload();
    }
}

// Event Listeners for Forms
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const response = await fetch(API_AUTH_URL + 'login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    showDashboard(data.user);
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (err) {
                alert('Connection error');
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            try {
                const response = await fetch(API_AUTH_URL + 'register/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Account created! Sign in now.');
                    toggleAuthView('login');
                } else {
                    alert(data.message || 'Registration failed');
                }
            } catch (err) {
                alert('Connection error');
            }
        });
    }

    checkAuthStatus();
});


// Close menu when clicking links
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
        const menuIcon = document.querySelector('.mobile-menu-btn i');
        menuIcon.setAttribute('data-lucide', 'menu');
        lucide.createIcons();
    });
});
