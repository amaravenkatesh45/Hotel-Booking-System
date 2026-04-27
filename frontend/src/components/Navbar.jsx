import { getToken, logout } from "../utils/authUtils";

function Navbar() {
  return (
    <nav>
      <h2>Hotel Booking</h2>
      {getToken() ? (
        <button onClick={() => { logout(); window.location.href="/login"; }}>
          Logout
        </button>
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </>
      )}
    </nav>
  );
}

export default Navbar;
