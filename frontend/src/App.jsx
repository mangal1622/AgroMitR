import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";
import Weather from "./Weather";
import Chat from "./Chat";

const API_URL = "http://127.0.0.1:8000";

const getImageUrl = (filename) => {
  if (!filename) return null;
  return `${API_URL}/uploads/${filename}`;
};


// ============================================================
// LANGUAGES
// ============================================================

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "mr", name: "मराठी" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "bn", name: "বাংলা" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
];


// ============================================================
// UI TEXT
// ============================================================

const UI_TEXT = {
  en: {
    smartCropHealth: "SMART CROP HEALTH",
    heroTitle1: "Detect crop problems",
    heroTitle2: " before they spread.",
    subtitle:
      "Upload a crop or leaf image and our AI will analyze visible diseases, pests and plant-health symptoms.",
    cropDiagnosis: "Crop Diagnosis",
    uploadDescription: "Upload a clear image of the affected plant.",
    uploadCrop: "Upload crop image",
    imageTypes: "JPG, PNG or WEBP",
    chooseAnother: "Choose another image",
    analyzeCrop: "Analyze Crop",
    analyzing: "Analyzing crop...",
    aiAnalysisComplete: "AI ANALYSIS COMPLETE",
    diagnosisResult: "Diagnosis Result",
    confidence: "confidence",
    detectedCrop: "Detected crop",
    possibleCondition: "Possible condition",
    observedSymptoms: "Observed Symptoms",
    noSymptoms: "No specific symptoms were returned.",
    aiExplanation: "AI Explanation",
    noExplanation: "No explanation was provided.",
    recommendedActions: "Recommended Actions",
    noRecommendations: "No recommendations were provided.",
    expertReview: "Expert review recommended",
    expertDescription:
      "Consider consulting an agricultural expert before taking action.",
    savedDiagnosis: "SAVED DIAGNOSIS",
    diagnosisDetails: "Diagnosis Details",
    backHistory: "Back to History",
    caseId: "Case ID",
    expertRequired: "Required",
    expertNotRequired: "Not required",
    yourRecords: "YOUR RECORDS",
    recentDiagnoses: "Recent Diagnoses",
    case: "case",
    cases: "cases",
    loadingHistory: "Loading diagnosis history...",
    noDiagnoses: "No diagnoses yet",
    firstDiagnosis:
      "Upload a crop image to create your first diagnosis record.",
    unknown: "Unknown",
    unknownCrop: "Unknown crop",
    unknownProblem: "Unknown problem",
    noDiagnosis: "No diagnosis",
    dateUnavailable: "Date unavailable",
    severity: "Severity",
    language: "Language",
    translating: "Translating...",
    systemOnline: "AI System Online",
    footer: "AgroMitR • Early Detection & Management",
  },

  hi: {
    smartCropHealth: "स्मार्ट फसल स्वास्थ्य",
    heroTitle1: "फसल की समस्याओं का पता लगाएं",
    heroTitle2: " फैलने से पहले।",
    subtitle:
      "फसल या पत्ते की तस्वीर अपलोड करें और हमारा AI दिखाई देने वाले रोगों, कीटों और पौधों के स्वास्थ्य संबंधी लक्षणों का विश्लेषण करेगा।",
    cropDiagnosis: "फसल निदान",
    uploadDescription: "प्रभावित पौधे की स्पष्ट तस्वीर अपलोड करें।",
    uploadCrop: "फसल की तस्वीर अपलोड करें",
    imageTypes: "JPG, PNG या WEBP",
    chooseAnother: "दूसरी तस्वीर चुनें",
    analyzeCrop: "फसल का विश्लेषण करें",
    analyzing: "फसल का विश्लेषण हो रहा है...",
    aiAnalysisComplete: "AI विश्लेषण पूरा",
    diagnosisResult: "निदान परिणाम",
    confidence: "विश्वास",
    detectedCrop: "पहचानी गई फसल",
    possibleCondition: "संभावित समस्या",
    observedSymptoms: "देखे गए लक्षण",
    noSymptoms: "कोई विशेष लक्षण नहीं मिले।",
    aiExplanation: "AI व्याख्या",
    noExplanation: "कोई व्याख्या उपलब्ध नहीं है।",
    recommendedActions: "अनुशंसित कार्य",
    noRecommendations: "कोई अनुशंसा उपलब्ध नहीं है।",
    expertReview: "विशेषज्ञ समीक्षा आवश्यक",
    expertDescription:
      "कार्रवाई करने से पहले कृषि विशेषज्ञ से सलाह लेने पर विचार करें।",
    savedDiagnosis: "सहेजा गया निदान",
    diagnosisDetails: "निदान विवरण",
    backHistory: "इतिहास पर वापस जाएं",
    caseId: "केस ID",
    expertRequired: "आवश्यक",
    expertNotRequired: "आवश्यक नहीं",
    yourRecords: "आपके रिकॉर्ड",
    recentDiagnoses: "हाल के निदान",
    case: "केस",
    cases: "केस",
    loadingHistory: "निदान इतिहास लोड हो रहा है...",
    noDiagnoses: "अभी तक कोई निदान नहीं",
    firstDiagnosis:
      "अपना पहला निदान रिकॉर्ड बनाने के लिए फसल की तस्वीर अपलोड करें।",
    unknown: "अज्ञात",
    unknownCrop: "अज्ञात फसल",
    unknownProblem: "अज्ञात समस्या",
    noDiagnosis: "कोई निदान नहीं",
    dateUnavailable: "तारीख उपलब्ध नहीं",
    severity: "गंभीरता",
    language: "भाषा",
    translating: "अनुवाद हो रहा है...",
    systemOnline: "AI सिस्टम ऑनलाइन",
    footer: "AgroMitR • प्रारंभिक पहचान और प्रबंधन",
  },

  kn: {
    smartCropHealth: "ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಆರೋಗ್ಯ",
    heroTitle1: "ಬೆಳೆ ಸಮಸ್ಯೆಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ",
    heroTitle2: " ಹರಡುವ ಮೊದಲು.",
    subtitle:
      "ಬೆಳೆ ಅಥವಾ ಎಲೆಯ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ನಮ್ಮ AI ರೋಗಗಳು, ಕೀಟಗಳು ಮತ್ತು ಸಸ್ಯದ ಆರೋಗ್ಯದ ಲಕ್ಷಣಗಳನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತದೆ.",
    cropDiagnosis: "ಬೆಳೆ ರೋಗನಿರ್ಣಯ",
    uploadDescription: "ಪೀಡಿತ ಸಸ್ಯದ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    uploadCrop: "ಬೆಳೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    imageTypes: "JPG, PNG ಅಥವಾ WEBP",
    chooseAnother: "ಮತ್ತೊಂದು ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ",
    analyzeCrop: "ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ಬೆಳೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    aiAnalysisComplete: "AI ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ",
    diagnosisResult: "ರೋಗನಿರ್ಣಯ ಫಲಿತಾಂಶ",
    confidence: "ವಿಶ್ವಾಸ",
    detectedCrop: "ಪತ್ತೆಯಾದ ಬೆಳೆ",
    possibleCondition: "ಸಂಭಾವ್ಯ ಸಮಸ್ಯೆ",
    observedSymptoms: "ಗಮನಿಸಿದ ಲಕ್ಷಣಗಳು",
    noSymptoms: "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    aiExplanation: "AI ವಿವರಣೆ",
    noExplanation: "ಯಾವುದೇ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ.",
    recommendedActions: "ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮಗಳು",
    noRecommendations: "ಯಾವುದೇ ಶಿಫಾರಸುಗಳಿಲ್ಲ.",
    expertReview: "ತಜ್ಞರ ಪರಿಶೀಲನೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
    expertDescription:
      "ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ಕೃಷಿ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸುವುದನ್ನು ಪರಿಗಣಿಸಿ.",
    savedDiagnosis: "ಉಳಿಸಿದ ರೋಗನಿರ್ಣಯ",
    diagnosisDetails: "ರೋಗನಿರ್ಣಯ ವಿವರಗಳು",
    backHistory: "ಇತಿಹಾಸಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    caseId: "ಕೇಸ್ ID",
    expertRequired: "ಅಗತ್ಯ",
    expertNotRequired: "ಅಗತ್ಯವಿಲ್ಲ",
    yourRecords: "ನಿಮ್ಮ ದಾಖಲೆಗಳು",
    recentDiagnoses: "ಇತ್ತೀಚಿನ ರೋಗನಿರ್ಣಯಗಳು",
    case: "ಕೇಸ್",
    cases: "ಕೇಸ್‌ಗಳು",
    loadingHistory: "ರೋಗನಿರ್ಣಯ ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    noDiagnoses: "ಇನ್ನೂ ಯಾವುದೇ ರೋಗನಿರ್ಣಯಗಳಿಲ್ಲ",
    firstDiagnosis:
      "ನಿಮ್ಮ ಮೊದಲ ರೋಗನಿರ್ಣಯ ದಾಖಲೆಯನ್ನು ರಚಿಸಲು ಬೆಳೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    unknown: "ಅಜ್ಞಾತ",
    unknownCrop: "ಅಜ್ಞಾತ ಬೆಳೆ",
    unknownProblem: "ಅಜ್ಞಾತ ಸಮಸ್ಯೆ",
    noDiagnosis: "ಯಾವುದೇ ರೋಗನಿರ್ಣಯವಿಲ್ಲ",
    dateUnavailable: "ದಿನಾಂಕ ಲಭ್ಯವಿಲ್ಲ",
    severity: "ತೀವ್ರತೆ",
    language: "ಭಾಷೆ",
    translating: "ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...",
    systemOnline: "AI ಸಿಸ್ಟಮ್ ಆನ್‌ಲೈನ್",
    footer: "AgroMitR • ಆರಂಭಿಕ ಪತ್ತೆ ಮತ್ತು ನಿರ್ವಹಣೆ",
  },

  mr: {
    smartCropHealth: "स्मार्ट पीक आरोग्य",
    heroTitle1: "पिकांच्या समस्या शोधा",
    heroTitle2: " पसरण्यापूर्वी.",
    subtitle:
      "पिकाची किंवा पानाची प्रतिमा अपलोड करा आणि आमचे AI रोग, कीड आणि वनस्पतींच्या आरोग्याशी संबंधित लक्षणांचे विश्लेषण करेल.",
    cropDiagnosis: "पीक निदान",
    uploadDescription: "प्रभावित झाडाची स्पष्ट प्रतिमा अपलोड करा.",
    uploadCrop: "पिकाची प्रतिमा अपलोड करा",
    imageTypes: "JPG, PNG किंवा WEBP",
    chooseAnother: "दुसरी प्रतिमा निवडा",
    analyzeCrop: "पिकाचे विश्लेषण करा",
    analyzing: "पिकाचे विश्लेषण होत आहे...",
    aiAnalysisComplete: "AI विश्लेषण पूर्ण",
    diagnosisResult: "निदान परिणाम",
    confidence: "विश्वास",
    detectedCrop: "ओळखलेले पीक",
    possibleCondition: "संभाव्य समस्या",
    observedSymptoms: "दिसून आलेली लक्षणे",
    noSymptoms: "कोणतीही विशिष्ट लक्षणे आढळली नाहीत.",
    aiExplanation: "AI स्पष्टीकरण",
    noExplanation: "कोणतेही स्पष्टीकरण उपलब्ध नाही.",
    recommendedActions: "शिफारस केलेल्या कृती",
    noRecommendations: "कोणत्याही शिफारसी उपलब्ध नाहीत.",
    expertReview: "तज्ञांच्या तपासणीची शिफारस",
    expertDescription:
      "कृती करण्यापूर्वी कृषी तज्ञांचा सल्ला घेण्याचा विचार करा.",
    savedDiagnosis: "जतन केलेले निदान",
    diagnosisDetails: "निदान तपशील",
    backHistory: "इतिहासाकडे परत जा",
    caseId: "केस ID",
    expertRequired: "आवश्यक",
    expertNotRequired: "आवश्यक नाही",
    yourRecords: "तुमचे रेकॉर्ड",
    recentDiagnoses: "अलीकडील निदान",
    case: "केस",
    cases: "केसेस",
    loadingHistory: "निदान इतिहास लोड होत आहे...",
    noDiagnoses: "अद्याप कोणतेही निदान नाही",
    firstDiagnosis:
      "तुमचा पहिला निदान रेकॉर्ड तयार करण्यासाठी पिकाची प्रतिमा अपलोड करा.",
    unknown: "अज्ञात",
    unknownCrop: "अज्ञात पीक",
    unknownProblem: "अज्ञात समस्या",
    noDiagnosis: "निदान उपलब्ध नाही",
    dateUnavailable: "तारीख उपलब्ध नाही",
    severity: "तीव्रता",
    language: "भाषा",
    translating: "भाषांतर होत आहे...",
    systemOnline: "AI सिस्टम ऑनलाइन",
    footer: "AgroMitR • लवकर ओळख आणि व्यवस्थापन",
  },

  ta: {
    smartCropHealth: "ஸ்மார்ட் பயிர் ஆரோக்கியம்",
    heroTitle1: "பயிர் பிரச்சினைகளை கண்டறியுங்கள்",
    heroTitle2: " பரவுவதற்கு முன்.",
    subtitle:
      "பயிர் அல்லது இலையின் படத்தை பதிவேற்றுங்கள். எங்கள் AI நோய்கள், பூச்சிகள் மற்றும் தாவர ஆரோக்கிய அறிகுறிகளை பகுப்பாய்வு செய்யும்.",
    cropDiagnosis: "பயிர் நோயறிதல்",
    uploadDescription: "பாதிக்கப்பட்ட தாவரத்தின் தெளிவான படத்தை பதிவேற்றுங்கள்.",
    uploadCrop: "பயிர் படத்தை பதிவேற்றவும்",
    imageTypes: "JPG, PNG அல்லது WEBP",
    chooseAnother: "வேறு படத்தைத் தேர்ந்தெடுக்கவும்",
    analyzeCrop: "பயிரை பகுப்பாய்வு செய்யவும்",
    analyzing: "பயிர் பகுப்பாய்வு செய்யப்படுகிறது...",
    aiAnalysisComplete: "AI பகுப்பாய்வு முடிந்தது",
    diagnosisResult: "நோயறிதல் முடிவு",
    confidence: "நம்பிக்கை",
    detectedCrop: "கண்டறியப்பட்ட பயிர்",
    possibleCondition: "சாத்தியமான பிரச்சினை",
    observedSymptoms: "காணப்பட்ட அறிகுறிகள்",
    noSymptoms: "குறிப்பிட்ட அறிகுறிகள் எதுவும் இல்லை.",
    aiExplanation: "AI விளக்கம்",
    noExplanation: "விளக்கம் எதுவும் இல்லை.",
    recommendedActions: "பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்",
    noRecommendations: "பரிந்துரைகள் எதுவும் இல்லை.",
    expertReview: "நிபுணர் பரிசோதனை பரிந்துரைக்கப்படுகிறது",
    expertDescription:
      "நடவடிக்கை எடுப்பதற்கு முன் வேளாண் நிபுணரை அணுகவும்.",
    savedDiagnosis: "சேமிக்கப்பட்ட நோயறிதல்",
    diagnosisDetails: "நோயறிதல் விவரங்கள்",
    backHistory: "வரலாற்றுக்குத் திரும்பு",
    caseId: "வழக்கு ID",
    expertRequired: "தேவை",
    expertNotRequired: "தேவையில்லை",
    yourRecords: "உங்கள் பதிவுகள்",
    recentDiagnoses: "சமீபத்திய நோயறிதல்கள்",
    case: "வழக்கு",
    cases: "வழக்குகள்",
    loadingHistory: "நோயறிதல் வரலாறு ஏற்றப்படுகிறது...",
    noDiagnoses: "இன்னும் நோயறிதல்கள் இல்லை",
    firstDiagnosis:
      "உங்கள் முதல் நோயறிதல் பதிவை உருவாக்க பயிர் படத்தை பதிவேற்றுங்கள்.",
    unknown: "தெரியவில்லை",
    unknownCrop: "தெரியாத பயிர்",
    unknownProblem: "தெரியாத பிரச்சினை",
    noDiagnosis: "நோயறிதல் இல்லை",
    dateUnavailable: "தேதி இல்லை",
    severity: "தீவிரம்",
    language: "மொழி",
    translating: "மொழிபெயர்க்கப்படுகிறது...",
    systemOnline: "AI அமைப்பு ஆன்லைனில் உள்ளது",
    footer: "AgroMitR • ஆரம்ப கண்டறிதல் மற்றும் மேலாண்மை",
  },

  te: {
    smartCropHealth: "స్మార్ట్ పంట ఆరోగ్యం",
    heroTitle1: "పంట సమస్యలను గుర్తించండి",
    heroTitle2: " వ్యాపించే ముందు.",
    subtitle:
      "పంట లేదా ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి. మా AI వ్యాధులు, పురుగులు మరియు మొక్కల ఆరోగ్య లక్షణాలను విశ్లేషిస్తుంది.",
    cropDiagnosis: "పంట నిర్ధారణ",
    uploadDescription: "ప్రభావిత మొక్క యొక్క స్పష్టమైన చిత్రాన్ని అప్‌లోడ్ చేయండి.",
    uploadCrop: "పంట చిత్రాన్ని అప్‌లోడ్ చేయండి",
    imageTypes: "JPG, PNG లేదా WEBP",
    chooseAnother: "మరొక చిత్రాన్ని ఎంచుకోండి",
    analyzeCrop: "పంటను విశ్లేషించండి",
    analyzing: "పంటను విశ్లేషిస్తోంది...",
    aiAnalysisComplete: "AI విశ్లేషణ పూర్తయింది",
    diagnosisResult: "నిర్ధారణ ఫలితం",
    confidence: "నమ్మకం",
    detectedCrop: "గుర్తించిన పంట",
    possibleCondition: "సంభావ్య సమస్య",
    observedSymptoms: "గమనించిన లక్షణాలు",
    noSymptoms: "ప్రత్యేక లక్షణాలు ఏవీ కనుగొనబడలేదు.",
    aiExplanation: "AI వివరణ",
    noExplanation: "వివరణ అందుబాటులో లేదు.",
    recommendedActions: "సిఫార్సు చేసిన చర్యలు",
    noRecommendations: "సిఫార్సులు ఏవీ లేవు.",
    expertReview: "నిపుణుల సమీక్ష సిఫార్సు చేయబడింది",
    expertDescription:
      "చర్య తీసుకునే ముందు వ్యవసాయ నిపుణుడిని సంప్రదించండి.",
    savedDiagnosis: "సేవ్ చేసిన నిర్ధారణ",
    diagnosisDetails: "నిర్ధారణ వివరాలు",
    backHistory: "చరిత్రకు తిరిగి వెళ్లండి",
    caseId: "కేస్ ID",
    expertRequired: "అవసరం",
    expertNotRequired: "అవసరం లేదు",
    yourRecords: "మీ రికార్డులు",
    recentDiagnoses: "ఇటీవలి నిర్ధారణలు",
    case: "కేస్",
    cases: "కేసులు",
    loadingHistory: "నిర్ధారణ చరిత్ర లోడ్ అవుతోంది...",
    noDiagnoses: "ఇంకా నిర్ధారణలు లేవు",
    firstDiagnosis:
      "మీ మొదటి నిర్ధారణ రికార్డును సృష్టించడానికి పంట చిత్రాన్ని అప్‌లోడ్ చేయండి.",
    unknown: "తెలియదు",
    unknownCrop: "తెలియని పంట",
    unknownProblem: "తెలియని సమస్య",
    noDiagnosis: "నిర్ధారణ లేదు",
    dateUnavailable: "తేదీ అందుబాటులో లేదు",
    severity: "తీవ్రత",
    language: "భాష",
    translating: "అనువదిస్తోంది...",
    systemOnline: "AI సిస్టమ్ ఆన్‌లైన్‌లో ఉంది",
    footer: "AgroMitR • ముందస్తు గుర్తింపు మరియు నిర్వహణ",
  },

  ml: {
    smartCropHealth: "സ്മാർട്ട് വിള ആരോഗ്യം",
    heroTitle1: "വിള പ്രശ്നങ്ങൾ കണ്ടെത്തുക",
    heroTitle2: " പടരുന്നതിന് മുമ്പ്.",
    subtitle:
      "വിളയുടെയോ ഇലയുടെയോ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക. ഞങ്ങളുടെ AI രോഗങ്ങൾ, കീടങ്ങൾ, സസ്യാരോഗ്യ ലക്ഷണങ്ങൾ എന്നിവ വിശകലനം ചെയ്യും.",
    cropDiagnosis: "വിള രോഗനിർണയം",
    uploadDescription: "ബാധിച്ച ചെടിയുടെ വ്യക്തമായ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.",
    uploadCrop: "വിള ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
    imageTypes: "JPG, PNG അല്ലെങ്കിൽ WEBP",
    chooseAnother: "മറ്റൊരു ചിത്രം തിരഞ്ഞെടുക്കുക",
    analyzeCrop: "വിള വിശകലനം ചെയ്യുക",
    analyzing: "വിള വിശകലനം ചെയ്യുന്നു...",
    aiAnalysisComplete: "AI വിശകലനം പൂർത്തിയായി",
    diagnosisResult: "രോഗനിർണയ ഫലം",
    confidence: "വിശ്വാസ്യത",
    detectedCrop: "കണ്ടെത്തിയ വിള",
    possibleCondition: "സാധ്യമായ പ്രശ്നം",
    observedSymptoms: "കണ്ടെത്തിയ ലക്ഷണങ്ങൾ",
    noSymptoms: "പ്രത്യേക ലക്ഷണങ്ങളൊന്നും കണ്ടെത്തിയില്ല.",
    aiExplanation: "AI വിശദീകരണം",
    noExplanation: "വിശദീകരണം ലഭ്യമല്ല.",
    recommendedActions: "ശുപാർശ ചെയ്യുന്ന നടപടികൾ",
    noRecommendations: "ശുപാർശകളൊന്നുമില്ല.",
    expertReview: "വിദഗ്ധ പരിശോധന ശുപാർശ ചെയ്യുന്നു",
    expertDescription:
      "നടപടി സ്വീകരിക്കുന്നതിന് മുമ്പ് കാർഷിക വിദഗ്ധനെ സമീപിക്കുക.",
    savedDiagnosis: "സംരക്ഷിച്ച രോഗനിർണയം",
    diagnosisDetails: "രോഗനിർണയ വിശദാംശങ്ങൾ",
    backHistory: "ചരിത്രത്തിലേക്ക് മടങ്ങുക",
    caseId: "കേസ് ID",
    expertRequired: "ആവശ്യമാണ്",
    expertNotRequired: "ആവശ്യമില്ല",
    yourRecords: "നിങ്ങളുടെ രേഖകൾ",
    recentDiagnoses: "സമീപകാല രോഗനിർണയങ്ങൾ",
    case: "കേസ്",
    cases: "കേസുകൾ",
    loadingHistory: "രോഗനിർണയ ചരിത്രം ലോഡ് ചെയ്യുന്നു...",
    noDiagnoses: "ഇതുവരെ രോഗനിർണയങ്ങളില്ല",
    firstDiagnosis:
      "നിങ്ങളുടെ ആദ്യ രോഗനിർണയ രേഖ സൃഷ്ടിക്കാൻ വിള ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.",
    unknown: "അജ്ഞാതം",
    unknownCrop: "അജ്ഞാത വിള",
    unknownProblem: "അജ്ഞാത പ്രശ്നം",
    noDiagnosis: "രോഗനിർണയമില്ല",
    dateUnavailable: "തീയതി ലഭ്യമല്ല",
    severity: "തീവ്രത",
    language: "ഭാഷ",
    translating: "വിവർത്തനം ചെയ്യുന്നു...",
    systemOnline: "AI സിസ്റ്റം ഓൺലൈനിലാണ്",
    footer: "AgroMitR • നേരത്തെയുള്ള കണ്ടെത്തലും മാനേജ്മെന്റും",
  },

  bn: {
    smartCropHealth: "স্মার্ট ফসল স্বাস্থ্য",
    heroTitle1: "ফসলের সমস্যা শনাক্ত করুন",
    heroTitle2: " ছড়িয়ে পড়ার আগে।",
    subtitle:
      "ফসল বা পাতার ছবি আপলোড করুন এবং আমাদের AI দৃশ্যমান রোগ, পোকামাকড় ও উদ্ভিদের স্বাস্থ্যগত লক্ষণ বিশ্লেষণ করবে।",
    cropDiagnosis: "ফসল নির্ণয়",
    uploadDescription: "আক্রান্ত গাছের একটি পরিষ্কার ছবি আপলোড করুন।",
    uploadCrop: "ফসলের ছবি আপলোড করুন",
    imageTypes: "JPG, PNG অথবা WEBP",
    chooseAnother: "অন্য ছবি নির্বাচন করুন",
    analyzeCrop: "ফসল বিশ্লেষণ করুন",
    analyzing: "ফসল বিশ্লেষণ করা হচ্ছে...",
    aiAnalysisComplete: "AI বিশ্লেষণ সম্পন্ন",
    diagnosisResult: "নির্ণয়ের ফলাফল",
    confidence: "বিশ্বাসযোগ্যতা",
    detectedCrop: "শনাক্ত করা ফসল",
    possibleCondition: "সম্ভাব্য সমস্যা",
    observedSymptoms: "পর্যবেক্ষিত লক্ষণ",
    noSymptoms: "কোনো নির্দিষ্ট লক্ষণ পাওয়া যায়নি।",
    aiExplanation: "AI ব্যাখ্যা",
    noExplanation: "কোনো ব্যাখ্যা দেওয়া হয়নি।",
    recommendedActions: "প্রস্তাবিত পদক্ষেপ",
    noRecommendations: "কোনো সুপারিশ নেই।",
    expertReview: "বিশেষজ্ঞ পর্যালোচনা সুপারিশ করা হচ্ছে",
    expertDescription:
      "কোনো পদক্ষেপ নেওয়ার আগে কৃষি বিশেষজ্ঞের পরামর্শ নিন।",
    savedDiagnosis: "সংরক্ষিত নির্ণয়",
    diagnosisDetails: "নির্ণয়ের বিবরণ",
    backHistory: "ইতিহাসে ফিরে যান",
    caseId: "কেস ID",
    expertRequired: "প্রয়োজন",
    expertNotRequired: "প্রয়োজন নেই",
    yourRecords: "আপনার রেকর্ড",
    recentDiagnoses: "সাম্প্রতিক নির্ণয়",
    case: "কেস",
    cases: "কেস",
    loadingHistory: "নির্ণয়ের ইতিহাস লোড হচ্ছে...",
    noDiagnoses: "এখনও কোনো নির্ণয় নেই",
    firstDiagnosis:
      "আপনার প্রথম নির্ণয় রেকর্ড তৈরি করতে ফসলের ছবি আপলোড করুন।",
    unknown: "অজানা",
    unknownCrop: "অজানা ফসল",
    unknownProblem: "অজানা সমস্যা",
    noDiagnosis: "কোনো নির্ণয় নেই",
    dateUnavailable: "তারিখ পাওয়া যায়নি",
    severity: "তীব্রতা",
    language: "ভাষা",
    translating: "অনুবাদ করা হচ্ছে...",
    systemOnline: "AI সিস্টেম অনলাইন",
    footer: "AgroMitR • প্রাথমিক শনাক্তকরণ ও ব্যবস্থাপনা",
  },

  gu: {
    smartCropHealth: "સ્માર્ટ પાક આરોગ્ય",
    heroTitle1: "પાકની સમસ્યાઓ શોધો",
    heroTitle2: " ફેલાય તે પહેલાં.",
    subtitle:
      "પાક અથવા પાંદડાની છબી અપલોડ કરો અને અમારું AI રોગો, જીવાતો અને છોડના આરોગ્યના લક્ષણોનું વિશ્લેષણ કરશે.",
    cropDiagnosis: "પાક નિદાન",
    uploadDescription: "અસરગ્રસ્ત છોડની સ્પષ્ટ છબી અપલોડ કરો.",
    uploadCrop: "પાકની છબી અપલોડ કરો",
    imageTypes: "JPG, PNG અથવા WEBP",
    chooseAnother: "બીજી છબી પસંદ કરો",
    analyzeCrop: "પાકનું વિશ્લેષણ કરો",
    analyzing: "પાકનું વિશ્લેષણ થઈ રહ્યું છે...",
    aiAnalysisComplete: "AI વિશ્લેષણ પૂર્ણ",
    diagnosisResult: "નિદાન પરિણામ",
    confidence: "વિશ્વાસ",
    detectedCrop: "ઓળખાયેલ પાક",
    possibleCondition: "સંભવિત સમસ્યા",
    observedSymptoms: "જોવાયેલા લક્ષણો",
    noSymptoms: "કોઈ ચોક્કસ લક્ષણો મળ્યા નથી.",
    aiExplanation: "AI સમજૂતી",
    noExplanation: "કોઈ સમજૂતી ઉપલબ્ધ નથી.",
    recommendedActions: "ભલામણ કરેલ પગલાં",
    noRecommendations: "કોઈ ભલામણો નથી.",
    expertReview: "નિષ્ણાતની સમીક્ષા ભલામણ કરેલ છે",
    expertDescription:
      "પગલાં લેતા પહેલાં કૃષિ નિષ્ણાતની સલાહ લેવાનું વિચારો.",
    savedDiagnosis: "સાચવેલ નિદાન",
    diagnosisDetails: "નિદાન વિગતો",
    backHistory: "ઇતિહાસ પર પાછા જાઓ",
    caseId: "કેસ ID",
    expertRequired: "જરૂરી",
    expertNotRequired: "જરૂરી નથી",
    yourRecords: "તમારા રેકોર્ડ્સ",
    recentDiagnoses: "તાજેતરના નિદાન",
    case: "કેસ",
    cases: "કેસો",
    loadingHistory: "નિદાન ઇતિહાસ લોડ થઈ રહ્યો છે...",
    noDiagnoses: "હજુ સુધી કોઈ નિદાન નથી",
    firstDiagnosis:
      "તમારો પ્રથમ નિદાન રેકોર્ડ બનાવવા માટે પાકની છબી અપલોડ કરો.",
    unknown: "અજ્ઞાત",
    unknownCrop: "અજ્ઞાત પાક",
    unknownProblem: "અજ્ઞાત સમસ્યા",
    noDiagnosis: "કોઈ નિદાન નથી",
    dateUnavailable: "તારીખ ઉપલબ્ધ નથી",
    severity: "તીવ્રતા",
    language: "ભાષા",
    translating: "ભાષાંતર થઈ રહ્યું છે...",
    systemOnline: "AI સિસ્ટમ ઓનલાઈન",
    footer: "AgroMitR • વહેલી ઓળખ અને વ્યવસ્થાપન",
  },

  pa: {
    smartCropHealth: "ਸਮਾਰਟ ਫਸਲ ਸਿਹਤ",
    heroTitle1: "ਫਸਲ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਪਛਾਣੋ",
    heroTitle2: " ਫੈਲਣ ਤੋਂ ਪਹਿਲਾਂ।",
    subtitle:
      "ਫਸਲ ਜਾਂ ਪੱਤੇ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ ਅਤੇ ਸਾਡਾ AI ਬਿਮਾਰੀਆਂ, ਕੀੜਿਆਂ ਅਤੇ ਪੌਦਿਆਂ ਦੀ ਸਿਹਤ ਦੇ ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੇਗਾ।",
    cropDiagnosis: "ਫਸਲ ਨਿਦਾਨ",
    uploadDescription: "ਪ੍ਰਭਾਵਿਤ ਪੌਦੇ ਦੀ ਸਾਫ਼ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ।",
    uploadCrop: "ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ",
    imageTypes: "JPG, PNG ਜਾਂ WEBP",
    chooseAnother: "ਹੋਰ ਤਸਵੀਰ ਚੁਣੋ",
    analyzeCrop: "ਫਸਲ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
    analyzing: "ਫਸਲ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    aiAnalysisComplete: "AI ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ",
    diagnosisResult: "ਨਿਦਾਨ ਨਤੀਜਾ",
    confidence: "ਭਰੋਸਾ",
    detectedCrop: "ਪਛਾਣੀ ਗਈ ਫਸਲ",
    possibleCondition: "ਸੰਭਾਵਿਤ ਸਮੱਸਿਆ",
    observedSymptoms: "ਦੇਖੇ ਗਏ ਲੱਛਣ",
    noSymptoms: "ਕੋਈ ਖਾਸ ਲੱਛਣ ਨਹੀਂ ਮਿਲੇ।",
    aiExplanation: "AI ਵਿਆਖਿਆ",
    noExplanation: "ਕੋਈ ਵਿਆਖਿਆ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।",
    recommendedActions: "ਸਿਫ਼ਾਰਸ਼ ਕੀਤੀਆਂ ਕਾਰਵਾਈਆਂ",
    noRecommendations: "ਕੋਈ ਸਿਫ਼ਾਰਸ਼ਾਂ ਨਹੀਂ ਹਨ।",
    expertReview: "ਮਾਹਿਰ ਦੀ ਸਮੀਖਿਆ ਦੀ ਸਿਫ਼ਾਰਸ਼",
    expertDescription:
      "ਕਾਰਵਾਈ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਨਾਲ ਸਲਾਹ ਕਰਨ ਬਾਰੇ ਵਿਚਾਰ ਕਰੋ।",
    savedDiagnosis: "ਸੁਰੱਖਿਅਤ ਨਿਦਾਨ",
    diagnosisDetails: "ਨਿਦਾਨ ਵੇਰਵੇ",
    backHistory: "ਇਤਿਹਾਸ 'ਤੇ ਵਾਪਸ ਜਾਓ",
    caseId: "ਕੇਸ ID",
    expertRequired: "ਲੋੜੀਂਦਾ",
    expertNotRequired: "ਲੋੜੀਂਦਾ ਨਹੀਂ",
    yourRecords: "ਤੁਹਾਡੇ ਰਿਕਾਰਡ",
    recentDiagnoses: "ਹਾਲੀਆ ਨਿਦਾਨ",
    case: "ਕੇਸ",
    cases: "ਕੇਸ",
    loadingHistory: "ਨਿਦਾਨ ਇਤਿਹਾਸ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    noDiagnoses: "ਅਜੇ ਤੱਕ ਕੋਈ ਨਿਦਾਨ ਨਹੀਂ",
    firstDiagnosis:
      "ਆਪਣਾ ਪਹਿਲਾ ਨਿਦਾਨ ਰਿਕਾਰਡ ਬਣਾਉਣ ਲਈ ਫਸਲ ਦੀ ਤਸਵੀਰ ਅਪਲੋਡ ਕਰੋ।",
    unknown: "ਅਣਜਾਣ",
    unknownCrop: "ਅਣਜਾਣ ਫਸਲ",
    unknownProblem: "ਅਣਜਾਣ ਸਮੱਸਿਆ",
    noDiagnosis: "ਕੋਈ ਨਿਦਾਨ ਨਹੀਂ",
    dateUnavailable: "ਤਾਰੀਖ ਉਪਲਬਧ ਨਹੀਂ",
    severity: "ਗੰਭੀਰਤਾ",
    language: "ਭਾਸ਼ਾ",
    translating: "ਅਨੁਵਾਦ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    systemOnline: "AI ਸਿਸਟਮ ਔਨਲਾਈਨ",
    footer: "AgroMitR • ਸ਼ੁਰੂਆਤੀ ਪਛਾਣ ਅਤੇ ਪ੍ਰਬੰਧਨ",
  },
};


