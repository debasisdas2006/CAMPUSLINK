import matplotlib.pyplot as plt
from data_loader import load_companies


def create_company_chart():

    companies = load_companies()

    data = companies.sort_values(
        "students_hired",
        ascending=False
    )

    plt.figure(figsize=(10, 5))

    plt.bar(
        data["company_name"],
        data["students_hired"]
    )

    plt.title("Students Hired by Company")
    plt.xlabel("Company")
    plt.ylabel("Students Hired")

    plt.xticks(rotation=45)

    plt.tight_layout()

    plt.savefig(
        "analytics/charts/company_chart.png"
    )

    plt.close()

    print("Company chart created.")


if __name__ == "__main__":
    create_company_chart()