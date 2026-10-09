from data_loader import load_students, load_jobs
from collections import Counter


def extract_student_skills(students):

    counter = Counter()

    for skills in students["skills"].dropna():
        for skill in str(skills).split(","):
            counter[skill.strip()] += 1

    return counter


def student_skill_demand(students):

    counter = extract_student_skills(students)

    return (
        __import__("pandas")
        .DataFrame(
            counter.items(),
            columns=["skill", "students_with_skill"]
        )
        .sort_values("students_with_skill", ascending=False)
    )


def required_skill_demand(jobs):

    return (
        jobs.groupby("required_skill")
        .agg(
            job_count=("job_id", "count"),
            applications=("applications", "sum")
        )
        .reset_index()
        .sort_values("applications", ascending=False)
    )


def skill_gap(students, jobs):

    student_skills = set()

    for skills in students["skills"].dropna():
        for skill in str(skills).split(","):
            student_skills.add(skill.strip().lower())

    required_skills = set(
        jobs["required_skill"]
        .dropna()
        .astype(str)
        .str.strip()
        .str.lower()
    )

    missing = required_skills - student_skills

    return sorted(missing)


if __name__ == "__main__":

    students = load_students()
    jobs = load_jobs()

    print("\n===================================")
    print(" CAMPUSLINK SKILL ANALYTICS")
    print("===================================")

    print("\n--- Student Skills ---")
    print(student_skill_demand(students).to_string(index=False))

    print("\n--- Required Skills ---")
    print(required_skill_demand(jobs).to_string(index=False))

    print("\n--- Potential Skill Gaps ---")

    gaps = skill_gap(students, jobs)

    if gaps:
        for skill in gaps:
            print("-", skill)
    else:
        print("No major skill gaps detected.")

    print("\nSKILL ANALYSIS COMPLETED")