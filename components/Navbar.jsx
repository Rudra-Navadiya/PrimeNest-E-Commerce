"use client";

import { useState } from "react";


export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState(null);

  const categories = {
    MEN: ["Casual Shirts", "Sweatshirts", "Jackets"],
    WOMEN: ["Dresses", "Tops", "T-Shirts", "Jeans"],
    ACCESSORIES: ["Watches", "Bags", "Sunglasses"],
    HOME: ["Home Decor", "Home Essentials"],
    PERFUME: ["Men's Perfume", "Women's Perfume"],
  };

  return (
    <nav
      className="navbar"
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="nav-links">
        <a href="/">HOME</a>
        <a href="/shop">SHOP</a>

        {Object.entries(categories).map(([category, subcategories]) => (
          <div
            className="nav-item"
            key={category}
            onMouseEnter={() => setActiveMenu(category)}
          >
            <button
              className={`nav-button ${
                activeMenu === category ? "active" : ""
              }`}
              aria-expanded={activeMenu === category}
              onFocus={() => setActiveMenu(category)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setActiveMenu(null);
              }}
            >
              {category}
            </button>

            {activeMenu === category && (
              <div className="dropdown">
                {/* <div className="dropdown-heading">
                  <span>EXPLORE {category}</span>
                </div> */}

                {subcategories.map((subcategory) => (
                  <a
                    href={`/shop?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`}
                    className="dropdown-link"
                    key={subcategory}
                  >
                    <span>{subcategory}</span>
                    
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}