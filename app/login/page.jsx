
"use client";

import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  
 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  
async function handleSubmit(event) {
  event.preventDefault();
  setLoading(true);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error("Server error. Please try again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Login failed.");
    }

    toast.success("Login successful!", {
      description: `Welcome back, ${data.user.name}!`,
    });

    router.replace("/");
    router.refresh();
  } catch (error) {
    toast.error("Login failed", {
      description:
        error.message || "Please check your details and try again.",
    });
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="pn-auth-page">
      <section className="pn-auth-card">
        <Link href="/" className="pn-auth-brand">
          <span className="pn-auth-logo">P</span>
          <span>PrimeNest</span>
        </Link>

        <div className="pn-auth-heading">
          <span className="pn-auth-eyebrow">WELCOME BACK</span>
          <h1>Sign in to your account</h1>
          <p>Discover something special, just for you.</p>
        </div>

        <form className="pn-auth-form" onSubmit={handleSubmit}>
          <label htmlFor="user-email">Email address</label>
          <input
            id="user-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="off"
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <div className="pn-auth-label-row">
            <label htmlFor="user-password">Password</label>
            <button
              type="button"
              className="pn-auth-text-button"
             onClick={() =>
            toast.info("Password recovery will be added later.")
           }
            >
              Forgot password?
            </button>
          </div>

          <div className="pn-auth-password">
            <input
              id="user-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="pn-auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <span>→</span>}
          </button>

          
        </form>

        <div className="pn-auth-switch">
          <span>New to PrimeNest?</span>
          <Link href="/register">Create an account</Link>
        </div>

        <div className="pn-auth-divider">
          <span>OR</span>
        </div>

        <Link href="/" className="pn-auth-admin-link">
          Continue shopping →
        </Link>

        <p className="pn-auth-terms">
          By continuing, you agree to our Terms of Service
          and Privacy Policy.
        </p>
      </section>
    </main>
  );
}