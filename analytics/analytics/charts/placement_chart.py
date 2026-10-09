import matplotlib.pyplot as plt
from data_loader import load_placements


def create_placement_chart():

    placements = load_placements()

    branch_data = placements.groupby("branch").size()

    plt.figure(figsize=(9, 5))

    branch_data.plot(
        kind="bar",
        title="Placements by Branch"
    )

    plt.xlabel("Branch")
    plt.ylabel("Students Placed")
    plt.tight_layout()

    plt.savefig(
        "analytics/charts/placement_chart.png"
    )

    plt.close()

    print("Placement chart created.")


if __name__ == "__main__":
    create_placement_chart()