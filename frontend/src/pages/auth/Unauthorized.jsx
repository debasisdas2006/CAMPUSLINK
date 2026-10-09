import { Link } from "react-router-dom";
import "./Unauthorized.css";

function Unauthorized() {
  return (
    <main className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🔒</div>

        <h1>Access Restricted</h1>

        <p>
          You don't have permission to access this area
          of CAMPUSLINK.
        </p>

        <Link to="/login">
          Return to Login
        </Link>
      </div>
    </main>
  );
}

export default Unauthorized;