
console.log("PREM JEWELLERS SCRIPT V7.0 - STABLE");

// Configuration
const API_BASE_URL = '/management-portal/api/products/';
const API_CATEGORIES_URL = '/management-portal/api/categories/';
const API_AUTH_URL = '/management-portal/api/';
const API_RATES_URL = '/management-portal/api/rates/';

// Global State
let products = [];
let marketRates = { 'GOLD_22K': 6850, 'GOLD_24K': 7350, 'SILVER': 92 };

const mapProductData = (p) => {
    const w = parseFloat(p.weight) || 0;
    const m = p.metal_type || 'FIXED';
    const c = parseFloat(p.making_charges) || 0;
    let price = parseFloat(p.price) || 0;
    if (price === 0 && m !== 'FIXED') {
        const rate = marketRates[m] || 0;
        price = (w * rate + c) * 1.03;
    }
    return { ...p, price, category_slug: p.category_slug || 'others' };
};

async function fetchProducts() {
    try {
        const res = await fetch(API_BASE_URL);
        const data = await res.json();
        products = data.length > 0 ? data.map(mapProductData) : [];
        renderAll();
    } catch (e) { console.error("API error", e); renderAll(); }
}

async function fetchRates() {
    try {
        const res = await fetch(API_RATES_URL);
        if (res.ok) Object.assign(marketRates, await res.json());
    } catch (e) {}
}

const formatCurrency = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function createProductCard(p, i) {
    return `
        <div class="product-card reveal-on-scroll" style="animation-delay:${i*0.1}s">
            <div class="product-image"><img src="${p.image_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=800'}" loading="lazy"></div>
            <div class="product-info">
                <h3 class="product-title">${p.name}</h3>
                <p class="product-price">${formatCurrency(p.price)}</p>
                <button class="btn-buy" onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.price})">Add to Cart</button>
            </div>
        </div>
    `;
}

function renderAll() {
    const feat = document.getElementById('featured-products');
    if (feat) {
        const featuredProducts = products.filter(p=>p.is_featured).slice(0,4);
        feat.innerHTML = featuredProducts.length > 0 ? featuredProducts.map((p,i)=>createProductCard(p,i)).join('') : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No featured products available.</p>';
    }

    const silver = document.getElementById('silver-products');
    if (silver) {
        const silverProducts = products.filter(p=>p.category_slug==='silver' || p.metal_type==='SILVER').slice(0,4);
        silver.innerHTML = silverProducts.length > 0 ? silverProducts.map((p,i)=>createProductCard(p,i)).join('') : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No silver products available.</p>';
    }
    
    const cat = document.getElementById('catalog-products');
    if (cat) {
        const query = new URLSearchParams(window.location.search).get('cat');
        let displayed = products;
        if (query) displayed = products.filter(p=>p.category_slug===query.toLowerCase() || p.metal_type===query.toUpperCase());
        cat.innerHTML = displayed.length > 0 ? displayed.map((p,i)=>createProductCard(p,i)).join('') : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No products found in this category.</p>';
    }
    if (window.lucide) lucide.createIcons();
}

function toggleMenu() {
    const nav = document.querySelector('.nav-links');
    if (!nav) return;
    
    nav.classList.toggle('active');
    const isActive = nav.classList.contains('active');
    
    const btn = document.querySelector('.mobile-menu-btn');
    if (btn) {
        btn.innerHTML = isActive ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    }
    
    document.body.style.overflow = isActive ? 'hidden' : '';
    if (window.lucide) lucide.createIcons();
}

function highlightActivePage() {
    let path = window.location.pathname.toLowerCase().replace(/\/$/, "");
    if (path === "") path = "/";
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        let href = link.getAttribute('href').toLowerCase().replace(/\/$/, "");
        if (href === "") href = "/";
        
        link.classList.remove('active');
        
        const isHomepage = (path === "/" || path === "/index.html");
        const isLinkHome = (href === "/" || href === "/index.html");
        
        if (isHomepage && isLinkHome) {
            link.classList.add('active');
        } else if (href !== "/" && href !== "/index.html" && (path === href || path.includes(href))) {
            link.classList.add('active');
        }
    });
}

function showToast(message, type='success') { 
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'var(--gold-dark, #bd9a3b)' : (type === 'info' ? '#333' : '#e53e3e');
    toast.style.cssText = `background: ${bg}; color: white; padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: var(--font-sans, sans-serif); transform: translateY(100%); opacity: 0; transition: all 0.3s ease;`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; }, 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

