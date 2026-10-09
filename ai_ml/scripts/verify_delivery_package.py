from pathlib import Path
import json


ROOT = Path(__file__).resolve().parents[1]


REQUIRED_FILES = [
    "requirements.txt",
    ".env.example",
    "API_DOCUMENTATION.md",

    "config/ai_ml_config.json",

    "models/README.md",
    "models/metadata.json",

    "notebooks/data_analysis.ipynb",
    "notebooks/feature_engineering.ipynb",
    "notebooks/model_training.ipynb",
    "notebooks/interview_analysis.ipynb",

    "samples/matching_request.json",
    "samples/matching_response.json",
    "samples/assessment_request.json",
    "samples/assessment_response.json",
    "samples/interview_request.json",
    "samples/interview_response.json",
    "samples/monitoring_request.json",
    "samples/monitoring_response.json",

    "scripts/train_models.py",
    "scripts/inference.py",
    "scripts/verify_delivery_package.py"
]


JSON_FILES = [
    "config/ai_ml_config.json",
    "models/metadata.json",

    "samples/matching_request.json",
    "samples/matching_response.json",

    "samples/assessment_request.json",
    "samples/assessment_response.json",

    "samples/interview_request.json",
    "samples/interview_response.json",

    "samples/monitoring_request.json",
    "samples/monitoring_response.json",

    "notebooks/data_analysis.ipynb",
    "notebooks/feature_engineering.ipynb",
    "notebooks/model_training.ipynb",
    "notebooks/interview_analysis.ipynb"
]


def check_file(relative_path: str) -> bool:
    path = ROOT / relative_path

    if path.exists():
        print(f"[PASS] {relative_path}")
        return True

    print(f"[MISSING] {relative_path}")
    return False


def check_json(relative_path: str) -> bool:
    path = ROOT / relative_path

    try:
        with path.open(
            "r",
            encoding="utf-8"
        ) as file:
            json.load(file)

        print(f"[PASS] JSON valid: {relative_path}")
        return True

    except Exception as exc:
        print(f"[FAIL] JSON invalid: {relative_path}")
        print(f"       {exc}")
        return False


def main() -> None:

    print("=" * 70)
    print("CAMPUSLINK AI/ML FINAL DELIVERY CHECK")
    print("=" * 70)

    passed = 0
    total = len(REQUIRED_FILES)

    print()
    print("REQUIRED FILES")
    print("-" * 70)

    for file_name in REQUIRED_FILES:
        if check_file(file_name):
            passed += 1

    print()
    print("JSON / JUPYTER VALIDATION")
    print("-" * 70)

    json_passed = 0
    json_total = len(JSON_FILES)

    for file_name in JSON_FILES:
        if check_json(file_name):
            json_passed += 1

    print()
    print("=" * 70)
    print(f"Required files: {passed}/{total}")
    print(f"Valid JSON:     {json_passed}/{json_total}")
    print("=" * 70)

    models_dir = ROOT / "models"
    pkl_files = list(models_dir.glob("*.pkl"))

    print()

    if pkl_files:
        print("[INFO] Trained model files found:")
        for model_file in pkl_files:
            print(f"       {model_file.name}")
    else:
        print("[INFO] No .pkl model files found.")
        print(
            "[INFO] Current implementation is documented as rule-based."
        )


if __name__ == "__main__":
    main()