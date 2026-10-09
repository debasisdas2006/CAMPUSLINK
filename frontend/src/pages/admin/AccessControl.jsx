import React, { useMemo, useState } from "react";

import {
  ShieldCheck,
  Users,
  BriefcaseBusiness,
  Search,
  Eye,
  Ban,
  CheckCircle2,
  X,
  Mail,
  Building2,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

import "./AccessControl.css";

/* =========================================================
   DEMO USERS
========================================================= */

const DEMO_USERS = [
  {
    id: "DEMO-STUDENT-001",
    name: "Rahul Sharma",
    email: "student@campuslink.com",
    role: "student",
    status: "active",
    college: "ABC Engineering College",
    company: "",
  },
  {
    id: "DEMO-RECRUITER-001",
    name: "Priya Recruiter",
    email: "recruiter@campuslink.com",
    role: "recruiter",
    status: "active",
    college: "",
    company: "ABC Technologies",
  },
  {
    id: "DEMO-ADMIN-001",
    name: "CampusLink Admin",
    email: "admin@campuslink.com",
    role: "admin",
    status: "active",
    college: "",
    company: "CAMPUSLINK",
  },
];

/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (
    value === "student" ||
    value === "students"
  ) {
    return "student";
  }

  if (
    value === "recruiter" ||
    value === "recruiters"
  ) {
    return "recruiter";
  }

  if (
    value === "admin" ||
    value === "admins"
  ) {
    return "admin";
  }

  return "student";
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(status) {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (
    value === "blocked" ||
    value === "inactive" ||
    value === "disabled"
  ) {
    return "blocked";
  }

  if (value === "pending") {
    return "pending";
  }

  return "active";
}

/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {
  return String(name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

/* =========================================================
   ROLE LABEL
========================================================= */

function roleLabel(role) {
  if (role === "student") {
    return "Student";
  }

  if (role === "recruiter") {
    return "Recruiter";
  }

  if (role === "admin") {
    return "Admin";
  }

  return "User";
}

/* =========================================================
   STATUS LABEL
========================================================= */

function statusLabel(status) {
  if (status === "active") {
    return "Active";
  }

  if (status === "blocked") {
    return "Blocked";
  }

  if (status === "pending") {
    return "Pending";
  }

  return "Active";
}

/* =========================================================
   COMPONENT
========================================================= */

function AccessControl() {
  /* =======================================================
     LOAD USERS
  ======================================================= */

  const [users, setUsers] = useState(() => {
    try {
      const storedUsers = JSON.parse(
        localStorage.getItem(
          "campuslink_registered_users"
        ) || "[]"
      );

      const registeredUsers = Array.isArray(
        storedUsers
      )
        ? storedUsers.map((user) => ({
            ...user,
            role: normalizeRole(user.role),
            status: normalizeStatus(
              user.status
            ),
          }))
        : [];

      const combinedUsers = [
        ...DEMO_USERS,
        ...registeredUsers,
      ];

      const uniqueUsers = [];
      const seen = new Set();

      combinedUsers.forEach((user) => {
        const key = String(
          user.email ||
            user.id ||
            `${user.name}-${user.role}`
        )
          .trim()
          .toLowerCase();

        if (!seen.has(key)) {
          seen.add(key);

          uniqueUsers.push({
            ...user,
            role: normalizeRole(user.role),
            status: normalizeStatus(
              user.status
            ),
          });
        }
      });

      return uniqueUsers;
    } catch (error) {
      console.error(
        "Could not load CampusLink users:",
        error
      );

      return DEMO_USERS;
    }
  });

  /* =======================================================
     FILTERS
  ======================================================= */

  const [roleFilter, setRoleFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [searchText, setSearchText] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  /* =======================================================
     FILTERED USERS
  ======================================================= */

  const filteredUsers = useMemo(() => {
    const search = searchText
      .trim()
      .toLowerCase();

    return users.filter((user) => {
      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        user.status === statusFilter;

      const matchesSearch =
        !search ||
        String(user.name || "")
          .toLowerCase()
          .includes(search) ||
        String(user.email || "")
          .toLowerCase()
          .includes(search) ||
        String(user.company || "")
          .toLowerCase()
          .includes(search) ||
        String(user.college || "")
          .toLowerCase()
          .includes(search);

      return (
        matchesRole &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    users,
    roleFilter,
    statusFilter,
    searchText,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(
    () => ({
      total: users.length,

      students: users.filter(
        (user) =>
          user.role === "student"
      ).length,

      recruiters: users.filter(
        (user) =>
          user.role === "recruiter"
      ).length,

      admins: users.filter(
        (user) =>
          user.role === "admin"
      ).length,

      active: users.filter(
        (user) =>
          user.status === "active"
      ).length,

      blocked: users.filter(
        (user) =>
          user.status === "blocked"
      ).length,
    }),
    [users]
  );

  /* =======================================================
     SAVE USERS
  ======================================================= */

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);

    try {
      const registeredUsers =
        updatedUsers.filter(
          (user) =>
            !String(user.id || "").startsWith(
              "DEMO-"
            )
        );

      localStorage.setItem(
        "campuslink_registered_users",
        JSON.stringify(registeredUsers)
      );

      window.dispatchEvent(
        new Event(
          "campuslink_users_updated"
        )
      );
    } catch (error) {
      console.error(
        "Could not save CampusLink users:",
        error
      );
    }
  };

  /* =======================================================
     CHANGE STATUS
  ======================================================= */

  const changeUserStatus = (user) => {
    if (!user) {
      return;
    }

    if (
      user.role === "admin" &&
      user.status === "active" &&
      summary.admins === 1
    ) {
      window.alert(
        "The last active admin cannot be blocked."
      );

      return;
    }

    if (
      String(user.id || "").startsWith(
        "DEMO-"
      )
    ) {
      window.alert(
        "Demo accounts are protected and cannot be changed."
      );

      return;
    }

    const nextStatus =
      user.status === "blocked"
        ? "active"
        : "blocked";

    const updatedUsers =
      users.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      );

    saveUsers(updatedUsers);

    if (
      selectedUser &&
      selectedUser.id === user.id
    ) {
      setSelectedUser({
        ...user,
        status: nextStatus,
      });
    }
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshUsers = () => {
    try {
      const storedUsers = JSON.parse(
        localStorage.getItem(
          "campuslink_registered_users"
        ) || "[]"
      );

      const registeredUsers =
        Array.isArray(storedUsers)
          ? storedUsers.map((user) => ({
              ...user,
              role: normalizeRole(
                user.role
              ),
              status: normalizeStatus(
                user.status
              ),
            }))
          : [];

      const combinedUsers = [
        ...DEMO_USERS,
        ...registeredUsers,
      ];

      const uniqueUsers = [];
      const seen = new Set();

      combinedUsers.forEach((user) => {
        const key = String(
          user.email ||
            user.id ||
            `${user.name}-${user.role}`
        )
          .trim()
          .toLowerCase();

        if (!seen.has(key)) {
          seen.add(key);

          uniqueUsers.push({
            ...user,
            role: normalizeRole(
              user.role
            ),
            status: normalizeStatus(
              user.status
            ),
          });
        }
      });

      setUsers(uniqueUsers);
    } catch (error) {
      console.error(
        "Could not refresh users:",
        error
      );
    }
  };

  /* =======================================================
     ROLE ICON
  ======================================================= */

  const RoleIcon = ({ role }) => {
    if (role === "admin") {
      return <ShieldCheck size={16} />;
    }

    if (role === "recruiter") {
      return (
        <BriefcaseBusiness size={16} />
      );
    }

    return <GraduationCap size={16} />;
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="access-page">

      {/* HEADER */}

      <div className="access-header">

        <div className="access-title-area">

          <div className="access-title-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <div className="access-eyebrow">
              SYSTEM MANAGEMENT
            </div>

            <h1>
              Access Control
            </h1>

            <p>
              Manage platform users, roles and
              account access.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="access-refresh-button"
          onClick={refreshUsers}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>


      {/* SUMMARY */}

      <div className="access-summary-grid">

        <div className="access-summary-card">

          <div className="access-summary-icon access-summary-icon-total">
            <Users size={21} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>
              {summary.total}
            </strong>
          </div>

        </div>


        <div className="access-summary-card">

          <div className="access-summary-icon access-summary-icon-student">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>Students</span>
            <strong>
              {summary.students}
            </strong>
          </div>

        </div>


        <div className="access-summary-card">

          <div className="access-summary-icon access-summary-icon-recruiter">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <span>Recruiters</span>
            <strong>
              {summary.recruiters}
            </strong>
          </div>

        </div>


        <div className="access-summary-card">

          <div className="access-summary-icon access-summary-icon-admin">
            <ShieldCheck size={21} />
          </div>

          <div>
            <span>Admins</span>
            <strong>
              {summary.admins}
            </strong>
          </div>

        </div>

      </div>


      {/* FILTER PANEL */}

      <div className="access-control-panel">

        {/* SEARCH */}

        <div className="access-search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, email, college or company..."
            value={searchText}
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
          />

          {searchText && (
            <button
              type="button"
              className="access-search-clear"
              onClick={() =>
                setSearchText("")
              }
            >
              <X size={16} />
            </button>
          )}

        </div>


        {/* ROLE FILTER */}

        <div className="access-filter-section">

          <div className="access-filter-label">
            ROLE
          </div>

          <div className="access-filter-buttons">

            <button
              type="button"
              className={`access-filter-button ${
                roleFilter === "ALL"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setRoleFilter("ALL")
              }
            >
              <Users size={16} />
              All Roles
            </button>


            <button
              type="button"
              className={`access-filter-button ${
                roleFilter === "student"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setRoleFilter("student")
              }
            >
              <GraduationCap size={16} />
              Students
            </button>


            <button
              type="button"
              className={`access-filter-button ${
                roleFilter === "recruiter"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setRoleFilter("recruiter")
              }
            >
              <BriefcaseBusiness size={16} />
              Recruiters
            </button>


            <button
              type="button"
              className={`access-filter-button ${
                roleFilter === "admin"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setRoleFilter("admin")
              }
            >
              <ShieldCheck size={16} />
              Admins
            </button>

          </div>

        </div>


        {/* STATUS FILTER */}

        <div className="access-filter-section">

          <div className="access-filter-label">
            ACCOUNT STATUS
          </div>

          <div className="access-filter-buttons">

            <button
              type="button"
              className={`access-filter-button ${
                statusFilter === "ALL"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setStatusFilter("ALL")
              }
            >
              All Status
            </button>


            <button
              type="button"
              className={`access-filter-button ${
                statusFilter === "active"
                  ? "active status-active"
                  : ""
              }`}
              onClick={() =>
                setStatusFilter("active")
              }
            >
              <CheckCircle2 size={16} />
              Active
            </button>


            <button
              type="button"
              className={`access-filter-button ${
                statusFilter === "blocked"
                  ? "active status-blocked"
                  : ""
              }`}
              onClick={() =>
                setStatusFilter("blocked")
              }
            >
              <Ban size={16} />
              Blocked
            </button>


            <button
              type="button"
              className={`access-filter-button ${
                statusFilter === "pending"
                  ? "active status-pending"
                  : ""
              }`}
              onClick={() =>
                setStatusFilter("pending")
              }
            >
              Pending
            </button>

          </div>

        </div>

      </div>


      {/* RESULT BAR */}

      <div className="access-result-bar">

        <div>
          Showing{" "}
          <strong>
            {filteredUsers.length}
          </strong>{" "}
          of{" "}
          <strong>
            {users.length}
          </strong>{" "}
          users
        </div>

        <div className="access-current-filter">

          <span>Role:</span>

          <strong>
            {roleFilter === "ALL"
              ? "All Roles"
              : roleLabel(roleFilter)}
          </strong>

          <span className="filter-divider">
            |
          </span>

          <span>Status:</span>

          <strong>
            {statusFilter === "ALL"
              ? "All Status"
              : statusLabel(
                  statusFilter
                )}
          </strong>

        </div>

      </div>


      {/* USER TABLE */}

      <div className="access-users-card">

        <div className="access-table-header">

          <div>

            <span className="access-eyebrow">
              PLATFORM USERS
            </span>

            <h2>
              User Access
            </h2>

          </div>

          <div className="access-user-count">
            {filteredUsers.length} records
          </div>

        </div>


        {filteredUsers.length === 0 ? (

          <div className="access-empty">

            <div className="access-empty-icon">
              <Users size={28} />
            </div>

            <h3>
              No users found
            </h3>

            <p>
              No users match the selected
              role, status and search criteria.
            </p>

            <button
              type="button"
              onClick={() => {
                setRoleFilter("ALL");
                setStatusFilter("ALL");
                setSearchText("");
              }}
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="access-table-wrapper">

            <table className="access-table">

              <thead>

                <tr>
                  <th>USER</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>STATUS</th>
                  <th>AFFILIATION</th>
                  <th>ACTION</th>
                </tr>

              </thead>


              <tbody>

                {filteredUsers.map(
                  (user) => (

                    <tr
                      key={
                        user.id ||
                        user.email
                      }
                    >

                      {/* USER */}

                      <td>

                        <div className="access-user-cell">

                          <div className="access-avatar">
                            {getInitials(
                              user.name
                            )}
                          </div>

                          <div>

                            <strong>
                              {user.name ||
                                "Unnamed User"}
                            </strong>

                            <small>
                              {user.id ||
                                "User"}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>

                        <div className="access-email-cell">

                          <Mail size={15} />

                          <span>
                            {user.email ||
                              "No email"}
                          </span>

                        </div>

                      </td>


                      {/* ROLE */}

                      <td>

                        <div
                          className={`access-role-badge access-role-${user.role}`}
                        >

                          <RoleIcon
                            role={user.role}
                          />

                          <span>
                            {roleLabel(
                              user.role
                            )}
                          </span>

                        </div>

                      </td>


                      {/* STATUS */}

                      <td>

                        <div
                          className={`access-status-badge access-status-${user.status}`}
                        >

                          {user.status ===
                            "active" && (
                            <CheckCircle2
                              size={15}
                            />
                          )}

                          {user.status ===
                            "blocked" && (
                            <Ban
                              size={15}
                            />
                          )}

                          {statusLabel(
                            user.status
                          )}

                        </div>

                      </td>


                      {/* AFFILIATION */}

                      <td>

                        <div className="access-affiliation">

                          {user.company ? (
                            <>
                              <Building2
                                size={15}
                              />

                              <span>
                                {user.company}
                              </span>
                            </>
                          ) : user.college ? (
                            <>
                              <GraduationCap
                                size={15}
                              />

                              <span>
                                {user.college}
                              </span>
                            </>
                          ) : (
                            <span className="muted">
                              CAMPUSLINK
                            </span>
                          )}

                        </div>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="access-actions">

                          <button
                            type="button"
                            className="access-view-button"
                            onClick={() =>
                              setSelectedUser(
                                user
                              )
                            }
                          >
                            <Eye size={16} />
                            View
                          </button>


                          {!String(
                            user.id || ""
                          ).startsWith(
                            "DEMO-"
                          ) && (

                            <button
                              type="button"
                              className={`access-status-action ${
                                user.status ===
                                "blocked"
                                  ? "activate"
                                  : "block"
                              }`}
                              onClick={() =>
                                changeUserStatus(
                                  user
                                )
                              }
                            >

                              {user.status ===
                              "blocked" ? (
                                <>
                                  <CheckCircle2
                                    size={15}
                                  />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <Ban
                                    size={15}
                                  />
                                  Block
                                </>
                              )}

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* USER MODAL */}

      {selectedUser && (

        <div
          className="access-modal-overlay"
          onClick={() =>
            setSelectedUser(null)
          }
        >

          <div
            className="access-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="access-modal-header">

              <div>

                <span className="access-eyebrow">
                  USER ACCESS DETAILS
                </span>

                <h2>
                  User Profile
                </h2>

              </div>

              <button
                type="button"
                className="access-modal-close"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            <div className="access-modal-user">

              <div className="access-modal-avatar">
                {getInitials(
                  selectedUser.name
                )}
              </div>

              <div>

                <h3>
                  {selectedUser.name ||
                    "Unnamed User"}
                </h3>

                <p>
                  {selectedUser.email ||
                    "No email"}
                </p>

              </div>

            </div>


            <div className="access-detail-grid">

              <div className="access-detail-item">

                <span>ROLE</span>

                <div
                  className={`access-role-badge access-role-${selectedUser.role}`}
                >
                  <RoleIcon
                    role={
                      selectedUser.role
                    }
                  />

                  <span>
                    {roleLabel(
                      selectedUser.role
                    )}
                  </span>
                </div>

              </div>


              <div className="access-detail-item">

                <span>STATUS</span>

                <div
                  className={`access-status-badge access-status-${selectedUser.status}`}
                >

                  {selectedUser.status ===
                    "active" && (
                    <CheckCircle2
                      size={15}
                    />
                  )}

                  {selectedUser.status ===
                    "blocked" && (
                    <Ban size={15} />
                  )}

                  {statusLabel(
                    selectedUser.status
                  )}

                </div>

              </div>


              <div className="access-detail-item">

                <span>EMAIL</span>

                <strong>
                  {selectedUser.email ||
                    "Not available"}
                </strong>

              </div>


              <div className="access-detail-item">

                <span>USER ID</span>

                <strong>
                  {selectedUser.id ||
                    "Not available"}
                </strong>

              </div>


              <div className="access-detail-item">

                <span>COLLEGE</span>

                <strong>
                  {selectedUser.college ||
                    "Not applicable"}
                </strong>

              </div>


              <div className="access-detail-item">

                <span>COMPANY</span>

                <strong>
                  {selectedUser.company ||
                    "Not applicable"}
                </strong>

              </div>

            </div>


            <div className="access-modal-footer">

              <button
                type="button"
                className="access-modal-secondary"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                Close
              </button>


              {!String(
                selectedUser.id || ""
              ).startsWith(
                "DEMO-"
              ) && (

                <button
                  type="button"
                  className={`access-modal-primary ${
                    selectedUser.status ===
                    "blocked"
                      ? "activate"
                      : "block"
                  }`}
                  onClick={() =>
                    changeUserStatus(
                      selectedUser
                    )
                  }
                >
                  {selectedUser.status ===
                  "blocked"
                    ? "Activate User"
                    : "Block User"}
                </button>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AccessControl;