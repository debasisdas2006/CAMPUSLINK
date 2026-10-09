from data_loader import load_jobs


def requirement_summary(jobs):

    return (
        jobs.groupby("company")
        .agg(
            required_skills=("required_skill", lambda x: ", ".join(x)),
            open_roles=("job_id", "count"),
            total_applications=("applications", "sum")
        )
        .reset_index()
        .sort_values(
            "total_applications",
            ascending=False
        )
    )


def skill_requirements(jobs):

    return (
        jobs.groupby("required_skill")
        .agg(
            companies=("company", "nunique"),
            jobs=("job_id", "count"),
            applications=("applications", "sum")
        )
        .reset_index()
        .sort_values(
            "applications",
            ascending=False
        )
    )


if __name__ == "__main__":

    jobs = load_jobs()

    print("\n===================================")
    print(" COMPANY REQUIREMENT ANALYTICS")
    print("===================================")

    print("\n--- Company Requirements ---")
    print(
        requirement_summary(jobs)
        .to_string(index=False)
    )

    print("\n--- Skill Requirements ---")
    print(
        skill_requirements(jobs)
        .to_string(index=False)
    )

    print("\nCOMPANY REQUIREMENT ANALYSIS COMPLETED")