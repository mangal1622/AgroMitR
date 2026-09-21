import React, { useState } from "react";
import { SUPPORTED_LANGUAGES, useTranslation } from "../i18n/LanguageContext";
import "./LanguageSelect.css";

const GREETINGS = {
  en: "Welcome to AgroMitR",
  hi: "एग्रोमित्र में आपका स्वागत है",
  mr: "ॲग्रोमित्र मध्ये आपले स्वागत आहे",
  ta: "அக்ரோமித்ராவிற்கு நல்வரவு",
  te: "అగ్రోమిత్రకు స్వాగతం",
  kn: "ಅಗ್ರೋಮಿತ್ರಕ್ಕೆ ಸುಸ್ವಾಗತ",
  ml: "അഗ്രോമിത്രയിലേക്ക് സ്വാഗതം",
  bn: "অ্যাগ্রোমিত্রে স্বাগতম",
  gu: "એગ્રોમિત્રમાં આપનું સ્વાગત છે",
  pa: "ਐਗਰੋਮਿੱਤਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ",
};

const SUBTITLES = {
  en: "Select your preferred language. You can change it anytime from Settings.",
  hi: "अपनी पसंदीदा भाषा चुनें। आप इसे बाद में सेटिंग्स से कभी भी बदल सकते हैं।",
  mr: "आपली पसंतीची भाषा निवडा. आपण नंतर सेटिंग्जमधून कधीही बदलू शकता.",
  ta: "உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும். பின்னர் அமைப்புகளில் மாற்றலாம்.",
  te: "మీ ప్రాధాన్యత గల భాషను ఎంచుకోండి. తర్వాత సెట్టింగ్‌ల నుండి ఎప్పుడైనా మార్చవచ్చు.",
  kn: "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನಂತರ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಬದಲಾಯಿಸಬಹುದು.",
  ml: "നിങ്ങൾക്ക് ഇഷ്ടപ്പെട്ട ഭാഷ തിരഞ്ഞെടുക്കുക. ക്രമീകരണങ്ങളിൽ നിന്ന് പിന്നീട് മാറ്റാം.",
  bn: "আপনার পছন্দের ভাষা নির্বাচন করুন। আপনি পরে সেটিংস থেকে এটি পরিবর্তন করতে পারেন।",
  gu: "તમારી પસંદગીની ભાષા પસંદ કરો. તમે તેને સેટિંગ્સમાંથી કોઈપણ સમયે બદલી શકો છો.",
  pa: "ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ। ਤੁਸੀਂ ਇਸਨੂੰ ਬਾਅਦ ਵਿੱਚ ਸੈਟਿੰਗਾਂ ਤੋਂ ਕਦੇ ਵੀ ਬਦਲ ਸਕਦੇ ਹੋ।",
};

const CONTINUE_LABELS = {
  en: "Continue",
  hi: "आगे बढ़ें",
  mr: "पुढे चालू ठेवा",
  ta: "தொடரவும்",
  te: "కొనసాగించండి",
  kn: "ಮುಂದುವರಿಯಿರಿ",
  ml: "തുടരുക",
  bn: "এগিয়ে যান",
  gu: "આગળ વધો",
  pa: "ਜਾਰੀ ਰੱਖੋ",
};

export default function LanguageSelect({ onLanguageSelected }) {
  const { setLanguage } = useTranslation();
  const [selected, setSelected] = useState("mr"); // Default highlight to Marathi as a friendly regional option

  const handleSelect = (code) => {
    setSelected(code);
  };

  const handleContinue = () => {
    setLanguage(selected);
    if (onLanguageSelected) {
      onLanguageSelected(selected);
    }
  };

  return (
    <div className="language-select-page">
      <div className="language-select-card">
        {/* BRAND LOGO */}
        <div className="language-select-header">
          <div className="language-brand-logo">🌱</div>
          <h1>AgroMitR</h1>
          <h2 className="greeting-text">{GREETINGS[selected] || GREETINGS.en}</h2>
          <p className="language-select-subtitle">
            {SUBTITLES[selected] || SUBTITLES.en}
          </p>
        </div>

        {/* LANGUAGE GRID */}
        <div className="language-grid" role="radiogroup" aria-label="Language selection">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                type="button"
                key={lang.code}
                role="radio"
                aria-checked={isSelected}
                className={`language-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(lang.code)}
              >
                <div className="language-card-top">
                  <span className="language-native">{lang.nativeName}</span>
                  <span className="language-check">{isSelected ? "✓" : ""}</span>
                </div>
                <div className="language-card-bottom">
                  <span className="language-english">{lang.name}</span>
                  <span className="language-icon">{lang.flag}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* FOOTER NOTICE & CONTINUE BUTTON */}
        <div className="language-select-footer">
          <p className="setting-reminder">
            ⚙️ {selected === "en" ? "You can easily change language anytime from Settings." : "તમે/तुम्ही/మీరు સેટિંગ્સમાંથી કોઈપણ સમયે ભાષા બદલી શકો છો."}
          </p>
          <button
            type="button"
            className="language-continue-btn"
            onClick={handleContinue}
          >
            <span>{CONTINUE_LABELS[selected] || "Continue"}</span>
            <span className="continue-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
