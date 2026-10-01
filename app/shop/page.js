
"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();

  // Read category and subcategory from navbar URL
      
    useEffect(() => {
      const urlCategory = searchParams.get("category");
      const urlSubcategory = searchParams.get("subcategory");

      setCategory(
        urlCategory ? urlCategory.toLowerCase() : "All"
      );
      setSubcategory(urlSubcategory || "");
    }, [searchParams]);

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

  
// Load categories from PostgreSQL API
useEffect(() => {
  async function loadCategories() {
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Unable to load categories");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setCategoryList(data);
      }
    } catch (error) {
      console.error("Category loading error:", error);
    }
  }

  loadCategories();
}, []);

  // Available main categories from database
  
    const categories = useMemo(() => {
      return categoryList.map((item) => ({
        name: item.name,
        slug: item.slug,
      }));
    }, [categoryList]);

  const categoryLabel =
  category === "All"
    ? "All"
    : categoryList.find(
        (item) => item.slug === category
      )?.name || category;

const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  // Filter, search and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Main category filter
    if (category !== "All") {
  result = result.filter(
    (product) => toSlug(product.category) === category
  );
}

    // Subcategory filter from mega menu
    if (subcategory) {
  result = result.filter(
    (product) =>
      String(product.subcategory || "")
        .trim()
        .toLowerCase() ===
      subcategory.trim().toLowerCase()
  );
}

    // Product search
    if (search.trim()) {
      const term = search.trim().toLowerCase();

      result = result.filter((product) =>
        [
          product.name,
          product.category,
          product.subcategory,
          product.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(term)
          )
      );
    }

    // Sorting
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
  }, [products, category, subcategory, search, sort]);

  // Format Indian rupee prices
  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Clear category and subcategory filters
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSubcategory("");
    setSort("featured");

    window.history.replaceState(
      {},
      "",
      window.location.pathname
    );
  };

  return (
    <>
      <Navbar />

      <main className="shop-page">
        {/* Shop heading */}
        <section className="shop-heading">
          <p className="shop-eyebrow">
            PRIMENEST / THE COLLECTION
          </p>

          <h1>
            {subcategory
              ? subcategory
              : category !== "All"
                ? category
                : "Discover the Collection"}
          </h1>

          <p className="shop-intro">
            {subcategory
              ? `Explore our ${subcategory.toLowerCase()} collection, thoughtfully selected for everyday style.`
              : category !== "All"
                ? `Discover the ${category} collection at PrimeNest.`
                : "Thoughtfully selected essentials for everyday living, designed with simplicity and style."}
          </p>
        </section>

        {/* Search and sorting */}
        <section className="shop-controls">
          <div className="shop-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              aria-label="Search products"
            />
          </div>

          <div className="shop-sort">
            <label htmlFor="shop-sort-select">
              SORT BY
            </label>

            <select
              id="shop-sort-select"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              <option value="featured">Featured</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </section>

        {/* Product catalog */}
        <section className="shop-catalog">
          <aside className="shop-sidebar">
            <p className="shop-filter-title">
              CATEGORIES
            </p>

            
          <div className="shop-category-list">
            {/* All products */}
            <button
              type="button"
              className={
                category === "All" && !subcategory
                  ? "shop-category active"
                  : "shop-category"
              }
              onClick={() => {
                setCategory("All");
                setSubcategory("");
                window.history.replaceState(
                  {},
                  "",
                  window.location.pathname
                );
              }}
            >
              All
              <span>{products.length}</span>
            </button>

            {/* Categories from PostgreSQL */}
            
          {categories.map((item) => {
            const count =
              item.slug === "All"
                ? products.length
                : products.filter(
                    (product) => toSlug(product.category) === item.slug
                  ).length;

            return (
              <button
                key={item.slug}
                type="button"
                className={
                  category === item.slug && !subcategory
                    ? "shop-category active"
                    : "shop-category"
                }
                onClick={() => {
                  setCategory(item.slug);
                  setSubcategory("");

                  window.history.replaceState(
                    {},
                    "",
                    item.slug === "All"
                      ? window.location.pathname
                      : `${window.location.pathname}?category=${encodeURIComponent(item.slug)}`
                  );
                }}
              >
                {item.name}
                <span>{count}</span>
              </button>
            );
          })}
          </div> 
        </aside>

          <div className="shop-results">
            {/* Results heading */}
            <div className="shop-results-heading">
              <p>
                {subcategory
                  ? `${category} / ${subcategory}`.toUpperCase()
                  : category === "All"
                    ? "ALL PRODUCTS"
                    : category.toUpperCase()}
              </p>

              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "ITEM"
                  : "ITEMS"}
              </span>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="shop-message">
                Loading collection...
              </div>
            ) : error ? (
              <div className="shop-message shop-error">
                <h2>
                  Unable to load the collection
                </h2>
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="shop-message">
                <h2>No products found</h2>
                <p>
                  Try another search or category.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Product cards */
              <div className="shop-product-grid">
                {[
            ...new Map(
              filteredProducts.map((product) => [
                String(product.id),
                product,
              ])
            ).values(),
          ].map((product) => (
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
                        {product.subcategory ||
                          product.category}
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