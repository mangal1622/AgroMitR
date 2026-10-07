import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation, SUPPORTED_LANGUAGES } from "../i18n/LanguageContext";
import "./Settings.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Settings({ authUser, onUpdateUser, crops = [], onLogout }) {
  const { t, language, setLanguage } = useTranslation();
  const [activeSection, setActiveSection] = useState("profile"); // 'profile' | 'language' | 'notifications' | 'privacy' | 'help' | 'about'
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: authUser?.name || "",
    phone: authUser?.phone || "",
    email: authUser?.email || "",
    place: authUser?.place || "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync profileForm when authUser changes
  useEffect(() => {
    if (authUser) {
      setProfileForm({
        name: authUser.name || "",
        phone: authUser.phone || "",
        email: authUser.email || "",
        place: authUser.place || "",
      });
    }
  }, [authUser]);

  // Calculate total farm land from user's active crops
  const totalLandAcre = crops.reduce((sum, c) => {
    const area = Number(c.area) || 0;
    // convert common units to approximate acres for summary
    if (c.area_unit === "hectare") return sum + area * 2.471;
    if (c.area_unit === "bigha") return sum + area * 0.625;
    if (c.area_unit === "guntha") return sum + area * 0.025;
    return sum + area;
  }, 0);

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
    setProfileMessage({ type: "", text: "" });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    const token = localStorage.getItem("agromitr_access_token");

    try {
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        {
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
          email: profileForm.email.trim() || null,
          place: profileForm.place.trim() || null,
          preferred_language: language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedUser = response.data?.user;
      if (updatedUser) {
        localStorage.setItem("agromitr_user", JSON.stringify(updatedUser));
        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
      }

      setProfileMessage({
        type: "success",
        text: t("profileUpdated", null, "Profile updated successfully!"),
      });
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Profile update error:", err);
      const detail = err.response?.data?.detail;
      setProfileMessage({
        type: "error",
        text: typeof detail === "string" ? detail : t("error", null, "Failed to update profile."),
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSelectLanguage = (code) => {
    setLanguage(code);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <section className="settings-page">
      <div className="settings-container">
        {/* HEADER */}
        <div className="settings-header">
          <div>
            <span className="settings-eyebrow">⚙️ {t("settings", null, "Settings")}</span>
            <h1>{t("settingsTitle", null, "Settings & Farmer Profile")}</h1>
          </div>
        </div>

        <div className="settings-layout">
          {/* SIDEBAR NAVIGATION */}
          <aside className="settings-sidebar">
            <button
              type="button"
              className={`settings-nav-btn ${activeSection === "profile" ? "active" : ""}`}
              onClick={() => setActiveSection("profile")}
            >
              <span>👨‍🌾</span>
              <div className="settings-nav-text">
                <strong>{t("farmerProfile", null, "Farmer Profile")}</strong>
                <small>{authUser?.name || t("farmer", null, "Farmer")}</small>
              </div>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSection === "language" ? "active" : ""}`}
              onClick={() => setActiveSection("language")}
            >
              <span>🌐</span>
              <div className="settings-nav-text">
                <strong>{t("languageSetting", null, "Language")}</strong>
                <small className="active-lang-badge">{currentLangObj.nativeName}</small>
              </div>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSection === "notifications" ? "active" : ""}`}
              onClick={() => setActiveSection("notifications")}
            >
              <span>🔔</span>
              <div className="settings-nav-text">
                <strong>{t("notificationsSetting", null, "Notifications")}</strong>
                <small>{t("weatherAlerts", null, "Weather & Crop Alerts")}</small>
              </div>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSection === "privacy" ? "active" : ""}`}
              onClick={() => setActiveSection("privacy")}
            >
              <span>🛡️</span>
              <div className="settings-nav-text">
                <strong>{t("privacySetting", null, "Privacy & Security")}</strong>
                <small>{t("privacyDesc", null, "Data Security")}</small>
              </div>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSection === "help" ? "active" : ""}`}
              onClick={() => setActiveSection("help")}
            >
              <span>📞</span>
              <div className="settings-nav-text">
                <strong>{t("helpSupport", null, "Help & Support")}</strong>
                <small>{t("kisanHelpline", null, "Kisan Helpline")}</small>
              </div>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSection === "about" ? "active" : ""}`}
              onClick={() => setActiveSection("about")}
            >
              <span>🌱</span>
              <div className="settings-nav-text">
                <strong>{t("aboutAgroMitr", null, "About AgroMitr")}</strong>
                <small>{t("version", null, "Version 1.0.0")}</small>
              </div>
            </button>

            <button
              type="button"
              className="settings-nav-btn logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <span>🚪</span>
              <div className="settings-nav-text">
                <strong>{t("logout", null, "Logout")}</strong>
              </div>
            </button>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="settings-content">
            {/* 1. FARMER PROFILE SECTION */}
            {activeSection === "profile" && (
              <div className="settings-card">
                <div className="card-header-row">
                  <div>
                    <h2>{t("farmerInformation", null, "Farmer Information")}</h2>
                    <p className="card-subtitle">
                      {t("cropInfo", null, "View and update your personal farm profile details.")}
                    </p>
                  </div>
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      className="edit-profile-btn"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      ✏️ {t("editProfile", null, "Edit Profile")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="cancel-profile-btn"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileMessage({ type: "", text: "" });
                      }}
                    >
                      {t("cancel", null, "Cancel")}
                    </button>
                  )}
                </div>

                {profileMessage.text && (
                  <div className={`settings-alert ${profileMessage.type}`}>
                    {profileMessage.type === "success" ? "✓ " : "⚠️ "}
                    {profileMessage.text}
                  </div>
                )}

                {/* FARM SUMMARY OVERVIEW */}
                <div className="profile-stats-grid">
                  <div className="profile-stat-box">
                    <span className="profile-stat-icon">🌱</span>
                    <div>
                      <small>{t("monitoredCrops", null, "Monitored Crops")}</small>
                      <strong>{crops.length} {t("cropsLabel", null, "crops")}</strong>
                    </div>
                  </div>
                  <div className="profile-stat-box">
                    <span className="profile-stat-icon">🌾</span>
                    <div>
                      <small>{t("totalLand", null, "Total Farm Land")}</small>
                      <strong>
                        {totalLandAcre > 0 ? `${totalLandAcre.toFixed(1)} ${t("acre", null, "acre")}` : "—"}
                      </strong>
                    </div>
                  </div>
                  <div className="profile-stat-box">
                    <span className="profile-stat-icon">🌐</span>
                    <div>
                      <small>{t("preferredLanguage", null, "Preferred Language")}</small>
                      <strong>{currentLangObj.nativeName} ({currentLangObj.name})</strong>
                    </div>
                  </div>
                </div>

                {/* PROFILE DETAILS OR EDIT FORM */}
                {!isEditingProfile ? (
                  <div className="profile-details-view">
                    <div className="detail-item">
                      <label>{t("farmerName", null, "Farmer Name")}</label>
                      <div className="detail-value">{authUser?.name || "—"}</div>
                    </div>
                    <div className="detail-item">
                      <label>{t("mobileNumber", null, "Mobile Number")}</label>
                      <div className="detail-value">{authUser?.phone || "—"}</div>
                    </div>
                    <div className="detail-item">
                      <label>{t("email", null, "Email")}</label>
                      <div className="detail-value">{authUser?.email || t("notProvided", null, "Not provided")}</div>
                    </div>
                    <div className="detail-item">
                      <label>{t("locationVillage", null, "Location / Village")}</label>
                      <div className="detail-value">{authUser?.place || t("notProvided", null, "Not provided")}</div>
                    </div>
                  </div>
                ) : (
                  <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                    <label>
                      <span>{t("farmerName", null, "Farmer Name")} *</span>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        placeholder={t("enterName", null, "Enter your name")}
                        required
                      />
                    </label>

                    <label>
                      <span>{t("mobileNumber", null, "Mobile Number")} *</span>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder={t("enterPhone", null, "Enter phone number")}
                        required
                      />
                    </label>

                    <label>
                      <span>{t("email", null, "Email")} ({t("optional", null, "Optional")})</span>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        placeholder={t("enterEmail", null, "you@example.com")}
                      />
                    </label>

                    <label>
                      <span>{t("locationVillage", null, "Location / Village")}</span>
                      <input
                        type="text"
                        name="place"
                        value={profileForm.place}
                        onChange={handleProfileChange}
                        placeholder={t("enterPlace", null, "Village / City / District")}
                      />
                    </label>

                    <div className="form-action-row">
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        {t("cancel", null, "Cancel")}
                      </button>
                      <button
                        type="submit"
                        className="save-btn"
                        disabled={savingProfile}
                      >
                        {savingProfile ? t("save", null, "Saving...") : t("saveChanges", null, "Save Changes")}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 2. LANGUAGE SELECTION SECTION */}
            {activeSection === "language" && (
              <div className="settings-card">
                <div className="card-header-row">
                  <div>
                    <h2>{t("languageSetting", null, "Language")}</h2>
                    <p className="card-subtitle">
                      {t("languageSettingDesc", null, "Select your preferred application language. It updates immediately across all screens.")}
                    </p>
                  </div>
                  <div className="current-lang-pill">
                    <span>{t("currentLanguageLabel", null, "Currently Selected")}:</span>
                    <strong>{currentLangObj.nativeName} ({currentLangObj.name})</strong>
                  </div>
                </div>

                <div className="settings-language-grid">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        type="button"
                        key={lang.code}
                        className={`settings-language-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectLanguage(lang.code)}
                      >
                        <div className="lang-card-main">
                          <span className="lang-native">{lang.nativeName}</span>
                          <span className="lang-english">{lang.name}</span>
                        </div>
                        <div className="lang-card-side">
                          <span className="lang-icon">{lang.flag}</span>
                          {isSelected && <span className="lang-badge">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. NOTIFICATIONS SECTION */}
            {activeSection === "notifications" && (
              <div className="settings-card">
                <h2>{t("notificationsSetting", null, "Notifications")}</h2>
                <p className="card-subtitle">
                  {t("notificationsDesc", null, "Manage weather advisories and disease alert preferences.")}
                </p>

                <div className="preference-list">
                  <div className="preference-item">
                    <div>
                      <strong>{t("weatherAlerts", null, "Weather Alerts")}</strong>
                      <p>{t("forecastDisclaimer", null, "Receive local rain, strong wind, and heat stress alerts.")}</p>
                    </div>
                    <span className="pref-toggle enabled">✓ {t("looksGood", null, "Active")}</span>
                  </div>

                  <div className="preference-item">
                    <div>
                      <strong>{t("diseaseAlerts", null, "Crop Disease Alerts")}</strong>
                      <p>{t("protectSubtitle", null, "Early warning alerts when humid weather creates fungal disease risks.")}</p>
                    </div>
                    <span className="pref-toggle enabled">✓ {t("looksGood", null, "Active")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PRIVACY SECTION */}
            {activeSection === "privacy" && (
              <div className="settings-card">
                <h2>{t("privacySetting", null, "Privacy & Security")}</h2>
                <p className="card-subtitle">
                  {t("privacyDesc", null, "Your farm data and diagnosis photos are stored securely.")}
                </p>

                <div className="info-callout">
                  <div className="callout-icon">🔒</div>
                  <div>
                    <strong>{t("cropMonitoring", null, "Private Farm Records")}</strong>
                    <p>
                      Your crop images, diagnosis logs, and field locations are linked exclusively to your farmer account and never shared with third-party advertisers.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. HELP & SUPPORT SECTION */}
            {activeSection === "help" && (
              <div className="settings-card">
                <h2>{t("helpSupport", null, "Help & Support")}</h2>
                <p className="card-subtitle">
                  {t("helpDesc", null, "Get agricultural assistance and view FAQs.")}
                </p>

                <div className="helpline-card">
                  <div className="helpline-icon">📞</div>
                  <div className="helpline-body">
                    <small>{t("kisanHelpline", null, "Kisan Call Center (Toll-Free)")}</small>
                    <a href="tel:18001801551" className="helpline-num">1800-180-1551</a>
                    <p>Free 24/7 expert agricultural advice in Indian regional languages.</p>
                  </div>
                </div>

                <div className="faq-list">
                  <div className="faq-item">
                    <strong>{t("starterDisease", null, "How can I protect my crops from disease?")}</strong>
                    <p>{t("protectSubtitle", null, "Upload a clear photo of leaves showing symptoms. AgroMitr AI identifies visible signs and recommends practical, safe steps.")}</p>
                  </div>
                  <div className="faq-item">
                    <strong>{t("starterGrowth", null, "How can I improve plant growth naturally?")}</strong>
                    <p>{t("insightText", null, "Maintain soil organic matter, balance irrigation with weather forecasts, and check crops regularly for early pest signs.")}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. ABOUT AGROMITR SECTION */}
            {activeSection === "about" && (
              <div className="settings-card">
                <div className="about-hero">
                  <div className="about-logo">🌱</div>
                  <h2>AgroMitR</h2>
                  <span className="about-version">{t("version", null, "Version 1.0.0")}</span>
                  <p className="about-desc">
                    {t("aboutDesc", null, "AI-Powered Early Crop Health Diagnosis & Farm Advisory System")}
                  </p>
                </div>
                <div className="about-features">
                  <div className="feature-chip">🔬 {t("diseaseTitle", null, "Disease Detection")}</div>
                  <div className="feature-chip">🐛 {t("pestTitle", null, "Pest Identification")}</div>
                  <div className="feature-chip">🌦️ {t("weather", null, "Weather Intelligence")}</div>
                  <div className="feature-chip">🤖 {t("chat", null, "AI Farm Assistant")}</div>
                  <div className="feature-chip">🌐 {t("chooseLanguage", null, "Multilingual Support")}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LOGOUT CONFIRMATION MODAL */}
        {showLogoutConfirm && (
          <div className="modal-overlay">
            <div className="modal-card">
              <span className="modal-icon">🚪</span>
              <h3>{t("logout", null, "Logout")}</h3>
              <p>{t("logoutConfirm", null, "Are you sure you want to log out?")}</p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  {t("cancel", null, "Cancel")}
                </button>
                <button
                  type="button"
                  className="modal-confirm-btn"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    if (onLogout) onLogout();
                  }}
                >
                  {t("logout", null, "Logout")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
