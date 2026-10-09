import matplotlib.pyplot as plt
from data_loader import load_students
from collections import Counter


def create_skill_chart():

    students = load_students()

    counter = Counter()

    for skills in students["skills"].dropna():

        for skill in str(skills).split(","):
            counter[skill.strip()] += 1

    data = counter.most_common(10)

    skills = [item[0] for item in data]
    counts = [item[1] for item in data]

    plt.figure(figsize=(10, 5))

    plt.bar(skills, counts)

    plt.title("Top Student Skills")
    plt.xlabel("Skill")
    plt.ylabel("Number of Students")

    plt.xticks(rotation=45)

    plt.tight_layout()

    plt.savefig(
        "analytics/charts/skill_chart.png"
    )

    plt.close()

    print("Skill chart created.")


if __name__ == "__main__":
    create_skill_chart()