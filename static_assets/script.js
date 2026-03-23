
console.log("PREM JEWELLERS SCRIPT V5.5 - FINAL FIX");

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
    } catch (e) { console.error("API error"); renderAll(); }
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
    console.log("Toggle Clicked");
    const nav = document.querySelector('.nav-links');
    if (!nav) return;
    
    nav.classList.toggle('active');
    const isActive = nav.classList.contains('active');
    
    // Icon toggle (Safe)
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
    console.log("Applying highlight to:", path);
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        let href = link.getAttribute('href').toLowerCase().replace(/\/$/, "");
        if (href === "") href = "/";
        
        // Remove active initially
        link.classList.remove('active');
        
        const isHompage = (path === "/" || path === "/index.html");
        const isLinkHome = (href === "/" || href === "/index.html");
        
        if (isHompage && isLinkHome) {
            link.classList.add('active');
        } else if (href !== "/" && href !== "/index.html" && (path === href || path.includes(href))) {
            link.classList.add('active');
        }
    });
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
});


function showToast(message, type=\'success\') { 
    let container = document.getElementById(\'toast-container\');
    if (!container) {
        container = document.createElement(\'div\');
        container.id = \'toast-container\';
        container.style.cssText = \'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 10px;\';
        document.body.appendChild(container);
    }
    const toast = document.createElement(\'div\');
    toast.style.cssText = ackground: ; color: white; padding: 12px 24px; border-radius: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: var(--font-sans, sans-serif); transform: translateY(100%); opacity: 0; transition: all 0.3s ease;;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => { toast.style.transform = \'translateY(0)\'; toast.style.opacity = \'1\'; }, 10);
    
    setTimeout(() => {
        toast.style.transform = \'translateY(100%)\';
        toast.style.opacity = \'0\';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}


function toggleCart() { showToast(\'Shopping cart functionality is coming soon!\', \'info\'); }
function toggleAuthView(viewName) { showToast(\'Authentication functionality is coming soon!\', \'info\'); }
function handleLogout() { showToast(\'Logout functionality coming soon!\', \'info\'); }