let cart = JSON.parse(localStorage.getItem('user_cart')) || [];
let whatsappUser = JSON.parse(localStorage.getItem('whatsapp_user')) || null;

function saveCart() {   
    localStorage.setItem('user_cart', JSON.stringify(cart)); 
    updateCartBadge(); 
}

function updateCartBadge() {
    document.querySelectorAll('.cart-badge').forEach(badge => {
        let count = cart.reduce((tot, item) => tot + item.quantity, 0);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-flex' : 'none';
        
        // Also add badge class styling dynamically if needed
        badge.style.position = 'absolute';
        badge.style.top = '-5px';
        badge.style.right = '-8px';
        badge.style.background = '#e53e3e';
        badge.style.color = 'white';
        badge.style.fontSize = '12px';
        badge.style.width = '18px';
        badge.style.height = '18px';
        badge.style.borderRadius = '50%';
        badge.style.justifyContent = 'center';
        badge.style.alignItems = 'center';
    });
}

function renderCartModal() {
    const cartItems = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total-price');
    if (!cartItems || !cartTotal) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center; padding: 20px; color:#777;">Your cart is empty.</p>';
        cartTotal.textContent = '₹0';
        return;
    }

    let total = 0;
    cartItems.innerHTML = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding: 10px 0;">
                <div>
                    <h4 style="margin:0; font-size:14px; color:#333;">${item.name}</h4>
                    <p style="margin:0; font-size:12px; color:#777;">${formatCurrency(item.price)} x ${item.quantity}</p>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <button onclick="changeCartQuantity(${index}, -1)" style="padding: 2px 8px; border-radius: 4px; border: 1px solid #ccc; background: white; cursor:pointer;">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeCartQuantity(${index}, 1)" style="padding: 2px 8px; border-radius: 4px; border: 1px solid #ccc; background: white; cursor:pointer;">+</button>
                    <button onclick="removeFromCart(${index})" style="color:red; background:none; border:none; padding:5px; margin-left:10px; cursor:pointer;"><i data-lucide="trash-2" style="width:16px; height:16px;"></i>🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = formatCurrency(total);
}

function changeCartQuantity(index, delta) {
    if(cart[index].quantity + delta > 0) {
        cart[index].quantity += delta;
    } else {
        cart.splice(index, 1);
    }
    saveCart();
    renderCartModal();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCartModal();
}

function toggleCart() { 
    const modal = document.getElementById('cart-modal');
    if (!modal) {
        showToast('Cart UI not added to this page yet!', 'info');
        return;
    }
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        renderCartModal();
        modal.style.display = 'flex';
    }
}

// Global for holding item until user logs in
let pendingCartItem = null;

function addToCart(productId, name, price) {
    if (!whatsappUser) {
        pendingCartItem = { id: productId, name: name, price: price };
        const modal = document.getElementById('whatsapp-login-modal');
        if (modal) {
            modal.style.display = 'flex';
        } else {
            showToast('Login UI missing!', 'error');
        }
        return;
    }
    
    // Add logic
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: productId, name: name, price: price, quantity: 1 });
    
    saveCart();
    showToast(name + ' added to cart!', 'success');
}

async function handleWhatsAppLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('quick-login-btn');
    const name = document.getElementById('quick-name').value;
    const phone = document.getElementById('quick-phone').value;
    
    if (phone.length < 10) {
        showToast("Please enter a valid 10-digit number", "error");
        return;
    }

    const originalText = btn.textContent;
    btn.textContent = 'Verifying...';
    try {
        const res = await fetch('/management-portal/api/quick-login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, phone: phone })
        });
        const data = await res.json();
        
        if (res.ok) {
            whatsappUser = data.user;
            localStorage.setItem('whatsapp_user', JSON.stringify(whatsappUser));
            document.getElementById('whatsapp-login-modal').style.display = 'none';
            showToast('Verified! Welcome ' + data.user.name, 'success');
            
            if (pendingCartItem) {
                addToCart(pendingCartItem.id, pendingCartItem.name, pendingCartItem.price);
                pendingCartItem = null;
            }
        } else {
            showToast(data.message || "Failed to verified", 'error');
        }
    } catch (e) {
        showToast('Connection error. Please try again.', 'error');
    }
    btn.textContent = originalText;
}

function closeWhatsAppModal() {
    document.getElementById('whatsapp-login-modal').style.display = 'none';
    pendingCartItem = null;
}

