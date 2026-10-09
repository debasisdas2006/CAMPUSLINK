import matplotlib.pyplot as plt
from data_loader import load_jobs


def create_job_demand_chart():

    jobs = load_jobs()

    data = (
        jobs.groupby("role")["applications"]
        .sum()
        .sort_values(ascending=False)
        .head(10)
    )

    plt.figure(figsize=(10, 5))

    plt.bar(
        data.index,
        data.values
    )

    plt.title("Job Demand by Role")
    plt.xlabel("Job Role")
    plt.ylabel("Applications")

    plt.xticks(rotation=45)

    plt.tight_layout()

    plt.savefig(
        "analytics/charts/job_demand_chart.png"
    )

    plt.close()

    print("Job demand chart created.")


if __name__ == "__main__":
    create_job_demand_chart()