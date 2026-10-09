import { useState } from "react";

import CampusIntro from "./components/common/CampusIntro";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";


function AppContent() {

  /*
   * Check the current browser URL.
   *
   * The animation is intended for the starting/login
   * page, not for dashboard pages.
   */

  const currentPath =
    window.location.pathname;


  /*
   * Check whether the user is already logged in.
   */

  const savedUser =
    localStorage.getItem(
      "campuslink_user"
    );


  /*
   * Animation should appear when:
   *
   * 1. We are on the starting/login page
   * 2. There is no active logged-in user
   *
   * This means refreshing Login will show animation.
   *
   * But refreshing Student/Recruiter/Admin dashboard
   * will NOT show animation.
   */

  const shouldShowIntro =
    (
      currentPath === "/" ||
      currentPath === "/login"
    ) &&
    !savedUser;


  const [showIntro, setShowIntro] =
    useState(shouldShowIntro);


  const handleIntroComplete = () => {

    setShowIntro(false);

  };


  return (
    <>
      {showIntro && (
        <CampusIntro
          onComplete={handleIntroComplete}
        />
      )}

      <AppRoutes />
    </>
  );
}


function App() {

  return (
    <AuthProvider>

      <AppContent />

    </AuthProvider>
  );
}


export default App;