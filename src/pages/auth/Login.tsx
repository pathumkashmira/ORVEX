import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { useApp } from "@/contexts/AppContext";
import Cursor from "@/components/Cursor";

export default function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const { login } = useApp();

  const navigate = useNavigate();

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const authenticatedUser =
      await login(
        email,
        password
      );

    setLoading(false);

    if (!authenticatedUser) {
      setError(
        "Unable to sign in. Check your email and password."
      );

      return;
    }

    // ─────────────────────────────────────
    // ROLE BASED REDIRECT
    // ─────────────────────────────────────

    switch (authenticatedUser.role) {
      case "SUPER_ADMIN":
      case "ADMIN":
      case "PROJECT_LEAD":
        navigate("/admin", {
          replace: true,
        });
        break;

      case "TEAM_COLLABORATOR":
        navigate("/studio-os", {
          replace: true,
        });
        break;

      case "CLIENT":
        navigate("/client", {
          replace: true,
        });
        break;

      default:
        setError(
          "Your account does not have a valid ORVEX role."
        );
    }
  };

  return (
    <div className="noise min-h-screen bg-[#050608] flex items-center justify-center px-8">
      <Cursor />

      <div className="w-full max-w-sm">

        <Link
          to="/"
          className="block mb-12"
        >
          <span
            className="font-700 text-2xl tracking-[0.15em] text-[#f5f7f8]"
            style={{
              fontFamily:
                "'Space Grotesk', sans-serif",
              fontWeight: 700,
            }}
          >
            ORVEX
          </span>
        </Link>

        <p className="label-orange mb-4">
          SECURE ACCESS
        </p>

        <h1
          className="text-3xl font-700 text-[#f5f7f8] mb-10"
          style={{
            fontFamily:
              "'Space Grotesk', sans-serif",
            fontWeight: 700,
          }}
        >
          SIGN IN
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="orvex-label">
              Email
            </label>

            <input
              required
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="orvex-input"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="orvex-label">
              Password
            </label>

            <input
              required
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="orvex-input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-red-400 text-xs">
                {error}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">

            <Link
              to="/forgot-password"
              className="label-sm text-[#bfc5cc]/50 hover:text-[#ff5a00] transition-colors no-underline"
            >
              Forgot password?
            </Link>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading
              ? "AUTHENTICATING..."
              : "SIGN IN"}

            {!loading && (
              <ArrowRight size={14} />
            )}
          </button>

        </form>

        <div className="mt-10 pt-8 border-t border-white/5">

          <p className="text-[#bfc5cc]/40 text-xs">
            ORVEX SECURE STUDIO ACCESS
          </p>

          <p className="text-[#bfc5cc]/30 text-[11px] mt-2">
            Your account is authenticated
            through the ORVEX secure
            platform.
          </p>

        </div>

        <div className="mt-6">

          <Link
            to="/"
            className="btn-ghost text-[#bfc5cc]/50 text-xs"
          >
            ← BACK TO SITE
          </Link>

        </div>

      </div>
    </div>
  );
}