
"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, isCartLoaded } = useCart();

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState(null);

  const formatPrice = (price) =>
    Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("Your shopping bag is empty.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          items: cart.map((item) => ({
            id: item.id,
            quantity: Number(item.quantity),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to place your order.");
      }

      setOrderId(data.orderId);
      clearCart();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isCartLoaded) {
    return (
      <>
        <Navbar />
        <main className="checkout-page">
          <p>Loading checkout...</p>
        </main>
      </>
    );
  }

  if (orderId) {
    return (
      <>
        <Navbar />
        <main className="checkout-page">
          <section className="checkout-success">
            <p className="checkout-eyebrow">PRIMENEST / ORDER CONFIRMED</p>
            <div className="checkout-success-icon">✓</div>
            <h1>Thank you for your order.</h1>
            <p>
              Your order has been placed successfully.
            </p>
            <p className="checkout-order-number">
              ORDER NUMBER: #{orderId}
            </p>
            <Link href="/shop" className="checkout-submit">
              Continue Shopping ↗
            </Link>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        <header className="checkout-heading">
          <p className="checkout-eyebrow">
            PRIMENEST / SECURE CHECKOUT
          </p>
          <h1>Complete Your Order</h1>
          <p>Just a few details before your order is placed.</p>
        </header>

        {cart.length === 0 ? (
          <section className="checkout-empty">
            <h2>Your shopping bag is empty.</h2>
            <Link href="/shop" className="checkout-submit">
              Explore Collection ↗
            </Link>
          </section>
        ) : (
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <section className="checkout-section">
                <p className="checkout-section-label">
                  01 / CUSTOMER DETAILS
                </p>

                <label htmlFor="customerName">Full name</label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={form.customerName}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />

                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={255}
                  required
                />

                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Your contact number"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={20}
                  required
                />
              </section>

              <section className="checkout-section">
                <p className="checkout-section-label">
                  02 / DELIVERY ADDRESS
                </p>

                <label htmlFor="address">Full delivery address</label>
                <textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  placeholder="House number, street, area, city, state and PIN code"
                  value={form.address}
                  onChange={handleChange}
                  rows={5}
                  maxLength={2000}
                  required
                />
              </section>

              {error && (
                <p className="checkout-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="checkout-submit"
                disabled={loading || cart.length === 0}
              >
                {loading ? "PLACING ORDER..." : "PLACE ORDER ↗"}
              </button>

              <p className="checkout-note">
                Payment processing is not enabled yet.
                This step records your order without charging you.
              </p>
            </form>

            <aside className="checkout-summary">
              <p className="checkout-section-label">
                YOUR ORDER
              </p>

              {cart.map((item) => (
                <div className="checkout-item" key={item.id}>
                  <div className="checkout-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>PN</span>
                    )}
                    <span className="checkout-item-quantity">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="checkout-item-info">
                    <h3>{item.name}</h3>
                    <p>{item.category}</p>
                    <strong>
                      {formatPrice(
                        Number(item.price) * Number(item.quantity)
                      )}
                    </strong>
                  </div>
                </div>
              ))}

              <div className="checkout-total-line">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              <div className="checkout-total-line">
                <span>Shipping</span>
                <span>To be confirmed</span>
              </div>

              <div className="checkout-grand-total">
                <span>Order total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}