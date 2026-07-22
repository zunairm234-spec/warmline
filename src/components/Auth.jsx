import { useState } from "react";
import { supabase } from "../Supabase";
import "./Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        setMessage(
          "Account created successfully. Please check your email to verify your account."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">W</div>

          <h1>Warmline</h1>
          <p>by ElevIQ</p>
        </div>

        <div className="auth-heading">
          <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>

          <p>
            {isLogin
              ? "Sign in to continue to your workspace."
              : "Start building better relationships with your clients."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-field">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Muhammad Zunair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          {message && <div className="auth-message">{message}</div>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
          >
            {isLogin ? "Create Account" : "Sign In"}
          </button>
        </div>

        <div className="auth-footer">
          Your workspace. Your clients. Your growth.
        </div>
      </div>
    </div>
  );
}