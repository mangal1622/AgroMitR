import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";
import Weather from "./Weather";
import Chat from "./Chat";
import Auth from "./components/Auth";
import LanguageSelect from "./components/LanguageSelect";
import Settings from "./components/Settings";
import { useTranslation } from "./i18n/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const getAuthToken = () => {
  return localStorage.getItem("agromitr_access_token");
};

const getAuthHeaders = () => {
  const token = getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

axios.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const getImageUrl = (filename) => {
  if (!filename) return null;
  const firstFilename = String(filename).split(",")[0].trim();
  return `${API_URL}/uploads/${firstFilename}`;
};

const getAreaUnitLabel = (unit, pageText) => {
  const labels = {
    acre: pageText.acre,
    hectare: pageText.hectare,
    bigha: pageText.bigha,
    guntha: pageText.guntha,
    sqft: pageText.sqft,
  };

  return labels[unit] || unit || "";
};


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
    footer: "AgroMitR • Early Detection & Management",
  },

};

const PAGE_TEXT = {
  en: {

    home: "Home", crops: "Your Crops", health: "Crop Health", weather: "Weather", chat: "AI Chat",
    farmOverview: "FARM OVERVIEW", farmTitle: "Your farm, at a glance.", farmSubtitle: "Keep track of crop health, recent problems and the actions that need your attention.",
    newHealthCheck: "New health check", trackedCrops: "Tracked crops", healthChecks: "Health checks", needsAttention: "Needs attention", monitorClosely: "Monitor closely", looksGood: "Looks good",
    cropMonitoring: "CROP MONITORING", yourCrops: "Your Crops", cropSummary: "Keep track of your currently growing crops.", viewAllCrops: "View All Crops", noCrops: "No crops being monitored", addCropsPrompt: "Add your crops to start tracking their growth and health.", addCrop: "Add Crop", healthStatus: "Health Check Status", cropsChecked: "Crops Checked", healthCheck: "Health check", trackRecord: "TRACK RECORD", recentActivity: "Recent Activity", noActivity: "Your diagnosis activity will appear here.", insight: "AgroMitR INSIGHT", insightTitle: "Stay ahead, not just react.", insightText: "Combine crop health records with weather and pest observations to plan the next farm action.", planWeather: "Plan with weather", quickAction: "QUICK ACTION", needHelp: "Need help with your crop?", ask: "Ask AgroMitR",
    allCrops: "All Your Crops", cropInfo: "Your registered crops and their current information.", activeCrops: "Active Crops", locations: "Field Locations", newCrop: "NEW CROP", editCrop: "EDIT CROP", addCropTitle: "Add Crop", editCropTitle: "Edit Crop", addCropDescription: "Add your crop details to start monitoring it.", editCropDescription: "Update your crop details when field conditions change.", cropInformation: "Crop Information", growthInformation: "Growth Information", fieldInformation: "Field Information", fieldNotes: "Field Notes", location: "Location", soilType: "Soil Type", irrigation: "Irrigation Type", notes: "Notes", cancel: "Cancel", saveChanges: "Save Changes", delete: "Delete", save: "Saving...",
    smartHealth: "SMART CROP HEALTH", protect: "Protect your crops", protectSubtitle: "Choose an analysis type and upload a clear crop image. AgroMitR will identify visible diseases or pest infestation signs.", analysisReady: "AI analysis ready", disease: "DISEASE", infestation: "INFESTATION", diseaseTitle: "Crop Disease Detection", pestTitle: "Pest Infestation Detection", diseaseDescription: "Identify possible diseases, symptoms, severity and recommended actions.", pestDescription: "Identify likely pests, infestation signs, risk level and recommended actions.", selected: "Selected", uploadImage: "Upload an image", uploadDescription: "Use a clear, well-lit photo of the affected leaf, plant or pest.", aiAssisted: "AI ASSISTED", whatChecks: "What AgroMitR checks", cropIdentification: "Crop identification", diseaseSymptoms: "Disease & symptoms", pestSigns: "Pest & infestation signs", riskAssessment: "Risk assessment", actionGuidance: "Action guidance", safetyNote: "AI results are recommendations. Consult an agricultural expert for uncertain or severe cases.", analyzeDisease: "Analyze Crop Disease", analyzePest: "Detect Pest Infestation", readyAnalysis: "Ready for AI analysis. Select up to 5 images for more context.", searching: "Searching locations...",
    startRecord: "Start building your farm record",
    analyzeFirst: "Analyze first crop",
    lastChecked: "Last checked",
    crop: "crop", cropsLabel: "crops", days: "days",
    fillCropFields: "Please fill in crop name, area and planting date.",
    failedAddCrop: "Failed to add crop", unableAddCrop: "Unable to add crop.",
    confirmRemoveCrop: "Are you sure you want to remove this crop from Your Crops?",
    failedRemoveCrop: "Failed to remove crop", unableRemoveCrop: "Unable to remove crop.",
    notProvided: "Not provided", notSet: "Not set", unnamedCrop: "Unnamed Crop",
    acre: "acre", hectare: "hectare", bigha: "bigha", guntha: "guntha", sqft: "sq ft",
    loamy: "Loamy", clay: "Clay", sandy: "Sandy", silty: "Silty", blackSoil: "Black Soil", redSoil: "Red Soil", other: "Other",
    rainfed: "Rainfed", drip: "Drip", sprinkler: "Sprinkler", flood: "Flood",
    noCropsAdded: "No crops added yet",
    firstCropPrompt: "Add your first crop to start monitoring your farm.",
    cropName: "Crop Name",
    variety: "Variety",
    area: "Land Area",
    growingFor: "Growing For",
    planted: "Planted",
    harvest: "Harvest",
    selectSoil: "Select soil type",
    selectIrrigation: "Select irrigation",
    plantingDate: "Planting Date",
    expectedHarvest: "Expected Harvest Date",
    villagePlaceholder: "Village / field location",
    tomatoPlaceholder: "e.g. Tomato",
    varietyPlaceholder: "e.g. Roma",
    areaPlaceholder: "e.g. 2",
    notesPlaceholder: "Add any additional information about this crop or field...",
    dropImage: "Drop your crop image here",
    browseImage: "or click to browse from your device",
    uploadHint: "For best results, keep the affected area visible.",
    analysisError: "Analysis could not be completed",
    healthRecordPrompt: "Analyze a crop image and AgroMitR will automatically start tracking the crop and its health history here.",
    weatherTitle: "Plan your farm around the weather.",
    weatherSubtitle: "Check local conditions, forecasted rain, heat and wind, then turn them into practical farm preparation steps.",
    searchLocation: "Search your farm city or location",
    checkWeather: "Check Weather",
    currentLocation: "Use my current location",
    chatTitle: "Talk to your farming assistant.",
    chatSubtitle: "Get practical crop-health guidance using your diagnosis history.",
    chats: "Chats",
    newChat: "New chat",
    tryAsking: "Try asking",
    clearChat: "Clear current chat",
    cropGuidance: "Crop & farm guidance",
    askAnything: "Ask AgroMitr anything about your crops...",
    beforeProblems: " before problems spread.", stepOne: "STEP 1", imageFormats: "JPG · PNG · WEBP", dropImage: "Drop your crop image here", browseImage: "or click to browse from your device", uploadHint: "For best results, keep the affected area visible.", changeImage: "Change image", selectedImage: "Selected image", imagesSelected: "images selected", pestAnalysis: "Pest analysis", diseaseAnalysis: "Disease analysis", analyzing: "Analyzing...", analysisError: "Analysis could not be completed", detectsCrop: "Detects the crop visible in the image.", analyzesSigns: "Analyzes visible signs to identify the likely problem.", providesRisk: "Provides confidence and severity or infestation risk where available.", givesActions: "Gives practical next steps for the farmer.", cropName: "Crop Name", variety: "Variety", area: "Land Area", growingFor: "Growing For", planted: "Planted", harvest: "Harvest", plantingDate: "Planting Date", expectedHarvest: "Expected Harvest Date", fieldNotes: "Field Notes", selectSoil: "Select soil type", selectIrrigation: "Select irrigation", tomatoPlaceholder: "e.g. Tomato", varietyPlaceholder: "e.g. Roma", areaPlaceholder: "e.g. 2", villagePlaceholder: "Village / field location", notesPlaceholder: "Add any additional information about this crop or field...", noCropsAdded: "No crops added yet", firstCropPrompt: "Add your first crop to start monitoring your farm.", startRecord: "Start building your farm record", healthRecordPrompt: "Analyze a crop image and AgroMitR will automatically start tracking the crop and its health history here.", lastChecked: "Last checked",
    weatherKicker: "AGROMITR WEATHER INTELLIGENCE", searchingWeather: "Searching...", checkingWeather: "Checking...", findingLocation: "Finding your location...", farmLocation: "FARM LOCATION", rightNow: "RIGHT NOW", humidity: "Humidity", wind: "Wind", rain: "Rain", cloudCover: "Cloud cover", forecast: "FORECAST", outlook: "7-day farm outlook", farmPlanning: "Farm planning", advisory: "AGROMITR ADVISORY", prepare: "What should you prepare for?", cropsTracked: "crops tracked", generalFarmPlan: "General farm plan", nextFieldWindow: "NEXT FIELD WINDOW", planBeforeAct: "Plan before you act.", temperature: "Temperature", today: "today", forecastFor: "Forecast for", forecastDisclaimer: "Weather data is forecast information. Use local agricultural guidance and field observations before making high-impact treatment decisions.", rainLikely: "Rain likely", fungalRisk: "Fungal-risk conditions", heatStress: "Heat stress watch", strongWind: "Strong wind", planFieldWork: "Plan field work", pestMonitoring: "Pest monitoring", goodPlanning: "Good planning window",
    starterDisease: "How can I protect my crops from disease?", starterYellow: "What should I do if leaves are turning yellow?", starterPests: "How often should I check my crops for pests?", starterGrowth: "How can I improve plant growth naturally?", question: "question", questions: "questions", responsesIn: "Responses will be provided in", enterSend: "Enter to send", shiftEnter: "Shift + Enter for a new line", aiGuidance: "AI guidance • verify critical treatment decisions", thinking: "AgroMitr is thinking...",
    weather0: "Clear sky", weather1: "Mainly clear", weather2: "Partly cloudy", weather3: "Overcast", weather45: "Fog", weather48: "Rime fog", weather51: "Light drizzle", weather53: "Drizzle", weather55: "Heavy drizzle", weather56: "Freezing drizzle", weather57: "Heavy freezing drizzle", weather61: "Light rain", weather63: "Rain", weather65: "Heavy rain", weather66: "Freezing rain", weather67: "Heavy freezing rain", weather71: "Light snow", weather73: "Snow", weather75: "Heavy snow", weather77: "Snow grains", weather80: "Rain showers", weather81: "Rain showers", weather82: "Heavy rain showers", weather85: "Snow showers", weather86: "Heavy snow showers", weather95: "Thunderstorm", weather96: "Thunderstorm with hail", weather99: "Thunderstorm with heavy hail", weatherVariable: "Variable conditions",
    rainProbability: "Rain probability is", protectProduce: "Avoid unnecessary irrigation and protect harvested produce.", fungalHistory: "Your recent crop records include disease problems, and humid conditions can increase leaf-wetness and fungal pressure. Inspect affected crops closely.", fungalHumidity: "High humidity can keep leaves wet for longer. Increase monitoring for fungal symptoms and improve airflow where possible.", maxTemperature: "Today's maximum temperature may reach", soilMoisture: "Check soil moisture and plan irrigation around the cooler part of the day.", windMayReach: "Wind may reach", avoidSpraying: "Avoid spraying during strong winds and secure vulnerable plants.", fieldWorkText: "Several of the next few days show elevated rain probability. Schedule spraying, harvesting and soil work during the clearest window.", pestMonitoringText: "Warm and humid conditions can support pest activity. Check the undersides of leaves and new growth during your next field inspection.", goodPlanningText: "No major weather-based warning was detected for today. Continue routine crop monitoring and use the forecast to plan field work.", refresh: "Refresh", upTo: "Up to",

  }
};

