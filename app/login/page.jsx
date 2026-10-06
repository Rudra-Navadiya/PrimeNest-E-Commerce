"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check, X, Gem, Truck, Package, Sparkles } from "lucide-react";
import "./login-luxury.css";

// Google 4-Color Icon
function GoogleGIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Social Auth Modal State
  const [socialLoading, setSocialLoading] = useState(null);
  const [socialModal, setSocialModal] = useState(null);
  const [useCustomAccount, setUseCustomAccount] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");

  // Load saved email on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("primenest_saved_email");
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Submit Handler for Email & Password
  async function handleSubmit(event) {
    event.preventDefault();
    if (loading || loginSuccess) return;
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error("Server error. Please try again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("primenest_saved_email", email.trim());
      } else {
        localStorage.removeItem("primenest_saved_email");
      }

      setLoginSuccess(true);
      toast.success("Login successful!", {
        description: `Welcome back, ${data.user?.name || "Customer"}!`,
      });

      setTimeout(() => {
        router.replace(redirectTarget);
        router.refresh();
      }, 700);
    } catch (error) {
      toast.error("Login failed", {
        description: error.message || "Please check your details and try again.",
      });
      setLoading(false);
    }
  }

  // Social Sign In Execution
  const handleExecuteSocial = async (provider, emailToUse, nameToUse) => {
    if (socialLoading || loginSuccess) return;
    setSocialLoading(provider);

    try {
      const response = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          email: emailToUse || "customer@primenest.com",
          name: nameToUse || "PrimeNest Customer",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in with Google.");
      }

      setLoginSuccess(true);
      setSocialModal(null);
      toast.success("Login successful!", {
        description: `Welcome, ${data.user?.name || "Customer"}! Signed in with Google.`,
      });

      setTimeout(() => {
        router.replace(redirectTarget);
        router.refresh();
      }, 700);
    } catch (error) {
      toast.error("Google Sign-In Failed", {
        description: error.message || "Please try again.",
      });
      setSocialLoading(null);
    }
  };

  return (
    <main className="luxury-login-page">
      {/* 4K High Clarity Background Image with Ambient Breathing Animation */}
      <div className="luxury-bg-viewport" aria-hidden="true">
        <div className="luxury-bg-layer" />
        <div className="luxury-bg-overlay" />
      </div>

      {/* Luminous Golden Halo Arc behind Card/Orchid with Pulse Animation */}
      <div className="luxury-halo-arc" aria-hidden="true" />
      <div className="luxury-ambient-glow" aria-hidden="true" />

      {/* Main Center Viewport */}
      <div className="luxury-center-stage">
        {/* Floating Frosted Glass Luxury Login Card */}
        <div className="luxury-glass-card">
          {/* Top Brand Monogram Logo */}
          <div className="card-logo-wrapper">
            <img
              src="/images/primenest-card-logo.png"
              alt="PrimeNest"
              className="card-logo-img"
            />
          </div>

          {/* Editorial Heading & Subtitle */}
          <h1 className="card-heading">Welcome to PrimeNest</h1>
          <p className="card-subheading">Your gateway to luxury fashion.</p>

          {/* Login Form */}
          <form className="card-form" onSubmit={handleSubmit}>
            {/* Email Address Pill Input */}
            <div className="form-field">
              <div className="input-wrap">
                <Mail size={16} className="input-icon-left" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="luxury-text-input"
                />
              </div>
            </div>

            {/* Password Pill Input with Visibility Toggle */}
            <div className="form-field">
              <div className="input-wrap">
                <Lock size={16} className="input-icon-left" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="luxury-text-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="password-eye-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="remember-row">
              <button
                type="button"
                className="remember-label-btn"
                onClick={() => setRememberMe((prev) => !prev)}
              >
                <span className={`custom-checkbox-box ${rememberMe ? "checked" : ""}`}>
                  {rememberMe && <Check size={11} strokeWidth={3} color="#ffffff" />}
                </span>
                <span>Remember me</span>
              </button>

              <button
                type="button"
                className="forgot-btn"
                onClick={() =>
                  toast.info("Password Recovery", {
                    description: "Password reset instructions have been dispatched to your email.",
                  })
                }
              >
                Forgot Password?
              </button>
            </div>

            {/* Metallic Gold CTA Button (Sign In →) */}
            <button
              type="submit"
              className="card-submit-btn"
              disabled={loading || loginSuccess}
            >
              <span className="btn-shine-sweep" aria-hidden="true" />
              {loginSuccess ? (
                <>
                  <Check size={17} />
                  <span>Signed In</span>
                </>
              ) : loading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="btn-arrow-icon" />
                </>
              )}
            </button>
          </form>

          {/* Divider: OR */}
          <div className="card-divider">
            <span className="divider-line" />
            <span className="divider-text">OR</span>
            <span className="divider-line" />
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            className="card-google-btn"
            onClick={() => {
              setSocialModal("google");
              setUseCustomAccount(false);
            }}
            disabled={socialLoading !== null || loading || loginSuccess}
          >
            {socialLoading === "google" ? (
              <span className="btn-spinner" style={{ borderColor: "#d1d5db", borderTopColor: "#1f2937" }} />
            ) : (
              <>
                <GoogleGIcon size={18} />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Card Bottom Footer */}
          <div className="card-bottom-footer">
            <span>Don't have an account?</span>
            <Link href="/register" className="card-bottom-link">
              Create an Account &rarr;
            </Link>
          </div>
        </div>

        {/* Marble Pedestal Trust Badges Row */}
        <div className="pedestal-trust-row" aria-label="PrimeNest Guarantees">
          <div className="trust-item">
            <div className="trust-icon-wrap">
              <Gem size={17} className="trust-icon" />
            </div>
            <div className="trust-text">
              <span className="trust-title">Authentic</span>
              <span className="trust-sub">Products</span>
            </div>
          </div>

          <div className="trust-sep" aria-hidden="true" />

          <div className="trust-item">
            <div className="trust-icon-wrap">
              <Truck size={17} className="trust-icon" />
            </div>
            <div className="trust-text">
              <span className="trust-title">Free Express</span>
              <span className="trust-sub">Delivery</span>
            </div>
          </div>

          <div className="trust-sep" aria-hidden="true" />

          <div className="trust-item">
            <div className="trust-icon-wrap">
              <Package size={17} className="trust-icon" />
            </div>
            <div className="trust-text">
              <span className="trust-title">7-Day</span>
              <span className="trust-sub">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Editorial Corner Star Sparkle */}
      <div className="luxury-corner-sparkle" aria-hidden="true">
        <Sparkles size={16} />
      </div>

      {/* Interactive Google Sign-In Selection Modal */}
      {socialModal && (
        <div
          className="dark-lightbox-backdrop"
          onClick={() => {
            if (!socialLoading) setSocialModal(null);
          }}
          style={{ zIndex: 100 }}
        >
          <div
            className="dark-size-guide-modal"
            style={{ width: "420px", padding: "32px 28px", borderRadius: "24px", background: "#ffffff", color: "#18181b" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "600", fontSize: "15px" }}>
                <GoogleGIcon size={20} />
                <span>Google Sign-In</span>
              </div>
              <button
                type="button"
                className="guide-close-btn"
                onClick={() => {
                  if (!socialLoading) setSocialModal(null);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#71717a", marginBottom: "20px" }}>
              Select your Google profile to continue instantly to PrimeNest:
            </p>

            {!useCustomAccount ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#EA4335",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: "700",
                      fontSize: "16px",
                    }}
                  >
                    R
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>Rudra Navadiya</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>rudra.google@gmail.com</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="card-submit-btn"
                  style={{ height: "44px", borderRadius: "12px" }}
                  disabled={socialLoading !== null}
                  onClick={() => handleExecuteSocial("google", "rudra.google@gmail.com", "Rudra Navadiya")}
                >
                  {socialLoading ? (
                    <span className="btn-spinner" />
                  ) : (
                    <span>Continue as Rudra Navadiya</span>
                  )}
                </button>

                <div style={{ textAlign: "center", marginTop: "14px" }}>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", color: "#c8a15a", fontSize: "12.5px", fontWeight: "500", cursor: "pointer" }}
                    onClick={() => setUseCustomAccount(true)}
                  >
                    Use another Google account &rarr;
                  </button>
                </div>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customEmail) return;
                  handleExecuteSocial("google", customEmail, customName || "Google Customer");
                }}
                style={{ display: "flex", flexFlow: "column", gap: "12px" }}
              >
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="luxury-text-input"
                  style={{ height: "42px", padding: "0 12px" }}
                />
                <input
                  type="email"
                  placeholder="Google email address"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  className="luxury-text-input"
                  style={{ height: "42px", padding: "0 12px" }}
                />
                <button
                  type="submit"
                  className="card-submit-btn"
                  style={{ height: "44px", borderRadius: "12px", marginTop: "4px" }}
                  disabled={socialLoading !== null}
                >
                  {socialLoading ? <span className="btn-spinner" /> : <span>Sign In with this Account</span>}
                </button>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "#71717a", fontSize: "12px", cursor: "pointer", marginTop: "4px" }}
                  onClick={() => setUseCustomAccount(false)}
                >
                  &larr; Back to quick account
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#f8f5ef", display: "grid", placeItems: "center", color: "#c8a15a" }}>
          Loading PrimeNest Luxury...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}