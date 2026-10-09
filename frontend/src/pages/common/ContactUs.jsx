import React from "react";
import "./ContactUs.css";

const teamMembers = [
  {
    name: "Debasis Das",
    role: "AI/ML Engineer",
    position: "TEAM LEADER",
    initials: "DD",
    photo: "/team/debasis-das.jpg",
  },
  {
    name: "Abhijeet Sabut",
    role: "Data Analytics",
    initials: "AS",
    photo: "/team/abhijeet-sabut.jpg",
  },
  {
    name: "Abhisek Sabut",
    role: "Backend Developer",
    initials: "AS",
    photo: "/team/abhisek-sabut.jpg",
  },
  {
    name: "Adhikari S. Das",
    role: "Frontend & Animation Developer",
    initials: "AD",
    photo: "/team/adhikari-s-das.jpg",
  },
  {
    name: "Biswajit Panigrahi",
    role: "Database & Security",
    initials: "BP",
    photo: "/team/biswajit-panigrahi.jpg",
  },
  {
    name: "Subhadarshani Barik",
    role: "Testing & Bug Fixing",
    initials: "SB",
    photo: "/team/subhadarshani-barik.jpg",
  },
];

function MemberPhoto({ member }) {
  return (
    <div className="member-photo-wrapper">

      <img
        src={member.photo}
        alt={member.name}
        className="member-photo"
        onError={(event) => {
          event.currentTarget.style.display = "none";

          const fallback =
            event.currentTarget.parentElement.querySelector(
              ".member-photo-fallback"
            );

          if (fallback) {
            fallback.style.display = "flex";
          }
        }}
      />

      <div className="member-photo-fallback">
        {member.initials}
      </div>

    </div>
  );
}

function ContactUs() {
  return (
    <div className="contact-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="contact-header">

        <div className="contact-header-content">

          <h1>
            Contact Us
          </h1>

          <p>
            Meet the team behind CAMPUSLINK.
          </p>

        </div>

        <div className="contact-header-badge">
          CAMPUSLINK TEAM
          <span />
        </div>

      </div>


      {/* =====================================================
          TEAM SECTION
      ===================================================== */}

      <section className="team-section">

        {/* ===================================================
            TEAM LEADER
        =================================================== */}

        <div className="team-leader-wrapper">

          <div className="team-card team-leader-card">

            <MemberPhoto
              member={teamMembers[0]}
            />

            <div className="member-position">
              {teamMembers[0].position}
            </div>

            <h2>
              {teamMembers[0].name}
            </h2>

            <p>
              {teamMembers[0].role}
            </p>

          </div>

        </div>


        {/* ===================================================
            OTHER TEAM MEMBERS
        =================================================== */}

        <div className="team-grid">

          {teamMembers
            .slice(1)
            .map((member) => (

              <div
                className="team-card team-member-card"
                key={member.name}
              >

                <MemberPhoto
                  member={member}
                />

                <div className="member-information">

                  <h3>
                    {member.name}
                  </h3>

                  <p>
                    {member.role}
                  </p>

                </div>

              </div>

            ))}

        </div>

      </section>


      {/* =====================================================
          DEVELOPED BY
      ===================================================== */}

      <footer className="contact-footer">

        <div className="footer-line" />

        <div className="developed-label">
          DEVELOPED BY
        </div>


        {/* TECH MAVERICKS LOGO */}

        <div className="developer-logo-wrapper">

          <img
            src="/team/tech-mavericks.png"
            alt="Tech Mavericks"
            className="developer-logo"
            onError={(event) => {
              event.currentTarget.style.display = "none";

              const fallback =
                event.currentTarget.parentElement.querySelector(
                  ".developer-logo-fallback"
                );

              if (fallback) {
                fallback.style.display = "flex";
              }
            }}
          />

          <div className="developer-logo-fallback">
            TM
          </div>

        </div>


        <div className="developer-name">
          TECH MAVERICKS
        </div>

      </footer>

    </div>
  );
}

export default ContactUs;