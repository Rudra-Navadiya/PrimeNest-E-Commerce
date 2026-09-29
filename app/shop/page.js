
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load products from PostgreSQL API
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid product data received.");
        }

        setProducts(data.products);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Get available categories from database products
  const categories = useMemo(() => {
    const names = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["All", ...new Set(names)];
  }, [products]);

  // Search, filter, and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "All") {
      result = result.filter(
        (product) => product.category === category
      );
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();

      result = result.filter((product) =>
        [
          product.name,
          product.category,
          product.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(term)
          )
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    } else if (sort === "price-high") {
      result.sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    } else if (sort === "name") {
      result.sort((a, b) =>
        String(a.name).localeCompare(String(b.name))
      );
    }

    return result;
  }, [products, category, search, sort]);

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  return (
    <>
      <Navbar />

      <main className="shop-page">
        <section className="shop-heading">
          <p className="shop-eyebrow">
            PRIMENEST / THE COLLECTION
          </p>
          <h1>Discover the Collection</h1>
          <p className="shop-intro">
            Thoughtfully selected essentials for everyday
            living, designed with simplicity and style.
          </p>
        </section>

        <section className="shop-controls">
          <div className="shop-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
          </div>

          <div className="shop-sort">
            <label htmlFor="shop-sort-select">SORT BY</label>
            <select
              id="shop-sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </section>

        <section className="shop-catalog">
          <aside className="shop-sidebar">
            <p className="shop-filter-title">CATEGORIES</p>

            <div className="shop-category-list">
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={
                    category === name
                      ? "shop-category active"
                      : "shop-category"
                  }
                  onClick={() => setCategory(name)}
                >
                  {name}
                  <span>
                    {name === "All"
                      ? products.length
                      : products.filter(
                          (product) => product.category === name
                        ).length}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className="shop-results">
            <div className="shop-results-heading">
              <p>
                {category === "All" ? "ALL PRODUCTS" : category.toUpperCase()}
              </p>
              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "ITEM" : "ITEMS"}
              </span>
            </div>

            {loading ? (
              <div className="shop-message">
                Loading collection...
              </div>
            ) : error ? (
              <div className="shop-message shop-error">
                <h2>Unable to load the collection</h2>
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="shop-message">
                <h2>No products found</h2>
                <p>Try another search or category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setSort("featured");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="shop-product-grid">
                {filteredProducts.map((product) => (
                  <Link
                    href={`/product/${product.id}`}
                    className="shop-product-card"
                    key={product.id}
                  >
                    <div className="shop-product-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="shop-image-placeholder">
                          PRIMENEST
                        </div>
                      )}

                      <span className="shop-view-product">
                        VIEW PRODUCT ↗
                      </span>
                    </div>

                    <div className="shop-product-info">
                      <p className="shop-product-category">
                        {product.category}
                      </p>
                      <h2>{product.name}</h2>
                      <p className="shop-product-price">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}