def company_summary(df):
    if df.empty:
        return {
            "total_companies": 0
        }

    possible_columns = [
        "company_name",
        "company",
        "name"
    ]

    company_column = next(
        (column for column in possible_columns if column in df.columns),
        None
    )

    if company_column is None:
        return {
            "total_companies": 0,
            "message": "Company column not found"
        }

    total_companies = df[company_column].nunique()

    return {
        "total_companies": int(total_companies)
    }