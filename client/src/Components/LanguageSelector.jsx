import React, { useState, useEffect, useRef } from "react";
import { Globe } from "lucide-react";

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("EN");
  const dropdownRef = useRef(null);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸", display: "EN" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳", display: "HI" },
    { code: "mr", name: "मराठी", flag: "🇮🇳", display: "MR" },
    { code: "gu", name: "ગુજરાતી", flag: "🇮🇳", display: "GU" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳", display: "TA" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳", display: "TE" },
    { code: "bn", name: "বাংলা", flag: "🇮🇳", display: "BN" },
    { code: "pa", name: "ਪੰਜਾਬੀ", flag: "🇮🇳", display: "PA" },
    { code: "ur", name: "اردو", flag: "🇵🇰", display: "UR" },
    { code: "es", name: "Español", flag: "🇪🇸", display: "ES" },
    { code: "fr", name: "Français", flag: "🇫🇷", display: "FR" },
    { code: "ar", name: "العربية", flag: "🇸🇦", display: "AR" },
    { code: "zh", name: "中文", flag: "🇨🇳", display: "ZH" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check for Google Translate availability
  useEffect(() => {
    const checkGoogleTranslate = () => {
      const gtElement = document.querySelector("#google_translate_element");
      const gtCombo = document.querySelector(".goog-te-combo");

      console.log("Google Translate element:", gtElement);
      console.log("Google Translate combo:", gtCombo);

      if (gtCombo && gtCombo.options.length > 1) {
        console.log(
          "Google Translate is ready with",
          gtCombo.options.length,
          "languages"
        );
      } else {
        console.log("Google Translate not ready yet, will retry...");
        setTimeout(checkGoogleTranslate, 1000);
      }
    };

    // Wait a bit for Google Translate to load
    setTimeout(checkGoogleTranslate, 2000);
  }, []);

  // Google Translate function - Enhanced
  const translatePage = (langCode) => {
    console.log("Attempting to translate to:", langCode);

    // Method 1: Try to find and use the Google Translate combo box
    let selectElement = document.querySelector(".goog-te-combo");

    if (selectElement) {
      console.log(
        "Found Google Translate element, setting value to:",
        langCode
      );
      selectElement.value = langCode;
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    // Method 2: Wait for Google Translate to load and try again
    let attempts = 0;
    const maxAttempts = 10;

    const waitForGoogleTranslate = () => {
      attempts++;
      selectElement = document.querySelector(".goog-te-combo");

      if (selectElement && selectElement.options.length > 1) {
        console.log(
          `Found Google Translate element after ${attempts} attempts`
        );
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (attempts < maxAttempts) {
        console.log(`Waiting for Google Translate... attempt ${attempts}`);
        setTimeout(waitForGoogleTranslate, 500);
      } else {
        console.error("Google Translate not found after maximum attempts");
        // Method 3: Force reload Google Translate
        window.location.href = `#googtrans(en|${langCode})`;
        window.location.reload();
      }
    };

    waitForGoogleTranslate();
  };

  const handleLanguageChange = (language) => {
    setCurrentLang(language.display);
    setIsOpen(false);
    translatePage(language.code);

    // Hide any banner elements that might appear after translation
    setTimeout(() => {
      if (window.hideBannerElements) {
        window.hideBannerElements();
      }
    }, 1000);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full border-2 hover:opacity-80 transition-all duration-200"
        style={{
          backgroundColor: "#EBD3F8",
          borderColor: "#AD49E1",
          color: "#7A1CAC",
        }}
      >
        <Globe className="w-4 h-4" style={{ color: "#7A1CAC" }} />
        <span className="nav-link text-sm" style={{ color: "#7A1CAC" }}>
          {currentLang}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: "#7A1CAC" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl border z-50 max-h-80 overflow-y-auto"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#EBD3F8" }}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language)}
              className={`w-full px-4 py-3 text-left hover:opacity-80 flex items-center gap-3 transition-colors duration-150 ${
                currentLang === language.display ? "border-r-4" : ""
              }`}
              style={{
                backgroundColor:
                  currentLang === language.display ? "#EBD3F8" : "transparent",
                borderRightColor:
                  currentLang === language.display ? "#7A1CAC" : "transparent",
              }}
            >
              <span className="text-lg">{language.flag}</span>
              <div className="flex-1">
                <div className="nav-link text-sm" style={{ color: "#7A1CAC" }}>
                  {language.name}
                </div>
                <div
                  className="caption text-xs"
                  style={{ color: "#7A1CAC", opacity: 0.7 }}
                >
                  {language.display}
                </div>
              </div>
              {currentLang === language.display && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#7A1CAC" }}
                ></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
