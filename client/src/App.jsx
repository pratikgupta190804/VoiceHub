import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import NavBar from "./Components/NavBar";
import { useStoreAuth } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";
import LoginPage from "./Pages/LoginPage";

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useStoreAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const loginStatus = urlParams.get("login");
    const reason = urlParams.get("reason");

    if (loginStatus === "success") {
      toast.success("Google login successful!");
      navigate("/", { replace: true });
    } else if (loginStatus === "error") {
      let errorMessage = "Google login failed. Please try again.";

      switch (reason) {
        case "no_code":
          errorMessage = "Authorization failed. Please try again.";
          break;
        case "no_state":
        case "no_stored_state":
        case "state_mismatch":
          errorMessage = "Security validation failed. Please try again.";
          break;
        case "no_verifier":
          errorMessage = "OAuth verification failed. Please try again.";
          break;
        case "token_exchange_failed":
          errorMessage =
            "Failed to exchange authorization code. Please try again.";
          break;
        case "server_error":
          errorMessage = "Server error during login. Please try again.";
          break;
      }

      toast.error(errorMessage);
      navigate("/login", { replace: true });
    }
  }, [location, navigate]);
  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <>
      <Toaster position="top-center" />
      {/* Always show NavBar except on login/signup pages */}
      {location.pathname !== "/login" && location.pathname !== "/signup" && (
        <NavBar />
      )}
      {authUser ? (
        <Outlet />
      ) : location.pathname === "/signup" ? (
        <Outlet />
      ) : (
        <LoginPage />
      )}
    </>
  );
}

export default App;