function checkoutCart() {
    if (cart.length === 0) {
        showToast("Your cart is empty!", "info");
        return;
    }
    if (!whatsappUser) {
        toggleCart(); // Close cart
        document.getElementById('whatsapp-login-modal').style.display = 'flex';
        return;
    }
    
    let text = `*New Order Request*\n\n`;
    let total = 0;
    cart.forEach(item => {
        text += `- ${item.name} (Qty: ${item.quantity}) = ₹${item.price * item.quantity}\n`;
        total += item.price * item.quantity;
    });
    text += `\n*Total Estimated Amount: ₹${total}*\n\n`;
    text += `Customer Name: ${whatsappUser.name}\n`;
    text += `Customer Mobile: ${whatsappUser.phone}`;
    
    const storeNumber = "919407078261"; // Admin's WhatsApp
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${storeNumber}?text=${encodedText}`, '_blank');
    
    // Clear cart after sending to whatsapp
    cart = [];
    saveCart();
    toggleCart();
    showToast("Opening WhatsApp to complete order!", "success");
}

function toggleAuthView(viewName) {
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    if(loginView && registerView) {
        if(viewName === 'login') {
            loginView.style.display = 'block';
            registerView.style.display = 'none';
        } else {
            loginView.style.display = 'none';
            registerView.style.display = 'block';
        }
    } else {
        showToast('Authentication functionality is coming soon!', 'info');
    }
}

async function handleLogout() {
    try {
        await fetch('/management-portal/api/logout/', {method: 'POST'});
        showToast('Successfully logged out.', 'success');
        setTimeout(() => window.location.reload(), 1000);
    } catch(e) { console.error("Logout error", e); }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchRates().then(fetchProducts);
    highlightActivePage();
    
    const nav = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    });

    document.querySelectorAll('.nav-links a').forEach(a => {
        a.addEventListener('click', () => {
            const nl = document.querySelector('.nav-links');
            if (nl && nl.classList.contains('active')) toggleMenu();
        });
    });

    const obs = new IntersectionObserver((es) => {
        es.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
    }, { threshold: 0.1 });
    
    const observe = () => document.querySelectorAll('.reveal-on-scroll').forEach(el => obs.observe(el));
    observe();
    new MutationObserver(observe).observe(document.body, { childList: true, subtree: true });

    // Auth Page Logic
    const authLoading = document.getElementById('auth-loading');
    const authForms = document.getElementById('auth-forms');
    const profileDashboard = document.getElementById('profile-dashboard');
    
    if (authLoading) {
        fetch('/management-portal/api/profile/')
            .then(res => {
                if (res.ok) {
                    authLoading.style.display = 'none';
                    if(profileDashboard) profileDashboard.style.display = 'block';
                    else {
                        authLoading.parentElement.innerHTML = `<div class='text-center'><h2 class='gold-text'>Welcome back!</h2><p>You are logged into the secure portal.</p><br><button onclick='handleLogout()' class='btn btn-outline'>Sign Out</button></div>`;
                    }
                } else {
                    authLoading.style.display = 'none';
                    if(authForms) authForms.style.display = 'block';
                }
            })
            .catch(() => {
                authLoading.style.display = 'none';
                if(authForms) authForms.style.display = 'block';
            });
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button'); btn.textContent = 'Authenticating...';
            try {
                const res = await fetch('/management-portal/api/login/', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        email: document.getElementById('login-email').value,
                        password: document.getElementById('login-password').value
                    })
                });
                const data = await res.json();
                if(res.ok) { showToast('Login successful!'); setTimeout(() => window.location.reload(), 1000); }
                else throw new Error(data.message || 'Login failed');
            } catch(error) { showToast(error.message, 'info'); btn.textContent = 'Access Collection'; }
        });
    }

    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = regForm.querySelector('button'); btn.textContent = 'Registering...';
            try {
                const res = await fetch('/management-portal/api/register/', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        name: document.getElementById('reg-name').value,
                        email: document.getElementById('reg-email').value,
                        password: document.getElementById('reg-password').value
                    })
                });
                const data = await res.json();
                if(res.ok) { showToast('Account created!'); setTimeout(() => window.location.reload(), 1000); }
                else throw new Error(data.message || 'Registration failed');
            } catch(error) { showToast(error.message, 'info'); btn.textContent = 'Begin Journey'; }
        });
    }
});