const NavIcon = ({ type, size = 17 }) => {
  const paths = {
    home: (
      <>
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
        <path d="M9 21v-6h6v6" />
      </>
    ),

    crops: (
      <>
        <path d="M12 21V10" />
        <path d="M12 10C7 10 4 7 4 3c5 0 8 2 8 7" />
        <path d="M12 14c0-4 3-7 8-7 0 4-3 7-8 7" />
      </>
    ),

    health: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 5 5" />
        <path d="M8.5 11h5" />
        <path d="M11 8.5v5" />
      </>
    ),

    weather: (
      <>
        <circle cx="8" cy="8" r="3" />
        <path d="M8 2v1" />
        <path d="M8 13v1" />
        <path d="m3.8 3.8.7.7" />
        <path d="m11.5 11.5.7.7" />
        <path d="M15 18h4a3 3 0 0 0 .5-5.96A5 5 0 0 0 10 13.5" />
      </>
    ),

    chat: (
      <>
        <path d="M20 15a4 4 0 0 1-4 4H9l-5 3v-7a4 4 0 0 1-1-3V7a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4z" />
        <path d="M8 10h.01" />
        <path d="M12 10h.01" />
        <path d="M16 10h.01" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
};

function App() {
  // ==========================================================
  // STATE
  // ==========================================================

  const { t, language, dictionary } = useTranslation();

  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(
    () => !!localStorage.getItem("agromitr_language")
  );

  const [file, setFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState("disease");
  const validTabs = ["home", "crops", "crop-health", "weather", "chat", "settings"];
  const getInitialTab = () => {
    try {
      const saved = localStorage.getItem("agromitr_active_tab");
      if (saved && validTabs.includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage errors
    }
    return "home";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [pestResult, setPestResult] = useState(null);

  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);

  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [error, setError] = useState("");

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const diagnosisResultRef = useRef(null);

  const [chatContextRequest, setChatContextRequest] = useState(null);

  const [crops, setCrops] = useState([]);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [editingCropId, setEditingCropId] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem("agromitr_user");
    const savedToken = localStorage.getItem("agromitr_access_token");

    if (!savedUser || !savedToken) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("agromitr_user");
      localStorage.removeItem("agromitr_access_token");
      return null;
    }
  });

  const handleLogin = (user) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("agromitr_access_token");
    localStorage.removeItem("agromitr_user");
    setAuthUser(null);
  };

  const [cropForm, setCropForm] = useState({
    crop_name: "",
    variety: "",
    area: "",
    area_unit: "acre",
    planted_date: "",
    expected_harvest_date: "",
    location: "",
    irrigation_type: "",
    soil_type: "",
    notes: "",
  });

  const [savingCrop, setSavingCrop] = useState(false);

  // Use t() for translations — dictionary is the full locale object for components
  const text = dictionary;
  const pageText = dictionary;

  const changeTab = (tab) => {
    setActiveTab(tab);
    if (tab !== "crop-health") setSelectedDiagnosis(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    try {
      localStorage.setItem("agromitr_active_tab", activeTab);
    } catch {
      // Ignore localStorage errors
    }
  }, [activeTab]);

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

  useEffect(() => {
    const loadCrops = async () => {
      try {
        const response = await fetch(`${API_URL}/crops/`, {
          headers: {
            ...getAuthHeaders(),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load crops");
        }

        const data = await response.json();

        setCrops(
          Array.isArray(data)
            ? data
            : data.crops || []
        );
      } catch (error) {
        console.error("Failed to load crops:", error);
      }
    };

    if (authUser) {
      loadCrops();
    }
  }, [authUser]);

  useEffect(() => {
    const query = cropForm.location.trim();

    if (query.length < 3) {
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLocationLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
          { signal: controller.signal, headers: { Accept: "application/json" } }
        );

        if (response.ok) {
          setLocationSuggestions(await response.json());
        }
      } catch (error) {
        if (error.name !== "AbortError") console.error("Location search error:", error);
      } finally {
        setLocationLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cropForm.location]);

  const handleAddCrop = async (e) => {
    e.preventDefault();

    if (
      !cropForm.crop_name.trim() ||
      !cropForm.area ||
      !cropForm.planted_date
    ) {
      alert(pageText.fillCropFields);
      return;
    }

    try {
      setSavingCrop(true);

      const response = await fetch(
        editingCropId
          ? `${API_URL}/crops/${editingCropId}`
          : `${API_URL}/crops/`,
        {
          method: editingCropId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            crop_name: cropForm.crop_name.trim(),
            variety: cropForm.variety.trim() || null,

            area: Number(cropForm.area),
            area_unit: cropForm.area_unit,

            planted_date: cropForm.planted_date,

            expected_harvest_date:
              cropForm.expected_harvest_date || null,

            location:
              cropForm.location.trim() || null,

            irrigation_type:
              cropForm.irrigation_type || null,

            soil_type:
              cropForm.soil_type || null,

            notes:
              cropForm.notes.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || pageText.failedAddCrop
        );
      }

      await response.json().catch(() => null);

      const refreshedResponse = await fetch(
        `${API_URL}/crops/`,
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (refreshedResponse.ok) {
        const refreshedCrops = await refreshedResponse.json();
        setCrops(
          Array.isArray(refreshedCrops)
            ? refreshedCrops
            : refreshedCrops.crops || []
        );
      }

      setCropForm({
        crop_name: "",
        variety: "",
        area: "",
        area_unit: "acre",
        planted_date: "",
        expected_harvest_date: "",
        location: "",
        irrigation_type: "",
        soil_type: "",
        notes: "",
      });

      setShowAddCrop(false);
      setEditingCropId(null);
      setLocationSuggestions([]);

    } catch (error) {
      console.error("Add crop error:", error);

      alert(
        error.message ||
        pageText.unableAddCrop
      );

    } finally {
      setSavingCrop(false);
    }
  };

  const openCropEditor = (crop) => {
    setEditingCropId(crop.id);
    setCropForm({
      crop_name: crop.crop_name || "",
      variety: crop.variety || "",
      area: crop.area ?? "",
      area_unit: crop.area_unit || "acre",
      planted_date: crop.planted_date ? String(crop.planted_date).slice(0, 10) : "",
      expected_harvest_date: crop.expected_harvest_date ? String(crop.expected_harvest_date).slice(0, 10) : "",
      location: crop.location || "",
      irrigation_type: crop.irrigation_type || "",
      soil_type: crop.soil_type || "",
      notes: crop.notes || "",
    });
    setShowAddCrop(true);
  };

  const openNewCropForm = () => {
    setEditingCropId(null);
    setCropForm({
      crop_name: "",
      variety: "",
      area: "",
      area_unit: "acre",
      planted_date: "",
      expected_harvest_date: "",
      location: "",
      irrigation_type: "",
      soil_type: "",
      notes: "",
    });
    setLocationSuggestions([]);
    setShowAddCrop(true);
  };

  const handleDeleteCrop = async (cropId) => {
    const confirmed = window.confirm(
      pageText.confirmRemoveCrop
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/crops/${cropId}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || pageText.failedRemoveCrop
        );
      }

      // Remove it from the active crop list immediately
      setCrops((prevCrops) =>
        prevCrops.filter((crop) => crop.id !== cropId)
      );

    } catch (error) {
      console.error("Delete crop error:", error);
      alert(error.message || pageText.unableRemoveCrop);
    }
  };

  // ==========================================================
  // LOAD HISTORY
  // ==========================================================

  useEffect(() => {
    if (!authUser) return;

    loadHistory();
  }, [authUser]);


  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await axios.get(
        `${API_URL}/diagnose/`,
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      const diagnoses =
        response.data?.diagnoses || [];

      // Update the main history
      setHistory(diagnoses);

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
// FILE CHANGE
// ==========================================================

const handleImageSelect = (files) => {
  const fileArray = Array.from(files || []).slice(0, 5);

  if (fileArray.length === 0) {
    return;
  }

  setFile(fileArray[0]);
  setSelectedFiles(fileArray);

  setPreview(fileArray.map((selectedFile) => URL.createObjectURL(selectedFile)));

  setResult(null);
  setPestResult(null);
  setSelectedDiagnosis(null);
  setError("");
};

const handleFileChange = (event) => {
  handleImageSelect(event.target.files);
};

const handleDragEnter = (event) => {
  event.preventDefault();
  event.stopPropagation();
  setIsDragging(true);
};

const handleDragOver = (event) => {
  event.preventDefault();
  event.stopPropagation();
  setIsDragging(true);
};

const handleDragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();
  // Only reset if leaving the entire dropzone, not moving between children
  if (event.currentTarget === event.target || !event.currentTarget.contains(event.relatedTarget)) {
    setIsDragging(false);
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  event.stopPropagation();
  setIsDragging(false);

  const droppedFiles = event.dataTransfer.files;
  if (droppedFiles && droppedFiles.length > 0) {
    // Filter for image files only
    const imageFiles = Array.from(droppedFiles).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      handleImageSelect(imageFiles);
    }
  }
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

    selectedFiles.forEach((selectedFile) => formData.append("files", selectedFile));
    formData.append("language", language || "en");

    try {

      const response =
        await axios.post(
          `${API_URL}/diagnose/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...getAuthHeaders(),
            },
          }
        );

      const diagnosis =
        response.data.diagnosis;

      setResult(diagnosis);

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
    formData.append("language", language || "en");

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

  // Auto-scroll to diagnosis result when it appears
  useEffect(() => {
    if ((result || pestResult) && diagnosisResultRef.current) {
      diagnosisResultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [result, pestResult]);

  // ==========================================================
  // CHOOSE ANOTHER IMAGE
  // ==========================================================

  const chooseAnother = () => {

    setFile(null);
    setSelectedFiles([]);
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
    setSelectedFiles([]);
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


  // First-launch: language must be selected before anything else
  if (!hasSelectedLanguage) {
    return (
      <LanguageSelect
        onLanguageSelected={() => setHasSelectedLanguage(true)}
      />
    );
  }

  // Not logged in: show auth (register mode for new users, login for returning)
  if (!authUser) {
    return <Auth onLogin={handleLogin} initialMode="register" />;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="app">

      {/* ====================================================
          NAVBAR
      ==================================================== */}

      <header className="navbar">

        {/* BRAND */}
        <div className="brand">
          <span className="logo">
            <img
              src="/agromitr-logo.png"
              alt="AgroMitr"
            />
          </span>
          <span>AgroMitR</span>
        </div>


        {/* MAIN NAVIGATION */}
        <nav className="main-tabs" aria-label="Main navigation">

          <button
            type="button"
            className={activeTab === "home" ? "main-tab active" : "main-tab"}
            onClick={() => changeTab("home")}
          >
            <span>🏠</span>
            {pageText.home}
          </button>

          <button
            type="button"
            className={activeTab === "crops" ? "main-tab active" : "main-tab"}
            onClick={() => changeTab("crops")}
          >
            <span>🌱</span>
            {pageText.crops}
          </button>

          <button
            type="button"
            className={activeTab === "crop-health" ? "main-tab active" : "main-tab"}
            onClick={() => changeTab("crop-health")}
          >
            <span>🔬</span>
            {pageText.health}
          </button>

          <button
            type="button"
            className={activeTab === "weather" ? "main-tab active" : "main-tab"}
            onClick={() => changeTab("weather")}
          >
            <span>🌦️</span>
            {pageText.weather}
          </button>

          <button
            type="button"
            className={activeTab === "chat" ? "main-tab active" : "main-tab"}
            onClick={() => changeTab("chat")}
          >
            <span>🤖</span>
            {pageText.chat}
          </button>

          <button
            type="button"
            className={activeTab === "settings" ? "main-tab active" : "main-tab"}
            onClick={() => changeTab("settings")}
          >
            <span>⚙️</span>
            {t("settings", {}, "Settings")}
          </button>

        </nav>


        {/* USER AREA */}
        <div className="nav-user-area">

          <div
            className="nav-user"
            onClick={() => changeTab("settings")}
            style={{ cursor: "pointer" }}
            title={t("settings", {}, "Settings")}
          >

            <div className="nav-user-avatar">
              {authUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="nav-user-info">
              <span className="nav-user-name">
                {authUser?.name || "User"}
              </span>

              <span className="nav-user-role">
                {t("farmer", {}, "Farmer")}
              </span>
            </div>

          </div>

          <button
            type="button"
            className="nav-logout"
            onClick={handleLogout}
          >
            {t("logout", {}, "Logout")}
          </button>

        </div>

      </header>


      <main className="container">

        {activeTab === "home" && (
          <section className="dashboard-section">

            <div className="dashboard-hero redesigned-dashboard-hero">
              <div className="dashboard-welcome">
                <div className="dashboard-kicker">
                  <span className="status-dot"></span>
                  {pageText.farmOverview}
                </div>
                <h1>{pageText.farmTitle}</h1>
                <p className="dashboard-subtitle">
                  {pageText.farmSubtitle}
                </p>
              </div>

              <div className="dashboard-actions">
                <button type="button" className="dashboard-action secondary" onClick={() => changeTab("weather")}>
                  <span>🌦️</span>
                  {pageText.weather}
                </button>
                <button type="button" className="dashboard-action primary" onClick={() => changeTab("crop-health")}>
                  <span>＋</span>
                  {pageText.newHealthCheck}
                </button>
              </div>
            </div>

            <div className="stat-grid dashboard-stat-grid">
              <div className="stat-card dashboard-stat-card">
                <div className="stat-icon green">🌱</div>
                <div><strong>{crops.length}</strong><small>{pageText.trackedCrops}</small></div>
              </div>
              <div className="stat-card dashboard-stat-card">
                <div className="stat-icon blue">🩺</div>
                <div><strong>{history.length}</strong><small>{pageText.healthChecks}</small></div>
              </div>
              <div className="stat-card dashboard-stat-card">
                <div className="stat-icon amber">⚠️</div>
                <div><strong>{history.filter((item) => ["severe", "high"].includes(String(item.severity || "").toLowerCase())).length}</strong><small>{pageText.needsAttention}</small></div>
              </div>
              <div className="stat-card dashboard-stat-card">
                <div className="stat-icon amber">⚠️</div>
                <div><strong>{history.filter((item) => ["moderate", "medium"].includes(String(item.severity || "").toLowerCase())).length}</strong><small>{pageText.monitorClosely}</small></div>
              </div>
            </div>

            {/* =========================================================
                YOUR CROPS — HOME SUMMARY
                ========================================================= */}

            <section className="home-crops-summary">

              <div className="home-crops-summary-header">

                <div>
                  <span className="home-section-eyebrow">
                    {pageText.cropMonitoring}
                  </span>

                  <h2>{pageText.yourCrops}</h2>

                  <p>
                    {pageText.cropSummary}
                  </p>
                </div>

                <button
                  type="button"
                  className="home-view-crops-button"
                  onClick={() => changeTab("crops")}
                >
                  {pageText.viewAllCrops} →
                </button>

              </div>

              {crops.length === 0 ? (

                <div className="home-no-crops">

                  <div className="home-no-crops-icon">
                    🌱
                  </div>

                  <div>
                    <strong>{pageText.noCrops}</strong>

                    <p>
                      {pageText.addCropsPrompt}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => changeTab("crops")}
                  >
                    {pageText.addCrop}
                  </button>

                </div>

              ) : (

                <div className="home-crops-grid">

                  {crops.slice(0, 3).map((crop) => (

                    <div
                      className="home-crop-card"
                      key={crop.id}
                    >

                      <div className="home-crop-card-top">

                        <div className="home-crop-icon">
                          🌱
                        </div>

                        <div className="home-crop-name">

                          <h3>
                            {crop.crop_name || pageText.unnamedCrop}
                          </h3>

                          {crop.variety && (
                            <span>
                              {crop.variety}
                            </span>
                          )}

                        </div>

                      </div>

                      <div className="home-crop-info">

                        <div>
                            <small>{pageText.area}</small>

                          <strong>
                            {crop.area || "—"}{" "}
                            {getAreaUnitLabel(crop.area_unit, pageText)}
                          </strong>
                        </div>

                        <div>
                            <small>{pageText.growingFor}</small>

                          <strong>
                            {crop.days_since_planted != null
                              ? `${crop.days_since_planted} ${pageText.days || "days"}`
                              : "—"}
                          </strong>
                        </div>

                        <div>
                            <small>{pageText.location}</small>

                          <strong>
                            {crop.location || pageText.notProvided || "Not provided"}
                          </strong>
                        </div>

                      </div>

                      <div className="home-crop-card-footer">

                        <span>
                          {pageText.planted}{" "}
                          {crop.planted_date
                            ? new Date(
                                crop.planted_date
                              ).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>

                        <button
                          type="button"
                          onClick={() => changeTab("crops")}
                        >
                          {pageText.view || "View"} →
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

            <div className="dashboard-main-grid">

              <div className="dashboard-panel crops-panel">
                <div className="panel-heading dashboard-panel-heading">
                  <div>
                    <p className="eyebrow">{pageText.healthStatus}</p>
                    <h2>{pageText.cropsChecked}</h2>
                  </div>
                  <button type="button" className="text-button" onClick={() => changeTab("crop-health")}>
                    {pageText.healthCheck} →
                  </button>
                </div>

                {cropRecords.length === 0 ? (
                  <div className="dashboard-empty redesigned-empty">
                    <div className="empty-illustration">🌱</div>
                    <h3>{pageText.startRecord}</h3>
                    <p>
                      {pageText.healthRecordPrompt}
                    </p>
                    <button type="button" className="primary-small" onClick={() => changeTab("crop-health")}>
                      {pageText.newHealthCheck}
                    </button>
                  </div>
                ) : (
                  <div className="farm-crop-grid">
                    {displayHistory.slice(0, 6).map((item, index) => {
                      const severity = String(item.severity || "unknown").toLowerCase();

                      const healthLabel = severity === "severe" || severity === "high"
                        ? pageText.needsAttention
                        : severity === "moderate" || severity === "medium"
                          ? pageText.monitorClosely
                          : pageText.looksGood;
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
                              <strong>{item.crop || text.unknownCrop}</strong>
                              <span className={`health-badge ${severity}`}>{healthLabel}</span>
                            </div>
                            <span className="farm-crop-problem">
                              {item.diagnosis || text.noDiagnosis}
                            </span>
                            <div className="farm-crop-meta">
                              <span>{pageText.lastChecked}</span>
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
                    <p className="eyebrow">{pageText.trackRecord}</p>
                    <h2>{pageText.recentActivity}</h2>
                  </div>
                  <span className="activity-count">{history.length}</span>
                </div>

                {history.length === 0 ? (
                  <div className="activity-empty">
                    <span>◷</span>
                    <p>{pageText.noActivity}</p>
                  </div>
                ) : (
                  <div className="timeline-list">
                    {displayHistory.slice(0, 6).map((item) => (
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
                  <p className="eyebrow">{pageText.insight}</p>
                  <h3>{pageText.insightTitle}</h3>
                  <p>
                    {pageText.insightText}
                  </p>
                </div>
                <button type="button" onClick={() => changeTab("weather")}>{pageText.planWeather} →</button>
              </div>

              <div className="dashboard-quick-card">
                <div>
                  <p className="eyebrow">{pageText.quickAction}</p>
                  <h3>{pageText.needHelp}</h3>
                </div>
                <button type="button" onClick={() => changeTab("chat")}>
                  {pageText.ask} <span>→</span>
                </button>
              </div>
            </div>

          </section>
        )}

        {activeTab === "crops" && (
          <section className="your-crops-page">

            <div className="your-crops-header">
              <div>
                <span className="your-crops-eyebrow">
                  {pageText.cropMonitoring}
                </span>

                <h1>{pageText.yourCrops}</h1>

                <p>
                  {pageText.cropSummary}
                </p>
              </div>

              <button
                type="button"
                className="add-crop-button"
                onClick={openNewCropForm}
              >
                <span>＋</span>
                {pageText.addCrop}
              </button>
            </div>

            <div className="crop-overview">

              <div className="crop-overview-card">
                <span className="crop-overview-icon">🌱</span>
                <div>
                  <strong>{crops.length}</strong>
                  <span>{pageText.trackedCrops}</span>
                </div>
              </div>

              <div className="crop-overview-card">
                <span className="crop-overview-icon">📅</span>
                <div>
                  <strong>
                    {crops.filter(
                      (crop) => crop.planted_date
                    ).length}
                  </strong>
                  <span>{pageText.activeCrops}</span>
                </div>
              </div>

              <div className="crop-overview-card">
                <span className="crop-overview-icon">📍</span>
                <div>
                  <strong>
                    {
                      new Set(
                        crops
                          .map((crop) => crop.location)
                          .filter(Boolean)
                      ).size
                    }
                  </strong>
                  <span>{pageText.locations}</span>
                </div>
              </div>

            </div>

            <div className="your-crops-section">

              <div className="your-crops-section-header">
                <div>
                  <h2>{pageText.allCrops}</h2>
                  <p>
                    {pageText.cropInfo}
                  </p>
                </div>

                {crops.length > 0 && (
                  <span className="crop-count">
                    {crops.length}{" "}
                    {crops.length === 1
                      ? pageText.crop
                      : pageText.cropsLabel}
                  </span>
                )}
              </div>

              {crops.length === 0 ? (

                <div className="no-crops-card">

                  <div className="no-crops-icon">
                    🌱
                  </div>

                  <h3>{pageText.noCropsAdded}</h3>

                  <p>
                    {pageText.firstCropPrompt}
                  </p>

                  <button
                    type="button"
                    className="add-crop-empty-button"
                    onClick={openNewCropForm}
                  >
                    ＋ {pageText.addCrop}
                  </button>

                </div>

              ) : (

                <div className="crops-grid">

                  {crops.map((crop) => {

                    const plantedDate = crop.planted_date
                      ? new Date(crop.planted_date)
                      : null;

                    const daysSincePlanting =
                      plantedDate &&
                      !Number.isNaN(plantedDate.getTime())
                        ? Math.max(
                            0,
                            Math.floor(
                              (
                                new Date() -
                                plantedDate
                              ) /
                                (1000 * 60 * 60 * 24)
                            )
                          )
                        : null;

                    return (
                      <article
                        className="crop-card"
                        key={crop.id}
                      >

                        <div className="crop-card-top">

                          <div className="crop-card-icon">
                            🌱
                          </div>

                          <div className="crop-card-title">
                            <h3>
                              {crop.crop_name || pageText.unnamedCrop}
                            </h3>

                            {crop.variety && (
                              <span>
                                {crop.variety}
                              </span>
                            )}
                          </div>

                        </div>

                        <div className="crop-card-details">

                          <div className="crop-detail">
                            <span>🌾</span>
                            <div>
                              <small>{pageText.area}</small>
                              <strong>
                                {crop.area || "—"}{" "}
                                {getAreaUnitLabel(crop.area_unit, pageText)}
                              </strong>
                            </div>
                          </div>

                          <div className="crop-detail">
                            <span>📅</span>
                            <div>
                              <small>{pageText.growingFor}</small>
                              <strong>
                                {daysSincePlanting !== null
                                  ? `${daysSincePlanting} ${pageText.days || "days"}`
                                  : "—"}
                              </strong>
                            </div>
                          </div>

                          <div className="crop-detail">
                            <span>📍</span>
                            <div>
                              <small>{pageText.location}</small>
                              <strong>
                                {crop.location || pageText.notProvided}
                              </strong>
                            </div>
                          </div>

                          <div className="crop-detail">
                            <span>💧</span>
                            <div>
                              <small>{pageText.irrigation}</small>
                              <strong>
                                {crop.irrigation_type || pageText.notProvided}
                              </strong>
                            </div>
                          </div>

                        </div>

                        <div className="crop-card-footer">

                          <div>
                            <small>{pageText.planted}</small>
                            <strong>
                              {crop.planted_date
                                ? new Date(
                                    crop.planted_date
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "—"}
                            </strong>
                          </div>

                          <div>
                            <small>{pageText.harvest}</small>
                            <strong>
                              {crop.expected_harvest_date
                                ? new Date(
                                    crop.expected_harvest_date
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : pageText.notSet}
                            </strong>
                          </div>

                        </div>

                        {crop.notes && (
                          <div className="crop-card-notes">
                            <span>📝</span>
                            <p>{crop.notes}</p>
                          </div>
                        )}

                        <div className="crop-card-actions">
                          <button
                            type="button"
                            className="crop-edit-button"
                            onClick={() =>
                              openCropEditor(
                                crops.find((item) => item.id === crop.id) || crop
                              )
                            }
                          >
                            {pageText.editCrop}
                          </button>
                          <button
                            type="button"
                            className="crop-delete-button"
                            onClick={() => handleDeleteCrop(crop.id)}
                          >
                            {pageText.delete}
                          </button>
                        </div>

                      </article>
                    );
                  })}

                </div>

              )}

            </div>

            {showAddCrop && (
              <div className="crop-form-overlay">

                <div className="crop-form-modal">

                  <div className="crop-form-header">

                    <div>
                      <span className="your-crops-eyebrow">
                        {editingCropId ? pageText.editCrop : pageText.newCrop}
                      </span>

                      <h2>{editingCropId ? pageText.editCropTitle : pageText.addCropTitle}</h2>

                      <p>
                        {editingCropId
                          ? pageText.editCropDescription
                          : pageText.addCropDescription}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="crop-form-close"
                      onClick={() => { setShowAddCrop(false); setEditingCropId(null); }}
                    >
                      ×
                    </button>

                  </div>

                  <form
                    className="crop-form"
                    onSubmit={handleAddCrop}
                  >

                    {/* BASIC INFORMATION */}

                    <div className="crop-form-section">

                      <h3>{pageText.cropInformation}</h3>

                      <div className="crop-form-grid">

                        <label>
                          <span>
                            {pageText.cropName} <b>*</b>
                          </span>

                          <input
                            type="text"
                            placeholder={pageText.tomatoPlaceholder}
                            value={cropForm.crop_name}
                            onChange={(e) =>
                              setCropForm({
                                ...cropForm,
                                crop_name: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label>
                          <span>{pageText.variety}</span>

                          <input
                            type="text"
                            placeholder={pageText.varietyPlaceholder}
                            value={cropForm.variety}
                            onChange={(e) =>
                              setCropForm({
                                ...cropForm,
                                variety: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label>
                          <span>
                            {pageText.area} <b>*</b>
                          </span>

                          <div className="crop-area-input">

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder={pageText.areaPlaceholder}
                              value={cropForm.area}
                              onChange={(e) =>
                                setCropForm({
                                  ...cropForm,
                                  area: e.target.value,
                                })
                              }
                            />

                            <select
                              value={cropForm.area_unit}
                              onChange={(e) =>
                                setCropForm({
                                  ...cropForm,
                                  area_unit: e.target.value,
                                })
                              }
                            >
                              <option value="acre">
                                {pageText.acre}
                              </option>

                              <option value="hectare">
                                {pageText.hectare}
                              </option>

                              <option value="bigha">
                                {pageText.bigha}
                              </option>

                              <option value="guntha">
                                {pageText.guntha}
                              </option>

                              <option value="sqft">
                                {pageText.sqft}
                              </option>
                            </select>

                          </div>
                        </label>

                      </div>

                    </div>

                    {/* GROWTH INFORMATION */}

                    <div className="crop-form-section">

                      <h3>{pageText.growthInformation}</h3>

                      <div className="crop-form-grid">

                        <label>
                          <span>
                            {pageText.plantingDate} <b>*</b>
                          </span>

                          <input
                            type="date"
                            value={cropForm.planted_date}
                            onChange={(e) =>
                              setCropForm({
                                ...cropForm,
                                planted_date: e.target.value,
                              })
                            }
                          />
                        </label>

                        <label>
                          <span>
                            {pageText.expectedHarvest}
                          </span>

                          <input
                            type="date"
                            value={
                              cropForm.expected_harvest_date
                            }
                            onChange={(e) =>
                              setCropForm({
                                ...cropForm,
                                expected_harvest_date:
                                  e.target.value,
                              })
                            }
                          />
                        </label>

                      </div>

                    </div>

                    {/* FIELD INFORMATION */}

                    <div className="crop-form-section">

                      <h3>{pageText.fieldInformation}</h3>

                      <div className="crop-form-grid">

                        <label>
                          <span>{pageText.location}</span>

                          <input
                            type="text"
                            placeholder={pageText.villagePlaceholder}
                            value={cropForm.location}
                            onChange={(e) =>
                              setCropForm({
                                ...cropForm,
                                location: e.target.value,
                              })
                            }
                          />

                          {cropForm.location.trim().length >= 3 &&
                            (locationLoading || locationSuggestions.length > 0) && (
                            <div className="location-suggestions" role="listbox">
                              {locationLoading && <span className="location-loading">{pageText.searching}</span>}
                              {locationSuggestions.map((suggestion) => (
                                <button
                                  type="button"
                                  key={suggestion.place_id}
                                  onClick={() => {
                                    setCropForm({ ...cropForm, location: suggestion.display_name });
                                    setLocationSuggestions([]);
                                  }}
                                >
                                  {suggestion.display_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </label>

                        <label>
                          <span>{pageText.soilType}</span>

                          <select
                            value={cropForm.soil_type}
                            onChange={(e) =>
                              setCropForm({
                                ...cropForm,
                                soil_type: e.target.value,
                              })
                            }
                          >
                            <option value="">
                              {pageText.selectSoil}
                            </option>

                            <option value="Loamy">
                              {pageText.loamy}
                            </option>

                            <option value="Clay">
                              {pageText.clay}
                            </option>

                            <option value="Sandy">
                              {pageText.sandy}
                            </option>

                            <option value="Silty">
                              {pageText.silty}
                            </option>

                            <option value="Black Soil">
                              {pageText.blackSoil}
                            </option>

                            <option value="Red Soil">
                              {pageText.redSoil}
                            </option>

                            <option value="Other">
                              {pageText.other}
                            </option>
                          </select>
                        </label>

                        <label>
                          <span>{pageText.irrigation}</span>

                          <select
                            value={
                              cropForm.irrigation_type
                            }
                            onChange={(e) =>
                              setCropForm({
                                ...cropForm,
                                irrigation_type:
                                  e.target.value,
                              })
                            }
                          >
                            <option value="">
                              {pageText.selectIrrigation}
                            </option>

                            <option value="Rainfed">
                              {pageText.rainfed}
                            </option>

                            <option value="Drip">
                              {pageText.drip}
                            </option>

                            <option value="Sprinkler">
                              {pageText.sprinkler}
                            </option>

                            <option value="Flood">
                              {pageText.flood}
                            </option>

                            <option value="Other">
                              {pageText.other}
                            </option>
                          </select>
                        </label>

                      </div>

                    </div>

                    {/* NOTES */}

                    <div className="crop-form-section">

                      <h3>{pageText.fieldNotes}</h3>

                      <label className="crop-notes-field">

                        <span>
                          {pageText.notes}
                        </span>

                        <textarea
                          rows="4"
                          placeholder={pageText.notesPlaceholder}
                          value={cropForm.notes}
                          onChange={(e) =>
                            setCropForm({
                              ...cropForm,
                              notes: e.target.value,
                            })
                          }
                        />

                      </label>

                    </div>

                    {/* ACTIONS */}

                    <div className="crop-form-actions">

                      <button
                        type="button"
                        className="crop-cancel-button"
                        onClick={() =>
                          setShowAddCrop(false)
                        }
                      >
                        {pageText.cancel}
                      </button>

                      <button
                        type="submit"
                        className="crop-save-button"
                        disabled={savingCrop}
                      >
                          {savingCrop
                            ? pageText.save
                            : editingCropId ? pageText.saveChanges : `🌱 ${pageText.addCrop}`}
                      </button>

                    </div>

                  </form>

                </div>

              </div>
            )}
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
                  {pageText.protect}
                  <span>{pageText.beforeProblems}</span>
                </h1>

                <p className="crop-health-subtitle">
                  {pageText.protectSubtitle}
                </p>
              </div>

            </div>

            <div className="crop-health-status">
              <span className="status-dot"></span>
              {pageText.analysisReady}
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
                  <span>{pageText.disease}</span>

                  {mode === "disease" && (
                    <span className="selected-pill">
                      {pageText.selected}
                    </span>
                  )}
                </div>

                <h2>
                  {pageText.diseaseTitle}
                </h2>

                <p>
                  {pageText.diseaseDescription}
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
                  <span>{pageText.infestation}</span>

                  {mode === "pest" && (
                    <span className="selected-pill">
                      {pageText.selected}
                    </span>
                  )}
                </div>

                <h2>
                  {pageText.pestTitle}
                </h2>

                <p>
                  {pageText.pestDescription}
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
                    {pageText.stepOne}
                  </span>

                  <h2>
                    {pageText.uploadImage}
                  </h2>

                  <p>
                    {pageText.uploadDescription}
                  </p>
                </div>

                <div className="format-badge">
                  {pageText.imageFormats}
                </div>

              </div>


              {!preview ? (

                <label
                  className={`modern-upload-area ${isDragging ? "dragging" : ""}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <div className="upload-orb">
                    <span>↑</span>
                  </div>

                  <h3>
                    {pageText.dropImage}
                  </h3>

                  <p>
                    {pageText.browseImage}
                  </p>

                  <span className="upload-hint">
                    {pageText.uploadHint}
                  </span>

                </label>

              ) : (

                <div className="modern-preview">

                  <div className="preview-image-wrap">

                    <div className="multi-preview-grid">
                      {preview.map((image, index) => (
                        <img
                          key={image}
                          src={image}
                          alt={`Selected crop ${index + 1}`}
                          className="modern-preview-image"
                        />
                      ))}
                    </div>

                    <div className="preview-mode-badge">
                      {mode === "pest"
                        ? `🐛 ${pageText.pestAnalysis}`
                        : `🌿 ${pageText.diseaseAnalysis}`}
                    </div>

                  </div>

                  <div className="preview-footer">

                    <div>
                      <strong>
                        {selectedFiles.length > 1
                          ? `${selectedFiles.length} ${pageText.imagesSelected}`
                          : file?.name || pageText.selectedImage}
                      </strong>

                      <span>
                        {pageText.readyAnalysis}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="change-image-button"
                      onClick={chooseAnother}
                    >
                      {pageText.changeImage}
                    </button>

                  </div>

                </div>

              )}


              {error && (
                <div className="modern-error">
                  <span>⚠️</span>
                  <div>
                    <strong>{pageText.analysisError}</strong>
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
                  loading
                }
              >

                <span>
                  {loading
                    ? pageText.analyzing
                    : mode === "pest"
                      ? pageText.analyzePest
                      : pageText.analyzeDisease}
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
                    {pageText.aiAssisted}
                  </span>

                  <h3>
                    {pageText.whatChecks}
                  </h3>
                </div>
              </div>


              <div className="health-check-list">

                <div className="health-check-item">
                  <span>01</span>
                  <div>
                    <strong>{pageText.cropIdentification}</strong>
                    <p>
                      {pageText.detectsCrop}
                    </p>
                  </div>
                </div>

                <div className="health-check-item">
                  <span>02</span>
                  <div>
                    <strong>
                      {mode === "pest" ? pageText.pestSigns : pageText.diseaseSymptoms}
                    </strong>
                    <p>
                      {pageText.analyzesSigns}
                    </p>
                  </div>
                </div>

                <div className="health-check-item">
                  <span>03</span>
                  <div>
                    <strong>{pageText.riskAssessment}</strong>
                    <p>
                      {pageText.providesRisk}
                    </p>
                  </div>
                </div>

                <div className="health-check-item">
                  <span>04</span>
                  <div>
                    <strong>{pageText.actionGuidance}</strong>
                    <p>
                      {pageText.givesActions}
                    </p>
                  </div>
                </div>

              </div>


              <div className="health-safety-note">
                <span>✓</span>
                <p>
                  {pageText.safetyNote}
                </p>
              </div>

            </aside>

          </div>

        </section>


        {/* ==================================================
            CURRENT DIAGNOSIS RESULT
        ================================================== */}

        {displayResult && (

          <section className="result-section" ref={diagnosisResultRef}>

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
           <section className="result-section pest-result-section" ref={diagnosisResultRef}>
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
          <Weather history={history} labels={pageText} />
        )}

        {activeTab === "chat" && (
          <Chat
            history={history}
            currentDiagnosis={mode === "pest" ? pestResult : result}
            contextRequest={chatContextRequest}
            labels={pageText}
            language={language}
          />
        )}

        {activeTab === "settings" && (
          <Settings
            authUser={authUser}
            onUpdateUser={setAuthUser}
            crops={crops}
            onLogout={handleLogout}
          />
        )}

      </main>


      {/* FOOTER */}

      <footer>
        {t("footer", {}, "AgroMitR • Early Detection & Management")}
      </footer>

    </div>
  );
}

export default App;