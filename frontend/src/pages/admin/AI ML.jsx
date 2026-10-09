import { useEffect, useState } from "react";
import {
  BrainCircuit,
  Save,
  RotateCcw,
  Activity,
  Video,
  Eye,
  Users,
  MessageSquare,
  Target,
  CheckCircle2,
  AlertTriangle,
  Settings2,
} from "lucide-react";

import "./AI ML.css";

const AI_ML_STORAGE_KEY =
  "campuslink_ai_ml_configuration";

const DEFAULT_CONFIG = {
  matchingEnabled: true,
  jobRecommendationEnabled: true,
  questionGenerationEnabled: true,
  interviewEvaluationEnabled: true,

  eligibilityThreshold: 60,
  jobMatchThreshold: 60,
  strongMatchThreshold: 75,
  excellentMatchThreshold: 90,

  aiMonitoringEnabled: true,
  faceDetectionEnabled: true,
  multipleFaceDetectionEnabled: true,
  movementMonitoringEnabled: true,
  cameraDisconnectDetectionEnabled: true,

  interviewEvaluationThreshold: 60,

  updatedAt: null,
};

function loadConfiguration() {
  try {
    const saved = localStorage.getItem(
      AI_ML_STORAGE_KEY
    );

    if (!saved) {
      return DEFAULT_CONFIG;
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_CONFIG;
    }

    return {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
  } catch (error) {
    console.error(
      "Could not load AI/ML configuration:",
      error
    );

    return DEFAULT_CONFIG;
  }
}

function AI_ML() {
  const [config, setConfig] =
    useState(DEFAULT_CONFIG);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    setConfig(loadConfiguration());
  }, []);

  const updateField = (field, value) => {
    setConfig((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSave = () => {
    try {
      const updatedConfig = {
        ...config,
        updatedAt:
          new Date().toISOString(),
      };

      localStorage.setItem(
        AI_ML_STORAGE_KEY,
        JSON.stringify(updatedConfig)
      );

      setConfig(updatedConfig);
      setSaved(true);
      setError("");

      window.dispatchEvent(
        new Event("campuslink_ai_ml_updated")
      );
    } catch (saveError) {
      console.error(
        "Could not save AI/ML configuration:",
        saveError
      );

      setError(
        "Could not save configuration."
      );

      setSaved(false);
    }
  };

  const handleReset = () => {
    setConfig({
      ...DEFAULT_CONFIG,
    });

    setSaved(false);
    setError("");
  };

  const getStatusText = () => {
    if (
      config.aiMonitoringEnabled &&
      config.interviewEvaluationEnabled
    ) {
      return "AI SYSTEM ACTIVE";
    }

    if (
      config.aiMonitoringEnabled ||
      config.interviewEvaluationEnabled
    ) {
      return "AI SYSTEM PARTIALLY ACTIVE";
    }

    return "AI SYSTEM LIMITED";
  };

  return (
    <div className="admin-ai-ml-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="admin-ai-ml-header">

        <div>

          <div className="admin-ai-ml-eyebrow">
            ADMIN CONTROL CENTER
          </div>

          <h1>
            AI / ML Configuration
          </h1>

          <p>
            Configure CampusLink matching,
            recommendation, interview evaluation
            and AI monitoring behavior.
          </p>

        </div>


        <div className="admin-ai-ml-header-status">

          <div className="admin-ai-ml-status-dot" />

          <span>
            {getStatusText()}
          </span>

        </div>

      </div>


      {/* =========================================
          SYSTEM OVERVIEW
      ========================================= */}

      <div className="admin-ai-ml-overview">

        <div className="admin-ai-ml-overview-card">

          <div className="admin-ai-ml-overview-icon">
            <BrainCircuit size={21} />
          </div>

          <div>
            <span>Matching Engine</span>

            <strong>
              {config.matchingEnabled
                ? "Enabled"
                : "Disabled"}
            </strong>
          </div>

        </div>


        <div className="admin-ai-ml-overview-card">

          <div className="admin-ai-ml-overview-icon">
            <Target size={21} />
          </div>

          <div>
            <span>Job Recommendation</span>

            <strong>
              {config.jobRecommendationEnabled
                ? "Enabled"
                : "Disabled"}
            </strong>
          </div>

        </div>


        <div className="admin-ai-ml-overview-card">

          <div className="admin-ai-ml-overview-icon">
            <Video size={21} />
          </div>

          <div>
            <span>Interview Monitoring</span>

            <strong>
              {config.aiMonitoringEnabled
                ? "Enabled"
                : "Disabled"}
            </strong>
          </div>

        </div>


        <div className="admin-ai-ml-overview-card">

          <div className="admin-ai-ml-overview-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>AI Evaluation</span>

            <strong>
              {config.interviewEvaluationEnabled
                ? "Enabled"
                : "Disabled"}
            </strong>
          </div>

        </div>

      </div>


      {/* =========================================
          ALERT
      ========================================= */}

      {saved && (
        <div className="admin-ai-ml-alert success">

          <CheckCircle2 size={17} />

          <span>
            AI/ML configuration saved successfully.
          </span>

        </div>
      )}


      {error && (
        <div className="admin-ai-ml-alert error">

          <AlertTriangle size={17} />

          <span>{error}</span>

        </div>
      )}


      {/* =========================================
          MATCHING ENGINE
      ========================================= */}

      <section className="admin-ai-ml-section">

        <div className="admin-ai-ml-section-header">

          <div className="admin-ai-ml-section-icon">
            <Target size={20} />
          </div>

          <div>

            <span>
              MATCHING ENGINE
            </span>

            <h2>
              Eligibility & Job Matching
            </h2>

            <p>
              Configure thresholds used by the
              student-job matching system.
            </p>

          </div>

        </div>


        <div className="admin-ai-ml-settings-grid">

          <label className="admin-ai-ml-toggle-row">

            <div>

              <strong>
                Matching Engine
              </strong>

              <span>
                Enable student-job matching.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                config.matchingEnabled
              }
              onChange={(event) =>
                updateField(
                  "matchingEnabled",
                  event.target.checked
                )
              }
            />

          </label>


          <label className="admin-ai-ml-toggle-row">

            <div>

              <strong>
                Job Recommendation
              </strong>

              <span>
                Enable AI-based job recommendations.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                config.jobRecommendationEnabled
              }
              onChange={(event) =>
                updateField(
                  "jobRecommendationEnabled",
                  event.target.checked
                )
              }
            />

          </label>

        </div>


        <div className="admin-ai-ml-number-grid">

          <label>

            <span>
              Eligibility Threshold (%)
            </span>

            <input
              type="number"
              min="0"
              max="100"
              value={
                config.eligibilityThreshold
              }
              onChange={(event) =>
                updateField(
                  "eligibilityThreshold",
                  Number(event.target.value)
                )
              }
            />

          </label>


          <label>

            <span>
              Job Match Threshold (%)
            </span>

            <input
              type="number"
              min="0"
              max="100"
              value={
                config.jobMatchThreshold
              }
              onChange={(event) =>
                updateField(
                  "jobMatchThreshold",
                  Number(event.target.value)
                )
              }
            />

          </label>


          <label>

            <span>
              Strong Match (%)
            </span>

            <input
              type="number"
              min="0"
              max="100"
              value={
                config.strongMatchThreshold
              }
              onChange={(event) =>
                updateField(
                  "strongMatchThreshold",
                  Number(event.target.value)
                )
              }
            />

          </label>


          <label>

            <span>
              Excellent Match (%)
            </span>

            <input
              type="number"
              min="0"
              max="100"
              value={
                config.excellentMatchThreshold
              }
              onChange={(event) =>
                updateField(
                  "excellentMatchThreshold",
                  Number(event.target.value)
                )
              }
            />

          </label>

        </div>

      </section>


      {/* =========================================
          AI QUESTION GENERATION
      ========================================= */}

      <section className="admin-ai-ml-section">

        <div className="admin-ai-ml-section-header">

          <div className="admin-ai-ml-section-icon">
            <MessageSquare size={20} />
          </div>

          <div>

            <span>
              QUESTION ENGINE
            </span>

            <h2>
              AI Question Generation
            </h2>

            <p>
              Control AI-generated technical and
              interview questions.
            </p>

          </div>

        </div>


        <label className="admin-ai-ml-toggle-row">

          <div>

            <strong>
              Question Generation
            </strong>

            <span>
              Enable AI-generated questions for
              assessments and interviews.
            </span>

          </div>

          <input
            type="checkbox"
            checked={
              config.questionGenerationEnabled
            }
            onChange={(event) =>
              updateField(
                "questionGenerationEnabled",
                event.target.checked
              )
            }
          />

        </label>

      </section>


      {/* =========================================
          INTERVIEW EVALUATION
      ========================================= */}

      <section className="admin-ai-ml-section">

        <div className="admin-ai-ml-section-header">

          <div className="admin-ai-ml-section-icon">
            <Activity size={20} />
          </div>

          <div>

            <span>
              INTERVIEW EVALUATION
            </span>

            <h2>
              AI Performance Evaluation
            </h2>

            <p>
              Configure automated interview
              evaluation behavior.
            </p>

          </div>

        </div>


        <label className="admin-ai-ml-toggle-row">

          <div>

            <strong>
              Interview Evaluation
            </strong>

            <span>
              Enable automated AI evaluation after
              the student completes an interview.
            </span>

          </div>

          <input
            type="checkbox"
            checked={
              config.interviewEvaluationEnabled
            }
            onChange={(event) =>
              updateField(
                "interviewEvaluationEnabled",
                event.target.checked
              )
            }
          />

        </label>


        <div className="admin-ai-ml-number-grid single">

          <label>

            <span>
              Evaluation Threshold (%)
            </span>

            <input
              type="number"
              min="0"
              max="100"
              value={
                config.interviewEvaluationThreshold
              }
              onChange={(event) =>
                updateField(
                  "interviewEvaluationThreshold",
                  Number(event.target.value)
                )
              }
            />

          </label>

        </div>

      </section>


      {/* =========================================
          AI MONITORING
      ========================================= */}

      <section className="admin-ai-ml-section">

        <div className="admin-ai-ml-section-header">

          <div className="admin-ai-ml-section-icon">
            <Eye size={20} />
          </div>

          <div>

            <span>
              INTERVIEW MONITORING
            </span>

            <h2>
              AI Student Monitoring
            </h2>

            <p>
              Configure the monitoring capabilities
              used during student interviews.
            </p>

          </div>

        </div>


        <div className="admin-ai-ml-settings-grid">

          <label className="admin-ai-ml-toggle-row">

            <div>

              <strong>
                AI Monitoring
              </strong>

              <span>
                Enable AI monitoring during interviews.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                config.aiMonitoringEnabled
              }
              onChange={(event) =>
                updateField(
                  "aiMonitoringEnabled",
                  event.target.checked
                )
              }
            />

          </label>


          <label className="admin-ai-ml-toggle-row">

            <div>

              <strong>
                Face Detection
              </strong>

              <span>
                Detect the student's face.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                config.faceDetectionEnabled
              }
              onChange={(event) =>
                updateField(
                  "faceDetectionEnabled",
                  event.target.checked
                )
              }
            />

          </label>


          <label className="admin-ai-ml-toggle-row">

            <div>

              <strong>
                Multiple Face Detection
              </strong>

              <span>
                Detect multiple people in the camera
                frame.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                config.multipleFaceDetectionEnabled
              }
              onChange={(event) =>
                updateField(
                  "multipleFaceDetectionEnabled",
                  event.target.checked
                )
              }
            />

          </label>


          <label className="admin-ai-ml-toggle-row">

            <div>

              <strong>
                Movement Monitoring
              </strong>

              <span>
                Monitor excessive movement during
                the interview.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                config.movementMonitoringEnabled
              }
              onChange={(event) =>
                updateField(
                  "movementMonitoringEnabled",
                  event.target.checked
                )
              }
            />

          </label>


          <label className="admin-ai-ml-toggle-row">

            <div>

              <strong>
                Camera Disconnect Detection
              </strong>

              <span>
                Detect camera disconnection events.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                config.cameraDisconnectDetectionEnabled
              }
              onChange={(event) =>
                updateField(
                  "cameraDisconnectDetectionEnabled",
                  event.target.checked
                )
              }
            />

          </label>

        </div>

      </section>


      {/* =========================================
          CONFIGURATION INFORMATION
      ========================================= */}

      <section className="admin-ai-ml-section">

        <div className="admin-ai-ml-section-header">

          <div className="admin-ai-ml-section-icon">
            <Settings2 size={20} />
          </div>

          <div>

            <span>
              CONFIGURATION STATUS
            </span>

            <h2>
              AI/ML System Information
            </h2>

          </div>

        </div>


        <div className="admin-ai-ml-info-grid">

          <div>

            <span>
              Configuration Storage
            </span>

            <strong>
              Browser Configuration
            </strong>

          </div>


          <div>

            <span>
              AI/ML API
            </span>

            <strong>
              localhost:8002
            </strong>

          </div>


          <div>

            <span>
              Last Updated
            </span>

            <strong>
              {config.updatedAt
                ? new Date(
                    config.updatedAt
                  ).toLocaleString()
                : "Not saved yet"}
            </strong>

          </div>


          <div>

            <span>
              Monitoring Permission
            </span>

            <strong>
              Student Camera / Microphone
            </strong>

          </div>

        </div>

      </section>


      {/* =========================================
          ACTIONS
      ========================================= */}

      <div className="admin-ai-ml-actions">

        <button
          type="button"
          className="admin-ai-ml-reset"
          onClick={handleReset}
        >
          <RotateCcw size={17} />
          Reset
        </button>


        <button
          type="button"
          className="admin-ai-ml-save"
          onClick={handleSave}
        >
          <Save size={17} />
          Save Configuration
        </button>

      </div>

    </div>
  );
}

export default AI_ML;