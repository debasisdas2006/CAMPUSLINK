import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/authService";


const AuthContext = createContext(null);


/* =====================================================
   AUTH PROVIDER
   ===================================================== */

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {

    try {

      const savedUser =
        localStorage.getItem(
          "campuslink_user"
        );

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);

    } catch (error) {

      console.error(
        "Could not restore login session:",
        error
      );

      localStorage.removeItem(
        "campuslink_user"
      );

      return null;
    }
  });


  /* ===================================================
     LOGIN
     =================================================== */

  const login = async (
    email,
    password,
    selectedRole
  ) => {

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const cleanPassword =
      String(password || "");

    const cleanRole =
      String(selectedRole || "")
        .trim()
        .toLowerCase();


    try {

      /* ================================================
         REAL BACKEND LOGIN
         ================================================ */

      const loginResponse =
        await loginUser(
          cleanEmail,
          cleanPassword
        );


      if (!loginResponse?.access_token) {

        return {
          success: false,
          message:
            "Login failed. No access token received.",
        };
      }


      /* ================================================
         GET CURRENT USER (FROM LOGIN OR ME ENDPOINT)
         ================================================ */

      const backendUser =
        loginResponse.user || (await getCurrentUser());


      if (!backendUser) {

        logoutUser();

        return {
          success: false,
          message:
            "Could not load your account information.",
        };
      }


      /* ================================================
         NORMALIZE BACKEND ROLE
         ================================================ */

      const backendRole =
        String(
          backendUser.role || ""
        )
          .trim()
          .toLowerCase();


      /* ================================================
         CHECK SELECTED ROLE
         ================================================ */

      if (
        cleanRole &&
        backendRole !== cleanRole
      ) {

        logoutUser();

        return {
          success: false,
          message:
            `This account is registered as ${backendRole}, not ${cleanRole}.`,
        };
      }


      /* ================================================
         USER DATA
         ================================================ */

      const userData = {

        id:
          backendUser.user_id,

        user_id:
          backendUser.user_id,

        email:
          backendUser.email,

        role:
          backendRole,

        name:
          backendUser.name,

      };


      /* ================================================
         SAVE ACTIVE SESSION
         ================================================ */

      localStorage.setItem(
        "campuslink_user",
        JSON.stringify(userData)
      );


      setUser(userData);


      return {
        success: true,
        user: userData,
      };

    } catch (error) {

      console.error(
        "Backend login failed:",
        error
      );


      /* ================================================
         BACKEND LOGIN FAILED
         ================================================

         Keep existing locally registered accounts
         working temporarily.

         This prevents the current registration flow
         from breaking while we migrate registration
         to the backend.
         ================================================ */

      let registeredUsers = [];


      try {

        registeredUsers =
          JSON.parse(
            localStorage.getItem(
              "campuslink_registered_users"
            ) || "[]"
          );


        if (!Array.isArray(registeredUsers)) {
          registeredUsers = [];
        }

      } catch (storageError) {

        console.error(
          "Could not read registered users:",
          storageError
        );

        registeredUsers = [];
      }


      const registeredUser =
        registeredUsers.find(
          (item) => {

            const storedEmail =
              String(
                item.email || ""
              )
                .trim()
                .toLowerCase();

            const storedPassword =
              String(
                item.password || ""
              );

            const storedRole =
              String(
                item.role || ""
              )
                .trim()
                .toLowerCase();


            return (
              storedEmail === cleanEmail &&
              storedPassword === cleanPassword &&
              storedRole === cleanRole
            );
          }
        );


      if (registeredUser) {

        const userData = {

          id:
            registeredUser.id ||
            `USER-${Date.now()}`,

          email:
            registeredUser.email,

          role:
            registeredUser.role,

          name:
            registeredUser.name,

          college:
            registeredUser.college || "",

          company:
            registeredUser.company || "",

        };


        localStorage.setItem(
          "campuslink_user",
          JSON.stringify(userData)
        );


        setUser(userData);


        return {
          success: true,
          user: userData,
          localOnly: true,
        };
      }


      /* ================================================
         BACKEND ERROR MESSAGE
         ================================================ */

      const backendMessage =
        error?.response?.data?.detail;


      return {
        success: false,
        message:
          backendMessage ||
          "Invalid email, password, or role.",
      };
    }
  };


  /* ===================================================
     LOGOUT
     =================================================== */

  const logout = () => {

    logoutUser();

    setUser(null);
  };


  /* ===================================================
     PROVIDER
     =================================================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated:
          Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


/* =====================================================
   USE AUTH
   ===================================================== */

export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }


  return context;
}