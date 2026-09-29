
"use client";

import { use, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export default function ProductPage({ params }) {
  const { id } = use(params);
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product from PostgreSQL through the API
  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");

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
          <h1>
            {error || "Product not found"}
          </h1>
          <a href="/shop">Return to shop ↗</a>
        </main>
      </>
    );
  }

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
              {product.category}
            </p>

            <h1>{product.name}</h1>

            <p className="product-detail-price">
              {formatPrice(product.price)}
            </p>

            <div className="product-detail-line" />

            <p className="product-detail-description">
              {product.description}
            </p>

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
                      Math.min(
                        Number(product.stock),
                        current + 1
                      )
                    )
                  }
                  disabled={quantity >= Number(product.stock)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {Number(product.stock) > 0 ? (
              <p className="product-stock">
                {product.stock} available
              </p>
            ) : (
              <p className="product-stock">
                Out of stock
              </p>
            )}

            <div className="product-actions">

              <button
                type="button"
                className="add-to-bag"
                disabled={
                  Number(product.stock) < 1 ||
                  quantity > Number(product.stock)
                }
                onClick={() => addToCart(product, quantity)}
              >
                Add to Bag
                <span>↗</span>
              </button>

              <button
                type="button"
                className="product-favorite"
                aria-label="Add to wishlist"
              >
                ♡
              </button>

            </div>

          </div>
        </section>
      </main>
    </>
  );
}