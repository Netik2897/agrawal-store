import os
import re

html_files = ["index.html", "about.html", "catalog.html", "contact.html"]
css_file = "static_assets/styles.css" if os.path.exists("static_assets/styles.css") else "styles.css"

replacements = {
    # Brand Names
    "Prem Jewellers": "Agrawal Clothing",
    "Prem<span class=\"gold-text\">Jewellers</span>": "Agrawal<span class=\"gold-text\">Clothing</span>",
    "Prem": "Agrawal", # fallback
    "netik2897@gmail.com": "netik2897@gmail.com", # keep
    
    # Meta / Titles
    "100% Hallmark Gold & Silver Jewelry": "Premium Menswear & Womenswear",
    "Gold & Silver Specialist": "Luxury Fashion Destination",
    "100% Hallmark Gold & Silver": "Premium Menswear & Womenswear",
    "Gold & Silver": "Apparel & Accessories",
    "gold and silver": "clothing and accessories",
    
    # Hero Texts
    "Timeless</span> Elegance": "Premium</span> Fashion",
    "Crafting new traditions with purity in every masterpiece of gold & silver.": "Crafting modern elegance with premium fabrics and impeccable tailoring in every garment.",
    "A Legacy of <span class=\"gold-text\">Purity</span>": "A Legacy of <span class=\"gold-text\">Style</span>",
    "At Prem Jewellers, every curve is contemplated, and every stone is selected with supreme care. Our master artisans in Ladkui blend centuries-old techniques with modern design to create jewelry that isn't just worn—it's experienced.": "At Agrawal Clothing, every stitch is contemplated, and every fabric selected with supreme care. Our master tailors bring you the finest in modern fashion that ensures you don't just wear an outfit—you make a statement.",
    "100% Hallmark": "Premium Fabric",
    "BIS certified gold ensuring maximum resale value.": "Finest cotton and silks ensuring maximum comfort.",
    
    # Features
    "BIS Hallmarked Purity": "Premium Fabric Quality",
    "Prem Gold Shop: Ladkui": "Agrawal Clothing: Ladkui",
    "Gold Shop Nasrullaganj": "Clothing Shop Nasrullaganj",
    "Jewelry Store Sehore": "Fashion Store Sehore",
    "22k Gold Price Ladkui": "Mens Wear Ladkui",
    
    # Hero Images (unplash fashion)
    "{% static 'gold_necklace.png' %}": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop",
    "{% static 'craftsmanship.png' %}": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop",
    "{% static 'silver_set.png' %}": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    "{% static 'gold_bangles.png' %}": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2000&auto=format&fit=crop",
    
    # Small texts
    "The <span style=\"color: #7f8c8d;\">Silver</span> Atelier": "The <span style=\"color: #7f8c8d;\">Casual</span> Collection",
    "Handcrafted Ornaments": "Everyday Essentials",
    "Fetching handcrafted silver pieces...": "Loading our casual wear line...",
    "Curating our latest collection from the database...": "Loading the latest season's catalog...",
    "jewelry": "clothing",
    "jewelers": "outfitters",
    "ornaments": "apparels",
    
    # Top Bar Replace
    "24k Gold:": "Suits:",
    "22k Gold:": "Shirts:",
    "Silver:": "Jeans:",
    "₹7,350/g": "₹4,999",
    "₹6,850/g": "₹1,499",
    "₹92/g": "₹1,299",
    "Updated Today": "Fresh Stock",
    
    # Categories / Search
    "Search for rings, necklaces, or coins...": "Search for shirts, jeans, or kurtas...",
    "Rings": "Shirts",
    "Necklaces": "T-Shirts",
    "Coins": "Jeans",
    "Bangles": "Ethnic",
    "Silver": "Winter",
}

for html_file in html_files:
    if os.path.exists(html_file):
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for k, v in replacements.items():
            content = content.replace(k, v)
            
        content = content.replace('data-lucide="gem"', 'data-lucide="shirt"')
        content = content.replace('https://img.icons8.com/color/48/000000/jewelry.png', 'https://img.icons8.com/color/48/000000/t-shirt.png')
            
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)

if os.path.exists(css_file):
    with open(css_file, 'r', encoding='utf-8') as f:
        css = f.read()
    
    # Change color tokens in styles.css
    # --gold: #d4af37 -> #C19A6B (Camel/Beige)
    # --gold-light: #f1c40f -> #D4B895
    # --gold-dark: #9a7b2c -> #8B693A
    # --gold-extra-light: #fdf5e6 -> #F5F0EA
    css = css.replace('--gold: #d4af37;', '--gold: #C19A6B;')
    css = css.replace('--gold-light: #f1c40f;', '--gold-light: #D4B895;')
    css = css.replace('--gold-dark: #9a7b2c;', '--gold-dark: #8B693A;')
    css = css.replace('--gold-extra-light: #fdf5e6;', '--gold-extra-light: #F5F0EA;')
    
    with open(css_file, 'w', encoding='utf-8') as f:
        f.write(css)

print("Conversion complete!")
