
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
                <button class="btn-buy" onclick="alert('Reserving ${p.name}')">Reserve Now</button>
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

function toggleCart() { showToast('Shopping cart functionality is coming soon!', 'info'); }

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
