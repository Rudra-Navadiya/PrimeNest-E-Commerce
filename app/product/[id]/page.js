
"use client";

import { useWishlist } from "@/context/WishlistContext";
import { use, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export default function ProductPage({ params }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product from PostgreSQL through the API
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setSelectedVariant(null);
        setQuantity(1);

        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found"
              : "Unable to load product"
          );
        }

        const data = await response.json();
        setProduct(data.product);
        console.log("PRODUCT DATA:", data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Variants are optional and configured per product.
  // Supports strings or objects such as:
  // "M" or { label: "M", stock: 5 }
  const variants = Array.isArray(product?.variants)
    ? product.variants
        .map((variant) =>
          typeof variant === "string"
            ? { label: variant, stock: null }
            : {
                ...variant,
                label:
                  variant.label ??
                  variant.name ??
                  variant.value ??
                  "",
                stock:
                  variant.stock == null
                    ? null
                    : Number(variant.stock),
              }
        )
        .filter((variant) => variant.label)
    : [];

  const hasVariants = variants.length > 0;

  const activeVariant = variants.find(
    (variant) => variant.label === selectedVariant
  );

  // Use variant stock when supplied; otherwise use product stock.
  const availableStock =
    activeVariant?.stock != null &&
    Number.isFinite(activeVariant.stock)
      ? Math.max(0, activeVariant.stock)
      : Math.max(0, Number(product?.stock) || 0);

  const isOutOfStock = availableStock < 1;

  const handleAddToCart = () => {
    if (hasVariants && !activeVariant) return;
    if (quantity < 1 || quantity > availableStock) return;

    // Preserve the product and attach the selected variant.
    // Products without variants remain unchanged.
    const cartProduct = hasVariants
      ? {
          ...product,
          selectedVariant: activeVariant,
          variantLabel: activeVariant.label,
        }
      : product;

    addToCart(cartProduct, quantity);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="product-page">
          <p>Loading product...</p>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="product-not-found">
          <p>PRIMENEST / PRODUCT</p>
          <h1>{error || "Product not found"}</h1>
          <a href="/shop">Return to shop ↗</a>
        </main>
      </>
    );
  }

  const isWishlisted = wishlist.some(
    (item) => String(item.id) === String(product.id)
  );

  return (
    <>
      <Navbar />

      <main className="product-page">
        <section className="product-detail">

          <div className="product-detail-image">
            <div
              style={{
                backgroundImage: product.image
                  ? `url("${product.image}")`
                  : "none",
                backgroundColor: "#f2f0eb",
              }}
              role="img"
              aria-label={product.name}
            />
          </div>

          <div className="product-detail-info">

            <p className="product-detail-category">
              {product.subcategory || product.category}
            </p>

            <h1>{product.name}</h1>

            <p className="product-detail-price">
              {formatPrice(product.price)}
            </p>

            <div className="product-detail-line" />

            <p className="product-detail-description">
              {product.description}
            </p>

            {/* OPTIONAL PRODUCT VARIANTS */}
            {hasVariants && (
              <div className="product-variant-section">
                <div className="product-variant-heading">
                  <span>
                    {product.variant_label || "SELECT OPTION"}
                  </span>

                  <span className="selected-variant-label">
                    {selectedVariant
                      ? `Selected: ${selectedVariant}`
                      : "Choose an option"}
                  </span>
                </div>

                <div className="product-variant-options">
                  {variants.map((variant, index) => {
                    const isSelected =
                      selectedVariant === variant.label;

                    const variantOutOfStock =
                      variant.stock != null &&
                      Number.isFinite(variant.stock) &&
                      variant.stock < 1;

                    return (
                      <button
                        key={`${variant.label}-${index}`}
                        type="button"
                        className={`product-variant-button ${
                          isSelected ? "active" : ""
                        } ${
                          variantOutOfStock ? "unavailable" : ""
                        }`}
                        onClick={() => {
                          if (variantOutOfStock) return;
                          setSelectedVariant(variant.label);
                          setQuantity(1);
                        }}
                        disabled={variantOutOfStock}
                        aria-pressed={isSelected}
                      >
                        {variant.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="product-quantity">
              <span>QUANTITY</span>

              <div className="quantity-selector">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(availableStock, current + 1)
                    )
                  }
                  disabled={
                    isOutOfStock ||
                    quantity >= availableStock
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* STOCK */}
            <p className="product-stock">
              {isOutOfStock
                ? "Out of stock"
                : `${availableStock} available`}
            </p>

            {/* ACTIONS */}
            <div className="product-actions">

              <button
                type="button"
                className="add-to-bag"
                disabled={
                  isOutOfStock ||
                  quantity > availableStock ||
                  (hasVariants && !activeVariant)
                }
                onClick={handleAddToCart}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : hasVariants && !activeVariant
                    ? "Select an Option"
                    : "Add to Bag"}

                <span>↗</span>
              </button>

              <button
                type="button"
                className="product-favorite"
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                onClick={() => toggleWishlist(product)}
              >
                {isWishlisted ? "♥" : "♡"}
              </button>

            </div>

          </div>
        </section>
      </main>
    </>
  );
}