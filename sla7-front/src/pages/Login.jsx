import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setError(
          data.message || "Invalid email or password."
        );
        setLoading(false);
        return;
      }

      // Save login information
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(
        "TOKEN SAVED:",
        localStorage.getItem("token")
      );

      console.log(
        "USER SAVED:",
        localStorage.getItem("user")
      );

      setLoading(false);

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Could not connect to the server."
      );

      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <p className="section-small">
          WELCOME BACK
        </p>

        <h1>Log in</h1>

        <p className="auth-description">
          Log in to your Sla7 account.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="omar@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="publish-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log in"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}

          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Create one
          </button>
        </p>
      </div>
    </main>
  );
}

export default Login;