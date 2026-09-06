import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error reading user:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  useEffect(() => {
    const checkMessages = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUnreadMessages(0);
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/messages/unread-count",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUnreadMessages(data.count || 0);
      } catch (error) {
        console.error(
          "Error checking unread messages:",
          error
        );
      }
    };

    checkMessages();

    const interval = setInterval(
      checkMessages,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, [location]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch(
        "http://127.0.0.1:8000/api/logout",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setUnreadMessages(0);

    navigate("/");
  };

  return (
    <nav className="navbar">

      <div
        className="logo"
        onClick={() => navigate("/")}
      >
        Sla7
      </div>

      <div className="nav-actions">

        {user ? (
          <>
            <span className="navbar-user">
              Hi, {user.name}
            </span>

            <button
              type="button"
              className="messages-btn"
              onClick={() => navigate("/messages")}
            >
              💬 Messages

              {unreadMessages > 0 && (
                <span className="message-badge">
                  {unreadMessages}
                </span>
              )}
            </button>

            <button
              type="button"
              className="my-listings-btn"
              onClick={() => navigate("/my-listings")}
            >
              My Listings
            </button>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>

            <button
              type="button"
              className="register-btn"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </>
        )}

        <button
          type="button"
          className="sell-btn"
          onClick={() => navigate("/create-listing")}
        >
          + Sell something
        </button>

      </div>

    </nav>
  );
}

export default Navbar;