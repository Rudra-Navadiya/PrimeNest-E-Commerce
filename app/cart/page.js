"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cart,
    isCartLoaded,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  const formatPrice = (price) => {
    return `₹${price.toLocaleString("en-IN")}`;
  };

  if (!isCartLoaded) {
  return (
    <>
      <Navbar />
      <main className="cart-page">
        <p>Loading your shopping bag...</p>
      </main>
    </>
  );
}

  return (
    <>
      <Navbar />

      <main className="cart-page">

        {/* HEADER */}

        <section className="cart-header">
          <p className="cart-label">
            PRIMENEST / YOUR BAG
          </p>

          <h1>
            Shopping <em>Bag.</em>
          </h1>

          <p className="cart-header-text">
            Review your selected pieces before
            completing your order.
          </p>
        </section>

        {cart.length === 0 ? (

          /* EMPTY CART */

          <section className="empty-cart">

            <div className="empty-cart-icon">
              ♡
            </div>

            <h2>
              Your bag is <em>empty.</em>
            </h2>

            <p>
              Discover something you will love.
            </p>

            <Link
              href="/shop"
              className="continue-shopping"
            >
              Continue Shopping
              <span>↗</span>
            </Link>

          </section>

        ) : (

          /* CART WITH PRODUCTS */

          <section className="cart-layout">

            {/* PRODUCTS */}

            <div className="cart-products">

              <div className="cart-products-top">
                <span>
                  {cart.length} {cart.length === 1 ? "ITEM" : "ITEMS"}
                </span>

                <span>
                  PRIME NEST COLLECTION
                </span>
              </div>

              {cart.map((item) => {

                const price = Number(
                  item.price.replace(/[₹,]/g, "")
                );

                return (
                  <article
                    className="cart-item"
                    key={item.id}
                  >

                    <div
                      className="cart-item-image"
                      style={{
                        backgroundImage:
                          `url(${item.image})`,
                      }}
                    />

                    <div className="cart-item-details">

                      <p className="cart-item-category">
                        {item.category}
                      </p>

                      <h2>
                        {item.name}
                      </h2>

                      <p className="cart-item-price">
                        {item.price}
                      </p>

                      <div className="cart-item-controls">

                        <div className="quantity-control">

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                        <button
                          className="remove-item"
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                    <div className="cart-item-total">
                      {formatPrice(
                        price * item.quantity
                      )}
                    </div>

                  </article>
                );
              })}

            </div>

            {/* SUMMARY */}

            <aside className="cart-summary">

              <p className="summary-label">
                ORDER SUMMARY
              </p>

              <h2>
                Your <em>Order.</em>
              </h2>

              <div className="summary-line">
                <span>Subtotal</span>

                <span>
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <div className="summary-line">
                <span>Shipping</span>

                <span>
                  Free
                </span>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Total</span>

                <strong>
                  {formatPrice(cartTotal)}
                </strong>
              </div>

              <Link href="/checkout" className="checkout-button">
                  Proceed to Checkout
                  <span>↗</span>
              </Link>

              <Link
                href="/shop"
                className="summary-continue"
              >
                ← Continue Shopping
              </Link>

              <div className="secure-checkout">
                <span>◇</span>

                <div>
                  <strong>
                    Secure Checkout
                  </strong>

                  <p>
                    Your information is protected
                    with secure encryption.
                  </p>
                </div>
              </div>

            </aside>

          </section>

        )}

      </main>
    </>
  );
}