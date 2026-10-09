from pathlib import Path
import json
import sys

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split


ROOT_DIR = Path(__file__).resolve().parents[1]

DATASET_PATH = ROOT_DIR / "data" / "processed" / "student_job_training.csv"
MODEL_DIR = ROOT_DIR / "models"
MODEL_PATH = MODEL_DIR / "student_job_matcher.pkl"
METADATA_PATH = MODEL_DIR / "metadata.json"


FEATURE_COLUMNS = [
    "cgpa",
    "experience_years",
    "degree_match",
    "language_match",
    "technical_skill_match",
    "required_skill_count",
    "matched_skill_count",
]

TARGET_COLUMN = "match_label"


def load_dataset() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Training dataset not found:\n{DATASET_PATH}"
        )

    df = pd.read_csv(DATASET_PATH)

    required_columns = FEATURE_COLUMNS + [TARGET_COLUMN]

    missing = [column for column in required_columns if column not in df.columns]

    if missing:
        raise ValueError(
            "Training dataset is missing columns:\n"
            + ", ".join(missing)
        )

    if len(df) < 20:
        raise ValueError(
            "Training dataset is too small. "
            "Add more real labelled student-job records before training."
        )

    df = df.dropna(subset=required_columns).copy()

    return df


def train_model(df: pd.DataFrame):
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    if y.nunique() < 2:
        raise ValueError(
            "match_label must contain at least two classes: 0 and 1."
        )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    report = classification_report(
        y_test,
        predictions,
        output_dict=True,
        zero_division=0,
    )

    return model, accuracy, report


def save_model(model):
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)


def update_metadata(accuracy: float, report: dict, row_count: int):
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    metadata = {}

    if METADATA_PATH.exists():
        try:
            metadata = json.loads(
                METADATA_PATH.read_text(encoding="utf-8")
            )
        except json.JSONDecodeError:
            metadata = {}

    if not isinstance(metadata, dict):
        metadata = {}

    models = metadata.get("models", [])

    model_info = {
        "model_name": "Student-Job Matcher",
        "model_version": "1.0",
        "model_type": "RandomForestClassifier",
        "status": "ACTIVE",
        "training_status": "COMPLETED",
        "accuracy": round(float(accuracy), 4),
        "training_rows": int(row_count),
        "features": FEATURE_COLUMNS,
        "evaluation": report,
        "artifact": str(MODEL_PATH.relative_to(ROOT_DIR)),
    }

    updated = False

    for index, existing in enumerate(models):
        if existing.get("model_name") == "Student-Job Matcher":
            models[index] = model_info
            updated = True
            break

    if not updated:
        models.append(model_info)

    metadata["models"] = models

    METADATA_PATH.write_text(
        json.dumps(metadata, indent=2),
        encoding="utf-8",
    )


def main():
    print("=" * 60)
    print("CAMPUSLINK Student-Job Matcher Training")
    print("=" * 60)

    try:
        print(f"\n[1] Loading dataset:")
        print(DATASET_PATH)

        df = load_dataset()

        print(f"Training rows: {len(df)}")
        print(f"Features: {len(FEATURE_COLUMNS)}")

        print("\n[2] Training Random Forest model...")
        model, accuracy, report = train_model(df)

        print("\n[3] Evaluation")
        print(f"Accuracy: {accuracy:.4f}")

        print("\nClassification report:")
        for label, metrics in report.items():
            if isinstance(metrics, dict):
                print(
                    f"  {label}: "
                    f"precision={metrics.get('precision', 0):.3f}, "
                    f"recall={metrics.get('recall', 0):.3f}, "
                    f"f1={metrics.get('f1-score', 0):.3f}"
                )

        print("\n[4] Saving model...")
        save_model(model)

        print(f"Model saved:")
        print(MODEL_PATH)

        print("\n[5] Updating metadata...")
        update_metadata(
            accuracy=accuracy,
            report=report,
            row_count=len(df),
        )

        print(f"Metadata updated:")
        print(METADATA_PATH)

        print("\n" + "=" * 60)
        print("TRAINING COMPLETED SUCCESSFULLY")
        print("=" * 60)

    except Exception as exc:
        print("\n[ERROR]")
        print(str(exc))
        sys.exit(1)


if __name__ == "__main__":
    main()