function App() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState("disease");
  const [activeTab, setActiveTab] = useState("home");
  const [pestResult, setPestResult] = useState(null);

  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [translatedHistory, setTranslatedHistory] = useState([]);

  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  const [language, setLanguage] = useState("en");

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [translating, setTranslating] = useState(false);

  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const [chatContextRequest, setChatContextRequest] = useState(null);

  // ==========================================================
  // CURRENT UI LANGUAGE
  // ==========================================================

  const text = UI_TEXT[language] || UI_TEXT.en;

  const changeTab = (tab) => {
    setActiveTab(tab);
    if (tab !== "crop-health") setSelectedDiagnosis(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openContextChat = (type, data) => {
    if (!data) return;

    setChatContextRequest({
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      data,
    });

    setActiveTab("chat");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const cropRecords = Array.from(
    new Map(
      history.filter((item) => item.crop).map((item) => [item.crop, item])
    ).values()
  );


  // ==========================================================
  // LOAD HISTORY
  // ==========================================================

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await axios.get(
        `${API_URL}/diagnose/`
      );

      const diagnoses =
        response.data?.diagnoses || [];

      // Update the main history
      setHistory(diagnoses);

      // Always keep the displayed history synchronized
      // with the latest backend records.
      setTranslatedHistory(diagnoses);

    } catch (err) {
      console.error("History error:", err);

      setError(
        "Unable to load diagnosis history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };


  // ==========================================================
  // TRANSLATE ONE DIAGNOSIS
  // ==========================================================

  const translateOne = async (
    diagnosis,
    targetLanguage
  ) => {

    if (!diagnosis) {
      return diagnosis;
    }

    // No API call for English
    if (targetLanguage === "en") {
      return diagnosis;
    }

    try {

      const response = await axios.post(
        `${API_URL}/diagnose/translate/`,
        {
          diagnosis: diagnosis,
          language: targetLanguage,
        }
      );

      const translated =
        response.data?.diagnosis;

      if (
        translated &&
        typeof translated === "object"
      ) {
        return {
          ...diagnosis,
          ...translated,
        };
      }

      return diagnosis;

    } catch (err) {

      console.error(
        `Translation failed for case ${diagnosis.id}:`,
        err
      );

      // If one record fails,
      // keep the original record.
      return diagnosis;
    }
  };


  // ==========================================================
  // TRANSLATE ALL HISTORY
  // ==========================================================

  const translateHistory = async (
    targetLanguage
  ) => {

    if (!history || history.length === 0) {
      setTranslatedHistory([]);
      return;
    }

    if (targetLanguage === "en") {
      setTranslatedHistory(history);
      return;
    }

    setTranslating(true);
    setError("");

    try {

      /*
       * Translate history in small batches.
       *
       * This prevents sending 20+ Groq requests
       * at exactly the same time.
       */

      const translated = [];

      const BATCH_SIZE = 3;

      for (
        let i = 0;
        i < history.length;
        i += BATCH_SIZE
      ) {

        const batch =
          history.slice(
            i,
            i + BATCH_SIZE
          );

        const batchResults =
          await Promise.all(
            batch.map((item) =>
              translateOne(
                item,
                targetLanguage
              )
            )
          );

        translated.push(
          ...batchResults
        );
      }

      setTranslatedHistory(translated);

      // ------------------------------------------------------
      // Update selected diagnosis too
      // ------------------------------------------------------

      if (selectedDiagnosis) {

        const translatedSelected =
          translated.find(
            (item) =>
              item.id ===
              selectedDiagnosis.id
          );

        if (translatedSelected) {
          setSelectedDiagnosis(
            translatedSelected
          );
        }
      }

    } catch (err) {

      console.error(
        "History translation error:",
        err
      );

      // Never destroy original history
      setTranslatedHistory(history);

    } finally {
      setTranslating(false);
    }
  };


  // ==========================================================
  // CHANGE LANGUAGE
  // ==========================================================

  const handleLanguageChange = async (
    event
  ) => {

    const newLanguage =
      event.target.value;

    setLanguage(newLanguage);

    // --------------------------------------------------------
    // English
    // --------------------------------------------------------

    if (newLanguage === "en") {

      setTranslatedHistory(history);

      if (result) {
        setResult(
          result._original ||
          result
        );
      }

      if (selectedDiagnosis) {

        const original =
          history.find(
            (item) =>
              item.id ===
              selectedDiagnosis.id
          );

        if (original) {
          setSelectedDiagnosis(original);
        }
      }

      return;
    }

    // --------------------------------------------------------
    // Translate current result
    // --------------------------------------------------------

    setTranslating(true);
    setError("");

    try {

      // Translate current diagnosis
      if (result) {

        const originalResult =
          result._original ||
          result;

        const translatedResult =
          await translateOne(
            originalResult,
            newLanguage
          );

        setResult({
          ...translatedResult,
          _original: originalResult,
        });
      }

      // Translate history
      await translateHistory(
        newLanguage
      );

    } catch (err) {

      console.error(
        "Language change error:",
        err
      );

      setError(
        "Unable to translate diagnosis."
      );

    } finally {
      setTranslating(false);
    }
  };


  // ==========================================================
  // FILE CHANGE
  // ==========================================================

  const handleFileChange = (
    event
  ) => {

    const selectedFile =
      event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);

    setPreview(
      URL.createObjectURL(
        selectedFile
      )
    );

    setResult(null);
    setPestResult(null);
    setSelectedDiagnosis(null);
    setError("");
  };


  // ==========================================================
  // ANALYZE CROP
  // ==========================================================

  const analyzeCrop = async () => {

    if (!file) {

      setError(
        "Please select a crop image first."
      );

      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {

      const response =
        await axios.post(
          `${API_URL}/diagnose/`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const diagnosis =
        response.data.diagnosis;

      // Store original so language can switch back
      setResult({
        ...diagnosis,
        _original: diagnosis,
      });

      // Reload history
      await loadHistory();

    } catch (err) {

      console.error(
        "Diagnosis error:",
        err
      );

      if (
        err.response?.data?.detail
      ) {

        setError(
          err.response.data.detail
        );

      } else {

        setError(
          "Unable to connect to the AgroMitR server."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // ANALYZE PEST
  // ==========================================================

  const analyzePest = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setPestResult(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_URL}/pest/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const pestDetection =
        response.data?.pest_detection || null;

      setPestResult(pestDetection);

      // Reload history after pest detection
      await loadHistory();

    } catch (err) {
      console.error("Pest detection error:", err);

      setError(
        err.response?.data?.detail ||
        "Unable to analyze the image for pest infestation."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // CHOOSE ANOTHER IMAGE
  // ==========================================================

  const chooseAnother = () => {

    setFile(null);
    setPreview(null);
    setResult(null);
    setPestResult(null);
    setSelectedDiagnosis(null);
    setError("");

    if (fileInputRef.current) {

      fileInputRef.current.value =
        "";

      fileInputRef.current.click();
    }
  };


  // ==========================================================
  // OPEN HISTORY DIAGNOSIS
  // ==========================================================

  const openDiagnosis = (
    diagnosis
  ) => {

    setSelectedDiagnosis(
      diagnosis
    );

    setTimeout(() => {

      document
        .getElementById(
          "diagnosis-detail"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

    }, 50);
  };

  // ============================================================
// DELETE ONE DIAGNOSIS
// ============================================================

const deleteDiagnosis = async (id) => {

  const confirmed = window.confirm(
    "Are you sure you want to delete this diagnosis?"
  );

  if (!confirmed) {
    return;
  }

  try {

    await axios.delete(
      `${API_URL}/diagnose/${id}`
    );

    // Remove from original history
    setHistory((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    // Remove from translated history
    setTranslatedHistory((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    // If currently viewing this diagnosis,
    // close the detail view.
    if (
      selectedDiagnosis &&
      selectedDiagnosis.id === id
    ) {

      setSelectedDiagnosis(null);
    }

    // If current result belongs to deleted record,
    // clear it.
    if (
      result &&
      result.id === id
    ) {

      setResult(null);
    }

  } catch (err) {

    console.error(
      "Delete diagnosis error:",
      err
    );

    setError(
      err.response?.data?.detail ||
      "Unable to delete diagnosis."
    );
  }
};


// ============================================================
// DELETE ALL HISTORY
// ============================================================

  const deleteAllHistory = async () => {

    if (history.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${history.length} diagnosis records? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {

      await axios.delete(
        `${API_URL}/diagnose/`
      );

      setHistory([]);
      setTranslatedHistory([]);
      setSelectedDiagnosis(null);
      setResult(null);

    } catch (err) {

      console.error(
        "Delete all history error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to delete diagnosis history."
      );
    }
  };

  // ==========================================================
  // BACK TO HISTORY
  // ==========================================================

  const backToHistory = () => {

    setSelectedDiagnosis(null);

    setTimeout(() => {

      document
        .getElementById(
          "history"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

    }, 50);
  };


  // ==========================================================
  // CHANGE AI TOOL
  // ==========================================================

  const changeMode = (newMode) => {
    setMode(newMode);
    setFile(null);
    setPreview(null);
    setResult(null);
    setPestResult(null);
    setSelectedDiagnosis(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // ==========================================================
  // DATA TO DISPLAY
  // ==========================================================

  const displayResult =
    result || null;

  const displayHistory = history;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="app">

      {/* ====================================================
          NAVBAR
      ==================================================== */}

      <header className="navbar">

        <div className="brand">

          <span className="logo">
            🌱
          </span>

          <span>
            AgroMitR
          </span>

        </div>

        <nav className="main-tabs" aria-label="Main navigation">
          <button type="button" className={activeTab === "home" ? "main-tab active" : "main-tab"} onClick={() => changeTab("home")}><span>🏠</span> Home</button>
          <button type="button" className={activeTab === "crop-health" ? "main-tab active" : "main-tab"} onClick={() => changeTab("crop-health")}><span>🔬</span> Crop Health</button>
          <button type="button" className={activeTab === "weather" ? "main-tab active" : "main-tab"} onClick={() => changeTab("weather")}><span>🌦️</span> Weather</button>
          <button type="button" className={activeTab === "chat" ? "main-tab active" : "main-tab"} onClick={() => changeTab("chat")}><span>🤖</span> AI Chat</button>
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >

          {/* LANGUAGE */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >

            <span
              style={{
                fontSize: "13px",
                color: "#657066",
              }}
            >
              🌐
            </span>

            <select
              value={language}
              onChange={
                handleLanguageChange
              }
              disabled={translating}
              style={{
                padding:
                  "8px 12px",
                border:
                  "1px solid #dfe7df",
                borderRadius:
                  "10px",
                background:
                  "white",
                cursor:
                  translating
                    ? "wait"
                    : "pointer",
                fontSize:
                  "13px",
                outline:
                  "none",
              }}
            >

              {LANGUAGES.map(
                (lang) => (

                  <option
                    key={lang.code}
                    value={lang.code}
                  >
                    {lang.name}
                  </option>

                )
              )}

            </select>

          </div>


          {/* SYSTEM STATUS */}

          <div className="nav-status">

            <span className="status-dot"></span>

            {translating
              ? text.translating
              : text.systemOnline}

          </div>

        </div>

      </header>


      <main className="container">

        {activeTab === "home" && (
          <section className="dashboard-section">

            <div className="dashboard-hero redesigned-dashboard-hero">
              <div className="dashboard-welcome">
                <div className="dashboard-kicker">
                  <span className="status-dot"></span>
                  FARM OVERVIEW
                </div>
                <h1>Your farm, at a glance.</h1>
                <p className="dashboard-subtitle">
                  Keep track of crop health, recent problems and the actions that need your attention.
                </p>
              </div>

              <div className="dashboard-actions">
                <button type="button" className="dashboard-action secondary" onClick={() => changeTab("weather")}>
                  <span>🌦️</span>
                  Weather
                </button>
                <button type="button" className="dashboard-action primary" onClick={() => changeTab("crop-health")}>
                  <span>＋</span>
                  New health check
                </button>
              </div>
            </div>

            <div className="stat-grid dashboard-stat-grid">
              <div className="stat-card dashboard-stat-card">
                <div className="stat-icon green">🌱</div>
                <div><strong>{cropRecords.length}</strong><small>Tracked crops</small></div>
              </div>
              <div className="stat-card dashboard-stat-card">
                <div className="stat-icon blue">🩺</div>
                <div><strong>{history.length}</strong><small>Health checks</small></div>
              </div>
              <div className="stat-card dashboard-stat-card">
                <div className="stat-icon amber">⚠️</div>
                <div><strong>{history.filter((item) => ["severe", "high"].includes(String(item.severity || "").toLowerCase())).length}</strong><small>Needs attention</small></div>
              </div>
              <div className="stat-card dashboard-stat-card">
                <div className="stat-icon purple">🤖</div>
                <div><strong>AI</strong><small>Farm assistant</small></div>
              </div>
            </div>

            <div className="dashboard-main-grid">

              <div className="dashboard-panel crops-panel">
                <div className="panel-heading dashboard-panel-heading">
                  <div>
                    <p className="eyebrow">YOUR FARM</p>
                    <h2>My Crops</h2>
                  </div>
                  <button type="button" className="text-button" onClick={() => changeTab("crop-health")}>
                    Health check →
                  </button>
                </div>

                {cropRecords.length === 0 ? (
                  <div className="dashboard-empty redesigned-empty">
                    <div className="empty-illustration">🌱</div>
                    <h3>Start building your farm record</h3>
                    <p>
                      Analyze a crop image and AgroMitR will automatically start tracking the crop and its health history here.
                    </p>
                    <button type="button" className="primary-small" onClick={() => changeTab("crop-health")}>
                      Analyze first crop
                    </button>
                  </div>
                ) : (
                  <div className="farm-crop-grid">
                    {cropRecords.slice(0, 6).map((item, index) => {
                      const severity = String(item.severity || "unknown").toLowerCase();
                      const healthLabel = severity === "severe" || severity === "high"
                        ? "Needs attention"
                        : severity === "moderate" || severity === "medium"
                          ? "Monitor closely"
                          : "Looks good";
                      return (
                        <button
                          type="button"
                          className="farm-crop-card"
                          key={item.id}
                          onClick={() => { changeTab("crop-health"); openDiagnosis(item); }}
                        >
                          <div className={`farm-crop-avatar crop-avatar-${index % 5}`}>🌿</div>
                          <div className="farm-crop-body">
                            <div className="farm-crop-name-row">
                              <strong>{item.crop || "Unknown crop"}</strong>
                              <span className={`health-badge ${severity}`}>{healthLabel}</span>
                            </div>
                            <span className="farm-crop-problem">{item.diagnosis || "No diagnosis recorded"}</span>
                            <div className="farm-crop-meta">
                              <span>Last checked</span>
                              <strong>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</strong>
                            </div>
                          </div>
                          <span className="farm-crop-arrow">→</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="dashboard-panel activity-panel redesigned-activity-panel">
                <div className="panel-heading dashboard-panel-heading">
                  <div>
                    <p className="eyebrow">TRACK RECORD</p>
                    <h2>Recent Activity</h2>
                  </div>
                  <span className="activity-count">{history.length}</span>
                </div>

                {history.length === 0 ? (
                  <div className="activity-empty">
                    <span>◷</span>
                    <p>Your diagnosis activity will appear here.</p>
                  </div>
                ) : (
                  <div className="timeline-list">
                    {displayHistory.slice(0, 6).map((item, index) => (
                      <button
                        type="button"
                        className="timeline-item"
                        key={item.id}
                        onClick={() => { changeTab("crop-health"); openDiagnosis(item); }}
                      >
                        <span className={`timeline-marker ${String(item.severity || "").toLowerCase()}`}>
                          {item.problem_type === "pest" ? "🐛" : "🌿"}
                        </span>
                        <span className="timeline-line"></span>
                        <span className="timeline-content">
                          <strong>{item.crop || "Unknown crop"}</strong>
                          <span>{item.diagnosis || "No diagnosis"}</span>
                          <small>
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Date unavailable"}
                          </small>
                        </span>
                        <span className="timeline-arrow">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-bottom-grid">
              <div className="dashboard-insight-card">
                <div className="insight-icon">💡</div>
                <div>
                  <p className="eyebrow">AgroMitR INSIGHT</p>
                  <h3>Stay ahead, not just react.</h3>
                  <p>
                    Combine crop health records with weather and pest observations to plan the next farm action.
                  </p>
                </div>
                <button type="button" onClick={() => changeTab("weather")}>Plan with weather →</button>
              </div>

              <div className="dashboard-quick-card">
                <div>
                  <p className="eyebrow">QUICK ACTION</p>
                  <h3>Need help with your crop?</h3>
                </div>
                <button type="button" onClick={() => changeTab("chat")}>
                  Ask AgroMitR <span>→</span>
                </button>
              </div>
            </div>

          </section>
        )}
        {activeTab === "crop-health" && (
          <>
        {/* ==================================================
            HERO
        ================================================== */}

        <section className="crop-health-page">

          {/* ==================================================
              CROP HEALTH HEADER
          ================================================== */}

          <div className="crop-health-header">

            <div className="crop-health-heading">

              <div className="crop-health-icon">
                ✦
              </div>

              <div>
                <p className="eyebrow">
                  {text.smartCropHealth}
                </p>

                <h1>
                  Protect your crops
                  <span> before problems spread.</span>
                </h1>

                <p className="crop-health-subtitle">
                  Choose an analysis type and upload a clear crop image.
                  AgroMitR will identify visible diseases or pest infestation signs.
                </p>
              </div>

            </div>

            <div className="crop-health-status">
              <span className="status-dot"></span>
              AI analysis ready
            </div>

          </div>


          {/* ==================================================
              TOOL SELECTOR
          ================================================== */}

          <div className="health-tool-grid">

            <button
              type="button"
              className={
                mode === "disease"
                  ? "health-tool-card active"
                  : "health-tool-card"
              }
              onClick={() => changeMode("disease")}
            >

              <div className="health-tool-icon disease-icon">
                🌿
              </div>

              <div className="health-tool-content">

                <div className="health-tool-top">
                  <span>DISEASE</span>

                  {mode === "disease" && (
                    <span className="selected-pill">
                      Selected
                    </span>
                  )}
                </div>

                <h2>
                  Crop Disease Detection
                </h2>

                <p>
                  Identify possible diseases, symptoms,
                  severity and recommended actions.
                </p>

              </div>

              <span className="health-tool-arrow">
                →
              </span>

            </button>


            <button
              type="button"
              className={
                mode === "pest"
                  ? "health-tool-card active pest-active"
                  : "health-tool-card"
              }
              onClick={() => changeMode("pest")}
            >

              <div className="health-tool-icon pest-icon">
                🐛
              </div>

              <div className="health-tool-content">

                <div className="health-tool-top">
                  <span>INFESTATION</span>

                  {mode === "pest" && (
                    <span className="selected-pill">
                      Selected
                    </span>
                  )}
                </div>

                <h2>
                  Pest Infestation Detection
                </h2>

                <p>
                  Identify likely pests, infestation signs,
                  risk level and recommended actions.
                </p>

              </div>

              <span className="health-tool-arrow">
                →
              </span>

            </button>

          </div>


          {/* ==================================================
              ANALYSIS WORKSPACE
          ================================================== */}

          <div className="health-workspace">

            <div className="health-upload-panel">

              <div className="workspace-header">

                <div>
                  <span className="workspace-label">
                    STEP 1
                  </span>

                  <h2>
                    Upload an image
                  </h2>

                  <p>
                    Use a clear, well-lit photo of the affected
                    leaf, plant or pest.
                  </p>
                </div>

                <div className="format-badge">
                  JPG · PNG · WEBP
                </div>

              </div>


              {!preview ? (

                <label className="modern-upload-area">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />

                  <div className="upload-orb">
                    <span>↑</span>
                  </div>

                  <h3>
                    Drop your crop image here
                  </h3>

                  <p>
                    or click to browse from your device
                  </p>

                  <span className="upload-hint">
                    For best results, keep the affected area visible.
                  </span>

                </label>

              ) : (

                <div className="modern-preview">

                  <div className="preview-image-wrap">

                    <img
                      src={preview}
                      alt="Selected crop"
                      className="modern-preview-image"
                    />

                    <div className="preview-mode-badge">
                      {mode === "pest"
                        ? "🐛 Pest analysis"
                        : "🌿 Disease analysis"}
                    </div>

                  </div>

                  <div className="preview-footer">

                    <div>
                      <strong>
                        {file?.name || "Selected image"}
                      </strong>

                      <span>
                        Ready for AI analysis
                      </span>
                    </div>

                    <button
                      type="button"
                      className="change-image-button"
                      onClick={chooseAnother}
                    >
                      Change image
                    </button>

                  </div>

                </div>

              )}


              {error && (
                <div className="modern-error">
                  <span>⚠️</span>
                  <div>
                    <strong>Analysis could not be completed</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}


              <button
                type="button"
                className="modern-analyze-button"
                onClick={
                  mode === "pest"
                    ? analyzePest
                    : analyzeCrop
                }
                disabled={
                  !file ||
                  loading ||
                  translating
                }
              >

                <span>
                  {loading
                    ? "Analyzing..."
                    : mode === "pest"
                      ? "Detect Pest Infestation"
                      : "Analyze Crop Disease"}
                </span>

                <span className="analyze-arrow">
                  →
                </span>

              </button>

            </div>


            {/* ==================================================
                HOW IT WORKS
            ================================================== */}

            <aside className="health-info-panel">

              <div className="info-panel-top">
                <span className="info-panel-icon">
                  ✦
                </span>

                <div>
                  <span className="workspace-label">
                    AI ASSISTED
                  </span>

                  <h3>
                    What AgroMitR checks
                  </h3>
                </div>
              </div>


              <div className="health-check-list">

                <div className="health-check-item">
                  <span>01</span>
                  <div>
                    <strong>Crop identification</strong>
                    <p>
                      Detects the crop visible in the image.
                    </p>
                  </div>
                </div>

                <div className="health-check-item">
                  <span>02</span>
                  <div>
                    <strong>
                      {mode === "pest"
                        ? "Pest & infestation signs"
                        : "Disease & symptoms"}
                    </strong>
                    <p>
                      Analyzes visible signs to identify
                      the likely problem.
                    </p>
                  </div>
                </div>

                <div className="health-check-item">
                  <span>03</span>
                  <div>
                    <strong>Risk assessment</strong>
                    <p>
                      Provides confidence and severity or
                      infestation risk where available.
                    </p>
                  </div>
                </div>

                <div className="health-check-item">
                  <span>04</span>
                  <div>
                    <strong>Action guidance</strong>
                    <p>
                      Gives practical next steps for the farmer.
                    </p>
                  </div>
                </div>

              </div>


              <div className="health-safety-note">
                <span>✓</span>
                <p>
                  AI results are recommendations. Consult
                  an agricultural expert for uncertain or
                  severe cases.
                </p>
              </div>

            </aside>

          </div>

        </section>


        {/* ==================================================
            CURRENT DIAGNOSIS RESULT
        ================================================== */}

        {displayResult && (

          <section className="result-section">

            <div className="result-header">

              <div>

                <p className="eyebrow">
                  {text.aiAnalysisComplete}
                </p>

                <h2>
                  {text.diagnosisResult}
                </h2>

              </div>


              <div className="confidence">

                <strong>

                  {Math.round(
                    Number(
                      displayResult.confidence ||
                        0
                    ) * 100
                  )}

                  %

                </strong>

                <span>
                  {text.confidence}
                </span>

              </div>

            </div>


            <div className="result-grid">


              {/* RESULT MAIN */}

              <div className="result-main">

                <div className="diagnosis-title">

                  <span className="crop-icon">
                    🌿
                  </span>

                  <div>

                    <p>
                      {text.detectedCrop}
                    </p>

                    <h3>
                      {displayResult.crop ||
                        text.unknown}
                    </h3>

                  </div>

                </div>


                <div className="diagnosis-name">

                  <p>
                    {text.possibleCondition}
                  </p>

                  <h2>
                    {displayResult.diagnosis ||
                      "No specific condition detected"}
                  </h2>

                </div>


                <div className="tags">

                  <span>
                    {displayResult.problem_type ||
                      text.unknown}
                  </span>

                  <span>

                    {text.severity}:{" "}

                    {displayResult.severity ||
                      text.unknown}

                  </span>

                </div>

              </div>


              {/* SYMPTOMS */}

              <div className="symptoms">

                <h3>
                  {text.observedSymptoms}
                </h3>

                {Array.isArray(
                  displayResult.symptoms
                ) &&
                displayResult.symptoms.length >
                  0 ? (

                  <ul>

                    {displayResult.symptoms.map(
                      (
                        symptom,
                        index
                      ) => (

                        <li key={index}>
                          {symptom}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    {text.noSymptoms}
                  </p>

                )}

              </div>

            </div>


            {/* EXPLANATION */}

            <div className="explanation">

              <h3>
                {text.aiExplanation}
              </h3>

              <p>
                {displayResult.explanation ||
                  text.noExplanation}
              </p>

            </div>


            {/* RECOMMENDATIONS */}

            <div className="recommendations">

              <h3>
                {text.recommendedActions}
              </h3>

              {Array.isArray(
                displayResult.recommended_action
              ) &&
              displayResult.recommended_action
                .length > 0 ? (

                <div className="recommendation-list">

                  {displayResult.recommended_action.map(
                    (
                      action,
                      index
                    ) => (

                      <div
                        className="recommendation"
                        key={index}
                      >

                        <span>
                          {index + 1}
                        </span>

                        <p>
                          {action}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p>
                  {text.noRecommendations}
                </p>

              )}

            </div>


            {/* EXPERT WARNING */}

            {displayResult.needs_expert_review && (

              <div className="expert-warning">

                <span>
                  ⚠️
                </span>

                <div>

                  <strong>
                    {text.expertReview}
                  </strong>

                  <p>
                    {text.expertDescription}
                  </p>

                </div>

              </div>

            )}

            <div className="result-chat-action">
              <div className="result-chat-action-copy">
                <strong>Have a question about this result?</strong>
                <p>
                  Start a fresh AgroMitr chat with this diagnosis already in context.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openContextChat("disease", displayResult)}
              >
                🤖 Ask AgroMitr
                <span className="result-chat-arrow">→</span>
              </button>
            </div>

          </section>

        )}


        {/* ==================================================
            PEST DETECTION RESULT
        ================================================== */}

        {pestResult && (
          <section className="result-section pest-result-section">
            <div className="result-header">
              <div>
                <p className="eyebrow">PEST ANALYSIS COMPLETE</p>
                <h2>Pest Detection Result</h2>
              </div>
              <div className="confidence">
                <strong>{Math.round(Number(pestResult.confidence || 0) * 100)}%</strong>
                <span>confidence</span>
              </div>
            </div>

            <div className="result-grid">
              <div className="result-main">
                <div className="diagnosis-title">
                  <span className="crop-icon">🐛</span>
                  <div>
                    <p>Detected crop</p>
                    <h3>{pestResult.crop || "Unknown crop"}</h3>
                  </div>
                </div>
                <div className="diagnosis-name">
                  <p>Likely pest</p>
                  <h2>{pestResult.pest_name || "No clear pest detected"}</h2>
                </div>
                <div className="tags">
                  <span>{pestResult.pest_detected ? "Pest detected" : "No clear infestation"}</span>
                  <span>Risk: {pestResult.risk_level || "Low"}</span>
                </div>
              </div>

              <div className="symptoms">
                <h3>Observed signs</h3>
                {Array.isArray(pestResult.symptoms) && pestResult.symptoms.length > 0 ? (
                  <ul>
                    {pestResult.symptoms.map((symptom, index) => <li key={index}>{symptom}</li>)}
                  </ul>
                ) : (
                  <p>No specific infestation signs were returned.</p>
                )}
              </div>
            </div>

            <div className="explanation">
              <h3>AI Explanation</h3>
              <p>{pestResult.explanation || "No explanation was provided."}</p>
            </div>

            <div className="recommendations">
              <h3>Recommended Actions</h3>
              {Array.isArray(pestResult.recommended_action) && pestResult.recommended_action.length > 0 ? (
                <div className="recommendation-list">
                  {pestResult.recommended_action.map((action, index) => (
                    <div className="recommendation" key={index}>
                      <span>{index + 1}</span>
                      <p>{action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recommendations were provided.</p>
              )}
            </div>

            {pestResult.needs_expert_review && (
              <div className="expert-warning">
                <span>⚠️</span>
                <div>
                  <strong>Expert review recommended</strong>
                  <p>Consider consulting an agricultural expert before taking action.</p>
                </div>
              </div>
            )}

            <div className="result-chat-action pest">
              <div className="result-chat-action-copy">
                <strong>Have a question about this pest?</strong>

                <p>
                  Start a fresh AgroMitr chat with this pest detection already in context.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openContextChat("pest", pestResult)}
              >
                🤖 Ask AgroMitr
                <span className="result-chat-arrow">→</span>
              </button>
            </div>

          </section>
        )}


                {/* ==================================================
            DIAGNOSIS DETAIL
        ================================================== */}

        {selectedDiagnosis && (

          <section
            id="diagnosis-detail"
            className="detail-section"
          >

            <button
              type="button"
              className="back-button"
              onClick={
                backToHistory
              }
            >
              ← {text.backHistory}
            </button>


            <div className="detail-header">

              <div>

                <p className="eyebrow">
                  {text.savedDiagnosis}
                </p>

                <h2>
                  {text.diagnosisDetails}
                </h2>

              </div>


              <span className="detail-case">

                {text.caseId} #
                {selectedDiagnosis.id}

              </span>

            </div>


            <div className="detail-summary">

              {selectedDiagnosis.filename && (

                <img
                  src={getImageUrl(
                    selectedDiagnosis.filename
                  )}
                  alt={`${selectedDiagnosis.crop ||
                    "Crop"} diagnosis`}
                  className="detail-image"
                />

              )}


              <div className="detail-crop-icon">
                🌿
              </div>


              <div className="detail-crop">

                <p>
                  {text.detectedCrop}
                </p>

                <h2>
                  {selectedDiagnosis.crop ||
                    text.unknown}
                </h2>

                <span>
                  {selectedDiagnosis.problem_type ||
                    text.unknownProblem}
                </span>

              </div>


              <div className="detail-confidence">

                <strong>

                  {Math.round(
                    Number(
                      selectedDiagnosis.confidence ||
                        0
                    ) * 100
                  )}

                  %

                </strong>

                <span>
                  {text.confidence}
                </span>

              </div>

            </div>


            <div className="detail-diagnosis">

              <p>
                {text.possibleCondition}
              </p>

              <h1>
                {selectedDiagnosis.diagnosis ||
                  text.noDiagnosis}
              </h1>

              <span
                className={
                  "severity " +
                  String(
                    selectedDiagnosis.severity ||
                      "unknown"
                  ).toLowerCase()
                }
              >
                {selectedDiagnosis.severity ||
                  text.unknown}
              </span>

            </div>


            <div className="detail-grid">


              {/* SYMPTOMS */}

              <div className="detail-box">

                <h3>
                  {text.observedSymptoms}
                </h3>

                {Array.isArray(
                  selectedDiagnosis.symptoms
                ) &&
                selectedDiagnosis.symptoms.length >
                  0 ? (

                  <ul>

                    {selectedDiagnosis.symptoms.map(
                      (
                        symptom,
                        index
                      ) => (

                        <li key={index}>
                          {symptom}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    {text.noSymptoms}
                  </p>

                )}

              </div>


              {/* EXPLANATION */}

              <div className="detail-box">

                <h3>
                  {text.aiExplanation}
                </h3>

                <p>
                  {selectedDiagnosis.explanation ||
                    text.noExplanation}
                </p>

              </div>

            </div>


            {/* RECOMMENDATIONS */}

            <div className="detail-box recommendations-detail">

              <h3>
                {text.recommendedActions}
              </h3>

              {Array.isArray(
                selectedDiagnosis.recommended_action
              ) &&
              selectedDiagnosis.recommended_action
                .length > 0 ? (

                <div className="recommendation-list">

                  {selectedDiagnosis.recommended_action.map(
                    (
                      action,
                      index
                    ) => (

                      <div
                        className="recommendation"
                        key={index}
                      >

                        <span>
                          {index + 1}
                        </span>

                        <p>
                          {action}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p>
                  {text.noRecommendations}
                </p>

              )}

            </div>


            {/* META */}

            <div className="detail-meta">

              <span>
                {text.caseId}: #
                {selectedDiagnosis.id}
              </span>

              <span>

                {selectedDiagnosis.created_at
                  ? new Date(
                      selectedDiagnosis.created_at
                    ).toLocaleString()
                  : text.dateUnavailable}

              </span>

              <span>

                {text.expertReview}:{" "}

                {selectedDiagnosis.needs_expert_review
                  ? text.expertRequired
                  : text.expertNotRequired}

              </span>

            </div>

            <div className="result-chat-action">
              <div>
                <strong>Have a question about this pest?</strong>
                <p>Ask AgroMitr for advice based on this detection.</p>
              </div>

              <button
                type="button"
                onClick={() => changeTab("chat")}
              >
                🤖 Ask AgroMitr about this
                <span>→</span>
              </button>
            </div>

          </section>

        )}


        {/* ==================================================
            HISTORY
        ================================================== */}

        <section
          id="history"
          className="history-section"
        >

          <div className="history-header">

            <div>

              <p className="eyebrow">
                {text.yourRecords}
              </p>

              <h2>
                {text.recentDiagnoses}
              </h2>

            </div>

            {history.length > 0 && (
              <button
                type="button"
                className="delete-all-button"
                onClick={deleteAllHistory}
              >
                🗑️ Delete all
              </button>
            )}

            <span className="history-count">

              {history.length}{" "}

              {history.length === 1
                ? text.case
                : text.cases}

            </span>

          </div>


          {/* TRANSLATION STATUS */}

          {translating && (

            <div
              style={{
                marginBottom: "15px",
                padding: "10px 14px",
                background: "#eef6ee",
                borderRadius: "10px",
                color: "#397645",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              {text.translating}
            </div>

          )}


          {historyLoading ? (

            <div className="history-empty">
              {text.loadingHistory}
            </div>

          ) : history.length === 0 ? (

            <div className="history-empty">

              <div className="history-empty-icon">
                🌿
              </div>

              <h3>
                {text.noDiagnoses}
              </h3>

              <p>
                {text.firstDiagnosis}
              </p>

            </div>

          ) : (

            <div className="history-list">

              {displayHistory.map(
                (item) => (

                  <div
                    className="history-card"
                    key={item.id}
                    onClick={() => openDiagnosis(item)}
                  >

                    {/* IMAGE */}

                    {item.filename ? (

                      <img
                        src={getImageUrl(
                          item.filename
                        )}
                        alt={`${item.crop ||
                          "Crop"} diagnosis`}
                        className="history-image"
                      />

                    ) : (

                      <div className="history-icon">
                        🌿
                      </div>

                    )}


                    {/* INFO */}

                    <div className="history-info">

                      <div className="history-top">

                        <h3>
                          {item.crop ||
                            text.unknownCrop}
                        </h3>

                        <span
                          className={
                            "severity " +
                            String(
                              item.severity ||
                                "unknown"
                            ).toLowerCase()
                          }
                        >
                          {item.severity ||
                            text.unknown}
                        </span>

                      </div>


                      <p className="history-diagnosis">

                        {item.diagnosis ||
                          text.noDiagnosis}

                      </p>


                      <p className="history-date">

                        {text.caseId} #{item.id}

                        {" • "}

                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleString()
                          : text.dateUnavailable}

                      </p>

                    </div>


                    {/* CONFIDENCE */}

                    <div className="history-confidence">

                      <strong>

                        {Math.round(
                          Number(
                            item.confidence ||
                              0
                          ) * 100
                        )}

                        %

                      </strong>

                      <span>
                        {text.confidence}
                      </span>

                    </div>

                    {/* DELETE BUTTON */}

                    <button
                      type="button"
                      className="history-delete-button"
                      title="Delete this record"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteDiagnosis(item.id);
                      }}
                    >
                      🗑️
                    </button>    

                    {/* ARROW */}

                    <span className="history-arrow">
                      →
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </section>
        </>
        )}

        {activeTab === "weather" && (
          <Weather history={history} />
        )}

        {activeTab === "chat" && (
          <Chat
            history={history}
            currentDiagnosis={mode === "pest" ? pestResult : result}
            language={language}
            contextRequest={chatContextRequest}
          />
        )}

      </main>


      {/* FOOTER */}

      <footer>
        {text.footer}
      </footer>

    </div>
  );
}

export default App;