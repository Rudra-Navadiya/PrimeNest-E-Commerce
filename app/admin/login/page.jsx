
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Unexpected server response. Please try again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid admin email or password."
        );
      }

      toast.success("Admin login successful!", {
        description: `Welcome back, ${data.user?.name || "Admin"}!`,
      });

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      toast.error("Admin login failed", {
        description:
          error.message || "Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pn-admin-auth-page">
      <section className="pn-admin-auth-card">
        <Link href="/" className="pn-admin-auth-brand">
          <span className="pn-admin-auth-logo">P</span>
          <span>PrimeNest</span>
        </Link>

        <div className="pn-admin-auth-heading">
          <span className="pn-admin-auth-eyebrow">
            SECURE ADMINISTRATION
          </span>
          <h1>Admin Portal</h1>
          <p>Sign in to manage your PrimeNest store.</p>
        </div>

        <div className="pn-admin-security-note">
          <span className="pn-admin-security-icon">♙</span>
          <span>
            Restricted access for authorized administrators only.
          </span>
        </div>

        <form
          className="pn-admin-auth-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="admin-email">
            Admin email address
          </label>

          <input
            id="admin-email"
            type="email"
            placeholder="admin@primenest.com"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
          />

          <div className="pn-admin-label-row">
            <label htmlFor="admin-password">
              Password
            </label>
          </div>

          <div className="pn-admin-password">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your admin password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              disabled={loading}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="pn-admin-auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Secure Admin Sign In"}
            <span>{loading ? "…" : "→"}</span>
          </button>
        </form>

        <div className="pn-admin-auth-footer">
          <Link href="/login">
            ← Return to customer login
          </Link>
          <p>PrimeNest • Authorized access only</p>
        </div>
      </section>
    </main>
  );
}