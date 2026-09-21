import { useState } from "react";
import axios from "axios";
import "./Auth.css";
import { useTranslation, SUPPORTED_LANGUAGES } from "../i18n/LanguageContext";

const API_URL = "http://127.0.0.1:8000";

function Auth({ onLogin, initialMode = "login" }) {
  const { t, language } = useTranslation();
  const [mode, setMode] = useState(initialMode);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    place: "",
    preferred_language: language || "en",
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      let response;

      if (mode === "register") {
        response = await axios.post(
          `${API_URL}/auth/register`,
          {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || null,
            place: form.place.trim() || null,
            preferred_language: form.preferred_language,
            password: form.password,
            confirm_password: form.confirm_password,
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/auth/login`,
          {
            login: form.phone.trim(),
            password: form.password,
          }
        );
      }

      const { access_token, user } = response.data;

      // Save JWT
      localStorage.setItem("agromitr_access_token", access_token);

      // Save user information
      localStorage.setItem("agromitr_user", JSON.stringify(user));

      // Tell App.jsx authentication succeeded
      onLogin(user);

    } catch (err) {
      console.error("Authentication error:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail.map((item) => item.msg).join(", "));
      } else {
        setError(detail || t("authError", {}, "Unable to complete authentication."));
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          🌱
        </div>

        <h1>{t("appName", {}, "AgroMitR")}</h1>

        <p className="auth-subtitle">
          {t("appSubtitle", {}, "Smart crop health for every farmer")}
        </p>

        <div className="auth-tabs">

          <button
            type="button"
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchMode("login")}
          >
            {t("login", {}, "Login")}
          </button>

          <button
            type="button"
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => switchMode("register")}
          >
            {t("register", {}, "Register")}
          </button>

        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>

          {mode === "register" && (
            <>
              <label>
                {t("fullName", {}, "Full Name")}
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t("enterName", {}, "Enter your name")}
                  required
                />
              </label>

              <label>
                {t("place", {}, "Place / Village")}
                <input
                  type="text"
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  placeholder={t("enterPlace", {}, "Village / City / District")}
                />
              </label>

              <label>
                {t("preferredLanguage", {}, "Preferred Language")}
                <select
                  name="preferred_language"
                  value={form.preferred_language}
                  onChange={handleChange}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} — {lang.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t("email", {}, "Email")}
                <span className="optional">
                  {t("optional", {}, "Optional")}
                </span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t("enterEmail", {}, "you@example.com")}
                />
              </label>
            </>
          )}

          <label>
            {t("phoneNumber", {}, "Phone Number")}
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder={t("enterPhone", {}, "Enter phone number")}
              required
            />
          </label>

          <label>
            {t("password", {}, "Password")}
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t("enterPassword", {}, "Enter password")}
              required
            />
          </label>

          {mode === "register" && (
            <label>
              {t("confirmPassword", {}, "Confirm Password")}
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                placeholder={t("enterConfirmPassword", {}, "Confirm password")}
                required
              />
            </label>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? t("pleaseWait", {}, "Please wait...")
              : mode === "login"
                ? t("loginButton", {}, "Login to AgroMitR")
                : t("createAccountButton", {}, "Create Farmer Account")}
          </button>

        </form>

        <p className="auth-switch">
          {mode === "login"
            ? t("dontHaveAccount", {}, "Don't have an account?")
            : t("alreadyHaveAccount", {}, "Already have an account?")}

          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login"
              ? ` ${t("register", {}, "Register")}`
              : ` ${t("login", {}, "Login")}`}
          </button>
        </p>

      </div>

    </div>
  );
}

export default Auth;