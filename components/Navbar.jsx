
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const router = useRouter();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Men", href: "/men" },
    { name: "Women", href: "/women" },
    { name: "Accessories", href: "/accessories" },
    { name: "Lifestyle", href: "/lifestyle" },
  ];

  return (
    <header className="premium-navbar">
      <div className="navbar-inner">
        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
        </button>

        <Link href="/" className="premium-logo">
          PRIME<span>NEST</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="desktop-navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Navbar icons */}
        <div className="navbar-tools">
          <button
            aria-label="Search"
            title="Search"
            onClick={() => router.push("/shop")}
          >
            ⌕
          </button>

          <button
            aria-label="Login to your account"
            title="Login"
            onClick={() => router.push("/login")}
          >
            ♙
          </button>

          <button
            aria-label="Wishlist"
            title="Wishlist"
            onClick={() => router.push("/wishlist")}
          >
            ♡
          </button>

          <Link
            href="/cart"
            className="navbar-cart"
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            Bag <sup>{cartCount}</sup>
          </Link>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav className="mobile-navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
          >
            ♙ Login / My Account
          </Link>

          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
          >
            Bag ({cartCount})
          </Link>
        </nav>
      )}
    </header>
  );
}