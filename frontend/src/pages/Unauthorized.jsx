import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="page">
      <div className="empty-state">
        <h3>You don't have access to this page</h3>
        <p>This section is restricted to admin accounts.</p>
        <Link to="/" className="btn btn-primary">
          Go back home
        </Link>
      </div>
    </div>
  );
}
