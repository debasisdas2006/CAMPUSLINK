from data_loader import load_students
import pandas as pd


def calculate_readiness(row):

    score = 0

    # CGPA: maximum 40 points
    cgpa_score = min(float(row["cgpa"]) / 10 * 40, 40)

    # Skills: maximum 40 points
    skill_count = len(
        str(row["skills"]).split(",")
    )

    skill_score = min(skill_count * 10, 40)

    # Placement status: maximum 20 points
    placement_score = (
        20
        if str(row["placement_status"]).lower() == "placed"
        else 0
    )

    score = cgpa_score + skill_score + placement_score

    return round(min(score, 100), 2)


def generate_readiness(students):

    result = students.copy()

    result["readiness_score"] = result.apply(
        calculate_readiness,
        axis=1
    )

    result["readiness_level"] = pd.cut(
        result["readiness_score"],
        bins=[-1, 40, 70, 100],
        labels=["Needs Improvement", "Developing", "Ready"]
    )

    return result.sort_values(
        "readiness_score",
        ascending=False
    )


if __name__ == "__main__":

    students = load_students()

    result = generate_readiness(students)

    print("\n===================================")
    print(" CAMPUSLINK STUDENT READINESS")
    print("===================================")

    print(
        result[
            [
                "student_id",
                "name",
                "cgpa",
                "readiness_score",
                "readiness_level"
            ]
        ].to_string(index=False)
    )

    print("\nSTUDENT READINESS ANALYSIS COMPLETED")