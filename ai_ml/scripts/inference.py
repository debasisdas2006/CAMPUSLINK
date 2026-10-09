from pathlib import Path
from typing import Any, Dict

import json


# ============================================================
# CAMPUSLINK AI/ML - INFERENCE SERVICE
# ============================================================
#
# Purpose:
#   Provides one clean interface for Student-Job Matcher
#   inference.
#
# Behavior:
#   1. If a trained .pkl model exists:
#        -> load model
#        -> make prediction
#
#   2. If model does not exist:
#        -> report that trained inference is unavailable
#        -> DO NOT create a fake model
#
# This keeps the system ready for the real model later.
# ============================================================


ROOT_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = ROOT_DIR / "models"
MODEL_PATH = MODEL_DIR / "student_job_matcher.pkl"
METADATA_PATH = MODEL_DIR / "metadata.json"


MODEL_NAME = "Student-Job Matcher"
MODEL_VERSION = "1.0"


FEATURE_COLUMNS = [
    "cgpa",
    "experience_years",
    "degree_match",
    "language_match",
    "technical_skill_match",
    "required_skill_count",
    "matched_skill_count",
]


# ------------------------------------------------------------
# Optional ML dependencies
# ------------------------------------------------------------

try:
    import joblib
    import pandas as pd

    ML_AVAILABLE = True

except ImportError:
    joblib = None
    pd = None
    ML_AVAILABLE = False


# ------------------------------------------------------------
# Metadata
# ------------------------------------------------------------

def load_metadata() -> Dict[str, Any]:
    """
    Load model metadata if available.
    """

    if not METADATA_PATH.exists():
        return {}

    try:
        with METADATA_PATH.open(
            "r",
            encoding="utf-8",
        ) as file:
            data = json.load(file)

        if isinstance(data, dict):
            return data

    except (
        OSError,
        json.JSONDecodeError,
    ):
        pass

    return {}


# ------------------------------------------------------------
# Model status
# ------------------------------------------------------------

def get_model_status() -> Dict[str, Any]:
    """
    Return the current Student-Job Matcher model status.
    """

    metadata = load_metadata()

    model_exists = MODEL_PATH.exists()

    status = {
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "model_type": None,
        "status": "INACTIVE",
        "training_status": "NOT_TRAINED",
        "model_available": model_exists,
        "artifact": str(
            MODEL_PATH.relative_to(ROOT_DIR)
        ),
        "accuracy": None,
        "message": "",
    }

    # --------------------------------------------------------
    # Read metadata
    # --------------------------------------------------------

    models = metadata.get("models", [])

    if isinstance(models, list):

        for model in models:

            if not isinstance(model, dict):
                continue

            if model.get("model_name") == MODEL_NAME:

                status["model_version"] = model.get(
                    "model_version",
                    MODEL_VERSION,
                )

                status["model_type"] = model.get(
                    "model_type"
                )

                status["training_status"] = model.get(
                    "training_status",
                    "UNKNOWN",
                )

                status["accuracy"] = model.get(
                    "accuracy"
                )

                status["status"] = model.get(
                    "status",
                    "INACTIVE",
                )

                break

    # --------------------------------------------------------
    # Actual artifact check
    # --------------------------------------------------------

    if model_exists:

        status["model_available"] = True
        status["status"] = "ACTIVE"

        if not status["message"]:
            status["message"] = (
                "Trained Student-Job Matcher model is available."
            )

    else:

        status["model_available"] = False
        status["status"] = "INACTIVE"
        status["message"] = (
            "No trained student_job_matcher.pkl "
            "artifact is available yet."
        )

    if not ML_AVAILABLE:

        status["message"] += (
            " Install pandas and joblib for trained-model inference."
        )

    return status


# ------------------------------------------------------------
# Validate feature input
# ------------------------------------------------------------

