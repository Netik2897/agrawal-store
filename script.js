
// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/management-portal/api/products/';
const API_CATEGORIES_URL = 'http://127.0.0.1:8000/management-portal/api/categories/';
const API_AUTH_URL = 'http://127.0.0.1:8000/management-portal/api/';

// Global State
let products = [];
let categories_list = [];

// Gold Rates (static for now, can be moved to backend too)
const goldRates = {
    '22k': 6850, // Per gram
    '24k': 7350, // Per gram
};

// Map Backend Data to Frontend Format
const mapProductData = (backendProduct) => {
    return {
        id: backendProduct.id,
        name: backendProduct.name,
        description: backendProduct.description,
        category: backendProduct.category__name || 'Others',
        category_slug: backendProduct.category_slug || 'others',
        price: parseFloat(backendProduct.price),
        stock: backendProduct.stock,
        available: backendProduct.available,
        // Using sample images if backend doesn't provide them yet
        image_url: backendProduct.image_url || 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1000&auto=format&fit=crop',
        weight_grams: 10, // Default for now
        purity: '22k',    // Default for now
        making_charges: 12, // Default for now
        featured: backendProduct.is_featured
    };
};

// Sample products for fallback when API is down
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
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('API connection failed');
        const data = await response.json();
        products = data.map(mapProductData);
        await fetchCategories();
        renderAll();
    } catch (error) {
        console.warn('API is not available. Using sample data for development.', error);
        products = FALLBACK_PRODUCTS;
        renderAll();
    }
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
const createProductCard = (product) => {
    // If backend provides a fixed price, we use it directly
    const totalPrice = product.price;

    return `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.image_url}" alt="${product.name}">
          ${product.stock <= 5 ? '<span class="badge badge-red">Few Left</span>' : ''}
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <h3 class="product-title">${product.name}</h3>
          <p style="font-size: 0.8rem; color: #666; margin-bottom: 10px; height: 3em; overflow: hidden;">${product.description}</p>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #eee; padding-top: 10px;">
              <span style="font-size: 0.8rem; color: #888;">Stock: ${product.stock}</span>
              <div class="text-right">
                  <span class="product-price">${formatCurrency(totalPrice)}</span>
                  <span class="gst-text">(Incl. GST)</span>
              </div>
          </div>
  
          <div class="product-actions">
              <button class="btn-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
              <button class="btn-buy" onclick="initiatePayment('${product.name}', ${totalPrice})">Buy Now</button>
          </div>
        </div>
      </div>
    `;
};

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
    const navIcons = document.querySelector('.nav-icons');
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
        navIcons.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '60px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.backgroundColor = 'white';
        navLinks.style.padding = '20px';
        navLinks.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
        navIcons.style.display = 'flex';
        navIcons.style.justifyContent = 'center';
        navIcons.style.marginTop = '20px';
    }
}

function addToCart(productId) {
    alert('Product added to cart!');
}

// Global Render Function
function renderAll() {
    const featuredContainer = document.getElementById('featured-products');
    if (featuredContainer) {
        const featuredProducts = products.filter(p => p.featured);
        featuredContainer.innerHTML = featuredProducts.length > 0
            ? featuredProducts.map(createProductCard).join('')
            : '<p class="text-center w-full">No featured products yet.</p>';
        if (window.lucide) lucide.createIcons();
    }

    const catalogContainer = document.getElementById('catalog-products');
    if (catalogContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('cat');

        // Render Category Filters dynamically if the element exists
        const filterContainer = document.querySelector('.filters');
        if (filterContainer && categories_list.length > 0) {
            let filterHtml = `<a href="catalog.html" class="filter-btn ${!category ? 'active' : ''}">All Pieces</a>`;
            categories_list.forEach(cat => {
                const isActive = category === cat.slug || category === cat.name;
                filterHtml += `<a href="catalog.html?cat=${cat.slug}" class="filter-btn ${isActive ? 'active' : ''}">${cat.name}</a>`;
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
                // Find category name from list or use the param
                const catObj = categories_list.find(c => c.slug === category || c.name === category);
                titleEl.textContent = `${catObj ? catObj.name : category} Collection`;
            }
        }
        if (displayProducts.length > 0) {
            catalogContainer.innerHTML = displayProducts.map(createProductCard).join('');
        } else {
            catalogContainer.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No products found in this category.</p>';
        }
        if (window.lucide) lucide.createIcons();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
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
