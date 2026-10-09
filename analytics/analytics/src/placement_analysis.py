from data_loader import load_students, load_placements


def placement_rate(students):
    total_students = len(students)

    if total_students == 0:
        return 0

    placed_students = (
        students["placement_status"]
        .astype(str)
        .str.strip()
        .str.lower()
        .eq("placed")
        .sum()
    )

    return round((placed_students / total_students) * 100, 2)


def average_package(placements):
    if placements.empty:
        return 0

    return round(placements["package_lpa"].mean(), 2)


def highest_package(placements):
    if placements.empty:
        return 0

    return round(placements["package_lpa"].max(), 2)


def lowest_package(placements):
    if placements.empty:
        return 0

    return round(placements["package_lpa"].min(), 2)


def branch_wise_placements(placements):
    return (
        placements.groupby("branch")
        .size()
        .reset_index(name="placed_students")
        .sort_values("placed_students", ascending=False)
    )


def company_wise_placements(placements):
    return (
        placements.groupby("company")
        .size()
        .reset_index(name="students_hired")
        .sort_values("students_hired", ascending=False)
    )


def package_by_company(placements):
    return (
        placements.groupby("company")["package_lpa"]
        .mean()
        .round(2)
        .reset_index(name="average_package_lpa")
        .sort_values("average_package_lpa", ascending=False)
    )


def generate_placement_report():

    students = load_students()
    placements = load_placements()

    report = {
        "total_students": len(students),
        "placed_students": len(placements),
        "placement_rate": placement_rate(students),
        "average_package_lpa": average_package(placements),
        "highest_package_lpa": highest_package(placements),
        "lowest_package_lpa": lowest_package(placements),
    }

    return report


if __name__ == "__main__":

    students = load_students()
    placements = load_placements()

    print("\n===================================")
    print(" CAMPUSLINK PLACEMENT ANALYTICS")
    print("===================================")

    report = generate_placement_report()

    print(f"\nTotal Students       : {report['total_students']}")
    print(f"Placed Students      : {report['placed_students']}")
    print(f"Placement Rate       : {report['placement_rate']}%")
    print(f"Average Package      : {report['average_package_lpa']} LPA")
    print(f"Highest Package      : {report['highest_package_lpa']} LPA")
    print(f"Lowest Package       : {report['lowest_package_lpa']} LPA")

    print("\n--- Branch-wise Placements ---")
    print(branch_wise_placements(placements).to_string(index=False))

    print("\n--- Company-wise Placements ---")
    print(company_wise_placements(placements).to_string(index=False))

    print("\n--- Average Package by Company ---")
    print(package_by_company(placements).to_string(index=False))

    print("\n===================================")
    print(" ANALYSIS COMPLETED")
    print("===================================")