def validate_features(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and normalize model input.
    """

    if not isinstance(data, dict):
        raise TypeError(
            "Input must be a dictionary."
        )

    missing = [
        column
        for column in FEATURE_COLUMNS
        if column not in data
    ]

    if missing:
        raise ValueError(
            "Missing model features: "
            + ", ".join(missing)
        )

    cleaned = {}

    for column in FEATURE_COLUMNS:

        value = data[column]

        try:
            cleaned[column] = float(value)

        except (
            TypeError,
            ValueError,
        ):
            raise ValueError(
                f"Feature '{column}' must be numeric."
            )

    # Integer-like features
    cleaned["required_skill_count"] = int(
        cleaned["required_skill_count"]
    )

    cleaned["matched_skill_count"] = int(
        cleaned["matched_skill_count"]
    )

    return cleaned


# ------------------------------------------------------------
# Load trained model
# ------------------------------------------------------------

def load_model():
    """
    Load the trained Student-Job Matcher model.
    """

    if not ML_AVAILABLE:

        raise RuntimeError(
            "Required ML dependencies are not installed. "
            "Run: pip install pandas scikit-learn joblib"
        )

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            "Trained model not found:\n"
            f"{MODEL_PATH}\n\n"
            "Train the model after sufficient validated "
            "training data is available."
        )

    return joblib.load(MODEL_PATH)


# ------------------------------------------------------------
# Prediction
# ------------------------------------------------------------

def predict_student_job_match(
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Predict student-job compatibility.

    Expected input:

        {
            "cgpa": 8.5,
            "experience_years": 1,
            "degree_match": 1,
            "language_match": 1.0,
            "technical_skill_match": 0.8,
            "required_skill_count": 5,
            "matched_skill_count": 4
        }
    """

    features = validate_features(data)

    model = load_model()

    row = [
        features[column]
        for column in FEATURE_COLUMNS
    ]

    dataframe = pd.DataFrame(
        [row],
        columns=FEATURE_COLUMNS,
    )

    prediction = model.predict(dataframe)

    match_label = int(
        prediction[0]
    )

    match_probability = None

    if hasattr(
        model,
        "predict_proba",
    ):

        probabilities = model.predict_proba(
            dataframe
        )[0]

        classes = list(
            getattr(
                model,
                "classes_",
                [],
            )
        )

        if 1 in classes:

            positive_index = classes.index(1)

            match_probability = (
                float(
                    probabilities[
                        positive_index
                    ]
                )
                * 100
            )

    result = {
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "match_label": match_label,
        "match_probability": (
            round(
                match_probability,
                2,
            )
            if match_probability is not None
            else None
        ),
        "prediction": (
            "GOOD_MATCH"
            if match_label == 1
            else "POOR_MATCH"
        ),
        "features_used": features,
    }

    return result


# ------------------------------------------------------------
# Safe prediction wrapper
# ------------------------------------------------------------

def try_predict(
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Safe inference wrapper.

    Returns a structured response instead of crashing
    when the model has not been trained yet.
    """

    try:

        result = predict_student_job_match(
            data
        )

        return {
            "success": True,
            "model_available": True,
            "result": result,
        }

    except FileNotFoundError as exc:

        return {
            "success": False,
            "model_available": False,
            "error_type": "MODEL_NOT_FOUND",
            "message": str(exc),
        }

    except (
        TypeError,
        ValueError,
    ) as exc:

        return {
            "success": False,
            "model_available": False,
            "error_type": "INVALID_INPUT",
            "message": str(exc),
        }

    except Exception as exc:

        return {
            "success": False,
            "model_available": MODEL_PATH.exists(),
            "error_type": "INFERENCE_ERROR",
            "message": str(exc),
        }


# ------------------------------------------------------------
# Demo
# ------------------------------------------------------------

def main():

    print("=" * 60)
    print("CAMPUSLINK STUDENT-JOB MODEL INFERENCE")
    print("=" * 60)

    # --------------------------------------------------------
    # Show model status
    # --------------------------------------------------------

    status = get_model_status()

    print("\nMODEL STATUS")
    print("-" * 60)

    for key, value in status.items():

        print(
            f"{key}: {value}"
        )

    # --------------------------------------------------------
    # Example feature input
    # --------------------------------------------------------

    example_input = {
        "cgpa": 8.5,
        "experience_years": 1,
        "degree_match": 1,
        "language_match": 1.0,
        "technical_skill_match": 0.8,
        "required_skill_count": 5,
        "matched_skill_count": 4,
    }

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    print("\nVALIDATING EXAMPLE INPUT")
    print("-" * 60)

    try:

        validated = validate_features(
            example_input
        )

        for key, value in validated.items():

            print(
                f"{key}: {value}"
            )

    except Exception as exc:

        print(
            f"Validation error: {exc}"
        )

        return

    # --------------------------------------------------------
    # Try model inference
    # --------------------------------------------------------

    print("\nTRYING MODEL INFERENCE")
    print("-" * 60)

    result = try_predict(
        example_input
    )

    print(
        json.dumps(
            result,
            indent=2,
        )
    )

    print("\n" + "=" * 60)
    print("INFERENCE CHECK FINISHED")
    print("=" * 60)


if __name__ == "__main__":
    main()