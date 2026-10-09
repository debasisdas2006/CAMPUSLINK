from data_loader import load_companies, load_jobs


def recruiter_summary():

    companies = load_companies()
    jobs = load_jobs()

    result = companies[
        [
            "company_name",
            "open_jobs",
            "students_hired"
        ]
    ].copy()

    result["applications"] = 0

    for company in result["company_name"]:
        applications = jobs.loc[
            jobs["company"] == company,
            "applications"
        ].sum()

        result.loc[
            result["company_name"] == company,
            "applications"
        ] = applications

    return result.sort_values(
        "students_hired",
        ascending=False
    )


if __name__ == "__main__":

    print("\n===================================")
    print(" CAMPUSLINK RECRUITER ANALYTICS")
    print("===================================")

    print(
        recruiter_summary()
        .to_string(index=False)
    )

    print("\nRECRUITER ANALYSIS COMPLETED")