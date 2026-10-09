import { useEffect } from "react";
import "./CampusIntro.css";


function CampusIntro({ onComplete }) {

  useEffect(() => {

    /*
     * Animation duration
     *
     * The animation runs only once because App.jsx
     * stores campuslink_intro_shown in sessionStorage.
     */

    const timer = setTimeout(() => {

      onComplete();

    }, 2100);


    return () => {

      clearTimeout(timer);

    };

  }, [onComplete]);


  return (
    <div className="campus-intro">

      <div className="intro-background">

        {/* =========================================
            CAMPUS GLOW
            ========================================= */}

        <div className="campus-glow" />


        {/* =========================================
            CAMPUS BUILDING
            ========================================= */}

        <div className="campus-building">

          <div className="building-top">
            CAMPUSLINK
          </div>

          <div className="building-body">

            <div className="building-window window-one" />

            <div className="building-window window-two" />

            <div className="building-window window-three" />

          </div>

        </div>


        {/* =========================================
            CAMPUS DOOR
            ========================================= */}

        <div className="campus-door-frame">

          <div className="door-light" />

          <div className="campus-door">

            <div className="door-panel door-panel-top" />

            <div className="door-panel door-panel-bottom" />

            <div className="door-handle" />

            <div className="door-lock">

              <div className="lock-body" />

              <div className="lock-shackle" />

            </div>

          </div>

        </div>


        {/* =========================================
            STUDENT
            ========================================= */}

        <div className="student">

          <div className="student-head">

            <div className="student-hair" />

            <div className="student-eye eye-left" />

            <div className="student-eye eye-right" />

          </div>


          <div className="student-body">

            <div className="student-shirt">

              <span>C</span>

            </div>


            <div className="student-arm student-arm-back" />

            <div className="student-arm student-arm-front" />

          </div>


          <div className="student-leg leg-left" />

          <div className="student-leg leg-right" />


          {/* KEY */}

          <div className="student-key">

            <div className="key-ring" />

            <div className="key-stick" />

            <div className="key-teeth" />

          </div>

        </div>


        {/* =========================================
            GROUND
            ========================================= */}

        <div className="campus-ground" />


        {/* =========================================
            INTRO TEXT
            ========================================= */}

        <div className="intro-text">

          <div className="intro-title">
            CAMPUSLINK
          </div>

          <div className="intro-subtitle">
            Unlock Your Career Journey
          </div>

        </div>

      </div>

    </div>
  );
}


export default CampusIntro;