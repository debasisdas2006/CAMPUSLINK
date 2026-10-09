import { useEffect, useState } from "react";

import "./InterviewTimer.css";


function InterviewTimer({ running = false }) {
  const [seconds, setSeconds] =
    useState(0);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer =
      setInterval(() => {
        setSeconds(
          (previous) => previous + 1
        );
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [running]);


  const minutes =
    Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

  const remainingSeconds =
    (seconds % 60)
      .toString()
      .padStart(2, "0");


  return (
    <div className="interview-timer">
      <span>
        {minutes}
      </span>

      <span className="timer-colon">
        :
      </span>

      <span>
        {remainingSeconds}
      </span>
    </div>
  );
}


export default InterviewTimer;