from data_loader import load_jobs


def total_jobs(jobs):
    return len(jobs)


def total_applications(jobs):
    return int(jobs["applications"].sum())


def average_applications(jobs):
    if jobs.empty:
        return 0
    return round(jobs["applications"].mean(), 2)


def role_demand(jobs):
    return (
        jobs.groupby("role")["applications"]
        .sum()
        .reset_index()
        .sort_values("applications", ascending=False)
    )


def company_job_demand(jobs):
    return (
        jobs.groupby("company")
        .agg(
            open_positions=("job_id", "count"),
            applications=("applications", "sum")
        )
        .reset_index()
        .sort_values("applications", ascending=False)
    )


def skill_demand(jobs):
    return (
        jobs.groupby("required_skill")["applications"]
        .sum()
        .reset_index()
        .sort_values("applications", ascending=False)
    )


if __name__ == "__main__":

    jobs = load_jobs()

    print("\n===================================")
    print(" CAMPUSLINK JOB DEMAND ANALYTICS")
    print("===================================")

    print(f"\nTotal Jobs          : {total_jobs(jobs)}")
    print(f"Total Applications  : {total_applications(jobs)}")
    print(f"Average Applications: {average_applications(jobs)}")

    print("\n--- Role Demand ---")
    print(role_demand(jobs).to_string(index=False))

    print("\n--- Company Job Demand ---")
    print(company_job_demand(jobs).to_string(index=False))

    print("\n--- Skill Demand ---")
    print(skill_demand(jobs).to_string(index=False))

    print("\nJOB DEMAND ANALYSIS COMPLETED")