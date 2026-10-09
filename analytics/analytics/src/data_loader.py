from pathlib import Path
import pandas as pd


# Find the CAMPUSLINK project folder
PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_DIR = PROJECT_ROOT / "analytics" / "data"


def load_students():
    """Load student data."""
    file_path = DATA_DIR / "students" / "students.csv"
    return pd.read_csv(file_path)


def load_companies():
    """Load company data."""
    file_path = DATA_DIR / "companies" / "companies.csv"
    return pd.read_csv(file_path)


def load_jobs():
    """Load job data."""
    file_path = DATA_DIR / "jobs" / "jobs.csv"
    return pd.read_csv(file_path)


def load_placements():
    """Load placement data."""
    file_path = DATA_DIR / "placements" / "placements.csv"
    return pd.read_csv(file_path)


if __name__ == "__main__":

    print("\n===== CAMPUSLINK ANALYTICS DATA LOADER =====")

    students = load_students()
    companies = load_companies()
    jobs = load_jobs()
    placements = load_placements()

    print("\nStudents:")
    print(students.head())

    print("\nCompanies:")
    print(companies.head())

    print("\nJobs:")
    print(jobs.head())

    print("\nPlacements:")
    print(placements.head())

    print("\n===== DATA LOADED SUCCESSFULLY =====")

    print(f"Students: {len(students)}")
    print(f"Companies: {len(companies)}")
    print(f"Jobs: {len(jobs)}")
    print(f"Placements: {len(placements)}")