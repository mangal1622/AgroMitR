import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const getImageUrl = (filename) => {
  if (!filename) return null;
  return `${API_URL}/uploads/${filename}`;
};

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/diagnose/`);
      setHistory(response.data.diagnoses || []);
    } catch (err) {
      console.error("History error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setSelectedDiagnosis(null);
    setError("");
  };

  const analyzeCrop = async () => {
    if (!file) {
      setError("Please select a crop image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_URL}/diagnose/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data.diagnosis);

      await loadHistory();
    } catch (err) {
      console.error(err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to connect to the Crop Health AI server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const chooseAnother = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSelectedDiagnosis(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const openDiagnosis = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);

    // Scroll to the detail section
    setTimeout(() => {
      document
        .getElementById("diagnosis-detail")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const backToHistory = () => {
    setSelectedDiagnosis(null);

    setTimeout(() => {
      document
        .getElementById("history")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="brand">
          <span className="logo">🌱</span>
          <span>Crop Health AI</span>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          AI System Online
        </div>
      </header>


      <main className="container">

        {/* HERO */}
        <section className="hero">

          <div className="hero-text">

            <p className="eyebrow">
              SMART CROP HEALTH
            </p>

            <h1>
              Detect crop problems
              <span> before they spread.</span>
            </h1>

            <p className="subtitle">
              Upload a crop or leaf image and our AI will
              analyze visible diseases, pests and
              plant-health symptoms.
            </p>

          </div>


          {/* UPLOAD / DIAGNOSIS CARD */}
          <div className="diagnosis-card">

            <div className="card-header">

              <div>
                <h2>Crop Diagnosis</h2>

                <p>
                  Upload a clear image of the affected plant.
                </p>
              </div>

              <span className="ai-badge">
                AI
              </span>

            </div>


            {!preview ? (

              <label className="upload-area">

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />

                <div className="upload-icon">
                  📷
                </div>

                <h3>
                  Upload crop image
                </h3>

                <p>
                  JPG, PNG or WEBP
                </p>

              </label>

            ) : (

              <div className="preview-container">

                <img
                  src={preview}
                  alt="Selected crop"
                  className="preview-image"
                />

                <button
                  type="button"
                  className="change-button"
                  onClick={chooseAnother}
                >
                  Choose another image
                </button>

              </div>

            )}


            {error && (
              <div className="error">
                {error}
              </div>
            )}


            <button
              type="button"
              className="analyze-button"
              onClick={analyzeCrop}
              disabled={!file || loading}
            >
              {loading
                ? "Analyzing crop..."
                : "Analyze Crop"}
            </button>

          </div>

        </section>


        {/* CURRENT DIAGNOSIS RESULT */}
        {result && (

          <section className="result-section">

            <div className="result-header">

              <div>
                <p className="eyebrow">
                  AI ANALYSIS COMPLETE
                </p>

                <h2>
                  Diagnosis Result
                </h2>
              </div>

              <div className="confidence">

                <strong>
                  {Math.round(
                    Number(result.confidence || 0) * 100
                  )}%
                </strong>

                <span>
                  confidence
                </span>

              </div>

            </div>


            <div className="result-grid">

              <div className="result-main">

                <div className="diagnosis-title">

                  <span className="crop-icon">
                    🌿
                  </span>

                  <div>

                    <p>
                      Detected crop
                    </p>

                    <h3>
                      {result.crop || "Unknown"}
                    </h3>

                  </div>

                </div>


                <div className="diagnosis-name">

                  <p>
                    Possible condition
                  </p>

                  <h2>
                    {result.diagnosis ||
                      "No specific condition detected"}
                  </h2>

                </div>


                <div className="tags">

                  <span>
                    {result.problem_type || "Unknown"}
                  </span>

                  <span>
                    Severity:{" "}
                    {result.severity || "Unknown"}
                  </span>

                </div>

              </div>


              <div className="symptoms">

                <h3>
                  Observed Symptoms
                </h3>

                {Array.isArray(result.symptoms) &&
                result.symptoms.length > 0 ? (

                  <ul>

                    {result.symptoms.map(
                      (symptom, index) => (
                        <li key={index}>
                          {symptom}
                        </li>
                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    No specific symptoms were returned.
                  </p>

                )}

              </div>

            </div>


            <div className="explanation">

              <h3>
                AI Explanation
              </h3>

              <p>
                {result.explanation ||
                  "No explanation was provided."}
              </p>

            </div>


            <div className="recommendations">

              <h3>
                Recommended Actions
              </h3>

              {Array.isArray(result.recommended_action) &&
              result.recommended_action.length > 0 ? (

                <div className="recommendation-list">

                  {result.recommended_action.map(
                    (action, index) => (

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
                  No recommendations were provided.
                </p>

              )}

            </div>


            {result.needs_expert_review && (

              <div className="expert-warning">

                <span>
                  ⚠️
                </span>

                <div>

                  <strong>
                    Expert review recommended
                  </strong>

                  <p>
                    Consider consulting an agricultural
                    expert before taking action.
                  </p>

                </div>

              </div>

            )}

          </section>

        )}


        {/* DIAGNOSIS DETAIL */}
        {selectedDiagnosis && (

          <section
            id="diagnosis-detail"
            className="detail-section"
          >

            <button
              type="button"
              className="back-button"
              onClick={backToHistory}
            >
              ← Back to History
            </button>


            <div className="detail-header">

              <div>

                <p className="eyebrow">
                  SAVED DIAGNOSIS
                </p>

                <h2>
                  Diagnosis Details
                </h2>

              </div>

              <span className="detail-case">
                Case #{selectedDiagnosis.id}
              </span>

            </div>


            <div className="detail-summary">

              {selectedDiagnosis.filename && (
                <img
                  src={getImageUrl(selectedDiagnosis.filename)}
                  alt={`${selectedDiagnosis.crop || "Crop"} diagnosis`}
                  className="detail-image"
                />
              )}

              <div className="detail-crop-icon">
                🌿
              </div>

              <div className="detail-crop">

                <p>
                  Detected crop
                </p>

                <h2>
                  {selectedDiagnosis.crop || "Unknown"}
                </h2>

                <span>
                  {selectedDiagnosis.problem_type ||
                    "Unknown problem"}
                </span>

              </div>


              <div className="detail-confidence">

                <strong>
                  {Math.round(
                    Number(
                      selectedDiagnosis.confidence || 0
                    ) * 100
                  )}%
                </strong>

                <span>
                  confidence
                </span>

              </div>

            </div>


            <div className="detail-diagnosis">

              <p>
                Possible condition
              </p>

              <h1>
                {selectedDiagnosis.diagnosis ||
                  "No diagnosis"}
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
                  "Unknown"}
              </span>

            </div>


            <div className="detail-grid">

              {/* SYMPTOMS */}
              <div className="detail-box">

                <h3>
                  Observed Symptoms
                </h3>

                {Array.isArray(
                  selectedDiagnosis.symptoms
                ) &&
                selectedDiagnosis.symptoms.length > 0 ? (

                  <ul>

                    {selectedDiagnosis.symptoms.map(
                      (symptom, index) => (

                        <li key={index}>
                          {symptom}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    No symptoms recorded.
                  </p>

                )}

              </div>


              {/* EXPLANATION */}
              <div className="detail-box">

                <h3>
                  AI Explanation
                </h3>

                <p>
                  {selectedDiagnosis.explanation ||
                    "No explanation recorded."}
                </p>

              </div>

            </div>


            {/* RECOMMENDATIONS */}
            <div className="detail-box recommendations-detail">

              <h3>
                Recommended Actions
              </h3>

              {Array.isArray(
                selectedDiagnosis.recommended_action
              ) &&
              selectedDiagnosis.recommended_action.length > 0 ? (

                <div className="recommendation-list">

                  {selectedDiagnosis.recommended_action.map(
                    (action, index) => (

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
                  No recommendations recorded.
                </p>

              )}

            </div>


            {/* META */}
            <div className="detail-meta">

              <span>
                Case ID: #{selectedDiagnosis.id}
              </span>

              <span>
                {selectedDiagnosis.created_at
                  ? new Date(
                      selectedDiagnosis.created_at
                    ).toLocaleString()
                  : "Date unavailable"}
              </span>

              <span>
                Expert review:{" "}
                {selectedDiagnosis.needs_expert_review
                  ? "Required"
                  : "Not required"}
              </span>

            </div>

          </section>

        )}


        {/* HISTORY */}
        <section
          id="history"
          className="history-section"
        >

          <div className="history-header">

            <div>

              <p className="eyebrow">
                YOUR RECORDS
              </p>

              <h2>
                Recent Diagnoses
              </h2>

            </div>

            <span className="history-count">
              {history.length}{" "}
              {history.length === 1
                ? "case"
                : "cases"}
            </span>

          </div>


          {historyLoading ? (

            <div className="history-empty">
              Loading diagnosis history...
            </div>

          ) : history.length === 0 ? (

            <div className="history-empty">

              <div className="history-empty-icon">
                🌿
              </div>

              <h3>
                No diagnoses yet
              </h3>

              <p>
                Upload a crop image to create your
                first diagnosis record.
              </p>

            </div>

          ) : (

            <div className="history-list">

              {history.map((item) => (

                <button
                  type="button"
                  className="history-card"
                  key={item.id}
                  onClick={() => openDiagnosis(item)}
                >

                  {item.filename ? (
                    <img
                      src={getImageUrl(item.filename)}
                      alt={`${item.crop || "Crop"} diagnosis`}
                      className="history-image"
                    />
                  ) : (
                    <div className="history-icon">
                      🌿
                    </div>
                  )}

                  <div className="history-info">

                    <div className="history-top">

                      <h3>
                        {item.crop || "Unknown crop"}
                      </h3>

                      <span
                        className={
                          "severity " +
                          String(
                            item.severity || "unknown"
                          ).toLowerCase()
                        }
                      >
                        {item.severity || "Unknown"}
                      </span>

                    </div>

                    <p className="history-diagnosis">
                      {item.diagnosis ||
                        "No diagnosis"}
                    </p>

                    <p className="history-date">
                      Case #{item.id}
                      {" • "}
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleString()
                        : "Date unavailable"}
                    </p>

                  </div>

                  <div className="history-confidence">

                    <strong>
                      {Math.round(
                        Number(
                          item.confidence || 0
                        ) * 100
                      )}%
                    </strong>

                    <span>
                      confidence
                    </span>

                  </div>

                  <span className="history-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>

          )}

        </section>

      </main>


      <footer>
        Crop Health AI • Early Detection & Management
      </footer>

    </div>
  );
}

export default App;