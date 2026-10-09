def calculate_match_score(student_data: dict, job_data: dict) -> tuple[float, list[str]]:
    """
    Temporary matching interface.

    The actual AI/ML model will be connected here later
    by the AIML team member.
    """

    score = 0.0
    reasons = []

    student_skills = set(student_data.get("skills", []))
    required_skills = set(job_data.get("required_skills", []))

    if required_skills:
        matched_skills = student_skills.intersection(required_skills)

        score = (len(matched_skills) / len(required_skills)) * 100

        if matched_skills:
            reasons.append(
                f"Matched skills: {', '.join(sorted(matched_skills))}"
            )

        missing_skills = required_skills - student_skills

        if missing_skills:
            reasons.append(
                f"Missing skills: {', '.join(sorted(missing_skills))}"
            )

    else:
        reasons.append("No required skills provided by the job.")

    return round(score, 2), reasons