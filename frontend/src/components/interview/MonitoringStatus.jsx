import {
  Camera,
  Mic,
  ShieldCheck,
} from "lucide-react";

import "./MonitoringStatus.css";


function MonitoringStatus({
  cameraEnabled = false,
  microphoneEnabled = false,
  interviewStarted = false,
}) {
  return (
    <div className="monitoring-status">

      <div className="monitoring-item">

        <div className="monitoring-icon">
          <Camera size={17} />
        </div>

        <div className="monitoring-info">
          <strong>
            Camera
          </strong>

          <span
            className={
              cameraEnabled
                ? "monitoring-online"
                : "monitoring-offline"
            }
          >
            {cameraEnabled
              ? "Connected"
              : "Not Connected"}
          </span>
        </div>

      </div>


      <div className="monitoring-item">

        <div className="monitoring-icon">
          <Mic size={17} />
        </div>

        <div className="monitoring-info">
          <strong>
            Microphone
          </strong>

          <span
            className={
              microphoneEnabled
                ? "monitoring-online"
                : "monitoring-offline"
            }
          >
            {microphoneEnabled
              ? "Connected"
              : "Not Connected"}
          </span>
        </div>

      </div>


      <div className="monitoring-item">

        <div className="monitoring-icon">
          <ShieldCheck size={17} />
        </div>

        <div className="monitoring-info">
          <strong>
            AI Monitoring
          </strong>

          <span
            className={
              interviewStarted
                ? "monitoring-online"
                : "monitoring-offline"
            }
          >
            {interviewStarted
              ? "Session Active"
              : "Waiting"}
          </span>
        </div>

      </div>

    </div>
  );
}


export default MonitoringStatus;