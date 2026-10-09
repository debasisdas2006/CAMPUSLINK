import { useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

import "./FinalDecisionModal.css";

const APPLICATIONS_KEY = "campuslink_applications";
const NOTIFICATIONS_KEY = "campuslink_notifications";

function readArray(key) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error(`Could not read ${key}:`, error);
    return [];
  }
}

function dispatchEventSafely(name) {
  try {
    window.dispatchEvent(new Event(name));
  } catch (error) {
    console.error(`Could not dispatch ${name}:`, error);
  }
}

function FinalDecisionModal({ application, onClose }) {
  const [decision, setDecision] = useState("SELECTED");

  const [selectedForm, setSelectedForm] = useState({
    teamName: "",
    teamSize: "",
    teamLeaderName: "",
    teamRole: "",
    joiningDate: "",
    additionalDetails: "",
  });

  const [rejectionReason, setRejectionReason] = useState("");
  const [saving, setSaving] = useState(false);

  if (!application) {
    return null;
  }

  const jobRole =
    application.jobTitle ||
    application.job?.title ||
    "Job Position";

  const companyName =
    application.companyName ||
    application.company ||
    application.job?.companyName ||
    "Company";

  const updateApplicationAndNotify = () => {
    if (saving) {
      return;
    }

    if (decision === "SELECTED") {
      if (!selectedForm.teamName.trim()) {
        alert("Please enter the team name.");
        return;
      }

      if (!selectedForm.teamSize.trim()) {
        alert("Please enter the team size.");
        return;
      }

      if (!selectedForm.teamLeaderName.trim()) {
        alert("Please enter the team leader name.");
        return;
      }

      if (!selectedForm.teamRole.trim()) {
        alert("Please enter the student's role in the team.");
        return;
      }

      if (!selectedForm.joiningDate) {
        alert("Please select the joining date.");
        return;
      }
    }

    if (decision === "REJECTED" && !rejectionReason.trim()) {
      alert("Please enter the rejection reason.");
      return;
    }

    setSaving(true);

    try {
      const applications = readArray(APPLICATIONS_KEY);
      const decidedAt = new Date().toISOString();

      const finalDecision =
        decision === "SELECTED"
          ? {
              status: "SELECTED",
              decidedAt,
              jobRole,
              companyName,
              teamName: selectedForm.teamName.trim(),
              teamSize: selectedForm.teamSize.trim(),
              teamLeaderName:
                selectedForm.teamLeaderName.trim(),
              teamRole: selectedForm.teamRole.trim(),
              joiningDate: selectedForm.joiningDate,
              additionalDetails:
                selectedForm.additionalDetails.trim(),
            }
          : {
              status: "REJECTED",
              decidedAt,
              jobRole,
              companyName,
            };

      const updatedApplications = applications.map((item) => {
        if (
          String(item.applicationId) !==
          String(application.applicationId)
        ) {
          return item;
        }

        return {
          ...item,
          status: decision,
          finalDecision,
          finalDecisionReason:
            decision === "REJECTED"
              ? rejectionReason.trim()
              : "",
          rejectionReason:
            decision === "REJECTED"
              ? rejectionReason.trim()
              : "",
          recruiterDecision:
            decision === "SELECTED"
              ? "SELECTED"
              : "REJECTED",
          updatedAt: decidedAt,
        };
      });

      localStorage.setItem(
        APPLICATIONS_KEY,
        JSON.stringify(updatedApplications)
      );

      const studentEmail =
        application.studentEmail ||
        application.studentId ||
        "";

      const existingNotifications = readArray(
        NOTIFICATIONS_KEY
      );

      const alreadySent = existingNotifications.some(
        (notification) =>
          String(notification.applicationId) ===
            String(application.applicationId) &&
          (notification.type === "JOB_SELECTED" ||
            notification.type === "JOB_REJECTED") &&
          String(notification.userEmail || notification.userId || "")
            .trim()
            .toLowerCase() ===
            String(studentEmail).trim().toLowerCase()
      );

      if (!alreadySent && studentEmail) {
        const notification = {
          notificationId:
            `NOTIF-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
          userId: studentEmail,
          userEmail: studentEmail,
          userRole: "student",
          type:
            decision === "SELECTED"
              ? "JOB_SELECTED"
              : "JOB_REJECTED",
          title:
            decision === "SELECTED"
              ? "Congratulations!"
              : "Application Update",
          message:
            decision === "SELECTED"
              ? `Congratulations ${application.studentName || "Student"}! You have been selected for the ${jobRole} role at ${companyName}.`
              : `Your application for the ${jobRole} role at ${companyName} has been rejected. Please check the rejection reason for details.`,
          jobId: application.jobId,
          applicationId: application.applicationId,
          jobTitle: jobRole,
          companyName,
          rejectionReason:
            decision === "REJECTED"
              ? rejectionReason.trim()
              : "",
          finalDecision:
            decision === "SELECTED"
              ? finalDecision
              : null,
          read: false,
          createdAt: decidedAt,
        };

        existingNotifications.push(notification);

        localStorage.setItem(
          NOTIFICATIONS_KEY,
          JSON.stringify(existingNotifications)
        );
      }

      dispatchEventSafely(
        "campuslink_application_updated"
      );

      dispatchEventSafely(
        "campuslink_notification_updated"
      );

      alert(
        decision === "SELECTED"
          ? "Student selected successfully. The student has been notified."
          : "Student rejected successfully. The student has been notified."
      );

      onClose();
    } catch (error) {
      console.error("Could not save final decision:", error);
      alert("Could not save the final decision.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="final-decision-overlay"
      onClick={() => {
        if (!saving) {
          onClose();
        }
      }}
    >
      <div
        className="final-decision-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="final-decision-header">
          <div>
            <span>FINAL DECISION</span>
            <h2>{application.studentName || "Student"}</h2>
          </div>

          <button
            type="button"
            className="final-decision-close"
            onClick={() => {
              if (!saving) {
                onClose();
              }
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="final-decision-body">
          <div className="final-decision-application-info">
            <div>
              <BriefcaseBusiness size={16} />
              <span>{jobRole}</span>
            </div>
            <div>
              <UserCheck size={16} />
              <span>{companyName}</span>
            </div>
          </div>

          <div className="final-decision-options">
            <button
              type="button"
              className={
                decision === "SELECTED"
                  ? "final-decision-option active selected"
                  : "final-decision-option selected"
              }
              onClick={() => setDecision("SELECTED")}
              disabled={saving}
            >
              <CheckCircle2 size={19} />
              <span>SELECTED</span>
            </button>

            <button
              type="button"
              className={
                decision === "REJECTED"
                  ? "final-decision-option active rejected"
                  : "final-decision-option rejected"
              }
              onClick={() => setDecision("REJECTED")}
              disabled={saving}
            >
              <XCircle size={19} />
              <span>REJECTED</span>
            </button>
          </div>

          {decision === "SELECTED" ? (
            <div className="final-decision-form">
              <div className="final-decision-field">
                <label htmlFor="teamName">
                  Team Name
                </label>
                <input
                  id="teamName"
                  type="text"
                  value={selectedForm.teamName}
                  onChange={(event) =>
                    setSelectedForm((previous) => ({
                      ...previous,
                      teamName: event.target.value,
                    }))
                  }
                  disabled={saving}
                  placeholder="Backend Development Team"
                />
              </div>

              <div className="final-decision-field">
                <label htmlFor="teamSize">
                  Team Size
                </label>
                <input
                  id="teamSize"
                  type="number"
                  min="1"
                  value={selectedForm.teamSize}
                  onChange={(event) =>
                    setSelectedForm((previous) => ({
                      ...previous,
                      teamSize: event.target.value,
                    }))
                  }
                  disabled={saving}
                  placeholder="8"
                />
              </div>

              <div className="final-decision-field">
                <label htmlFor="teamLeaderName">
                  Team Leader
                </label>
                <input
                  id="teamLeaderName"
                  type="text"
                  value={selectedForm.teamLeaderName}
                  onChange={(event) =>
                    setSelectedForm((previous) => ({
                      ...previous,
                      teamLeaderName: event.target.value,
                    }))
                  }
                  disabled={saving}
                  placeholder="Amit Kumar"
                />
              </div>

              <div className="final-decision-field">
                <label htmlFor="teamRole">
                  Student's Role in Team
                </label>
                <input
                  id="teamRole"
                  type="text"
                  value={selectedForm.teamRole}
                  onChange={(event) =>
                    setSelectedForm((previous) => ({
                      ...previous,
                      teamRole: event.target.value,
                    }))
                  }
                  disabled={saving}
                  placeholder="Junior Python Developer"
                />
              </div>

              <div className="final-decision-field">
                <label htmlFor="joiningDate">
                  Joining Date
                </label>
                <input
                  id="joiningDate"
                  type="date"
                  value={selectedForm.joiningDate}
                  onChange={(event) =>
                    setSelectedForm((previous) => ({
                      ...previous,
                      joiningDate: event.target.value,
                    }))
                  }
                  disabled={saving}
                />
              </div>

              <div className="final-decision-field full-width">
                <label htmlFor="additionalDetails">
                  Additional Information
                </label>
                <textarea
                  id="additionalDetails"
                  rows="4"
                  value={selectedForm.additionalDetails}
                  onChange={(event) =>
                    setSelectedForm((previous) => ({
                      ...previous,
                      additionalDetails: event.target.value,
                    }))
                  }
                  disabled={saving}
                  placeholder="Add any joining instructions or additional information for the student..."
                />
              </div>
            </div>
          ) : (
            <div className="final-decision-form">
              <div className="final-decision-field full-width">
                <label htmlFor="rejectionReason">
                  Rejection Reason
                </label>
                <textarea
                  id="rejectionReason"
                  rows="5"
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  disabled={saving}
                  placeholder="Enter the reason for rejecting this student after the interview..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="final-decision-footer">
          <button
            type="button"
            className="final-decision-cancel"
            onClick={() => {
              if (!saving) {
                onClose();
              }
            }}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="final-decision-confirm"
            onClick={updateApplicationAndNotify}
            disabled={saving}
          >
            {decision === "SELECTED" ? (
              <CheckCircle2 size={17} />
            ) : (
              <XCircle size={17} />
            )}

            {saving
              ? "Saving..."
              : decision === "SELECTED"
              ? "Confirm Selection"
              : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinalDecisionModal;
