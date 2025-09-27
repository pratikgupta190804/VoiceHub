import { Link } from "react-router-dom";
import { useStoreAuth } from "../store/useAuthStore";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  FileText,
  Plus,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";

const NavBar = () => {
  const { logout, authUser, showNavBar, isCheckingAuth } = useStoreAuth();

  // Don't show navbar if explicitly hidden
  if (!showNavBar) return null;

  return (
    <header
      className=" border-b border-gray-700 fixed w-full top-0 z-40 
    backdrop-blur-lg shadow-lg"
      style={{
        backgroundColor: "#FFFFFF",
        borderBottomColor: "#FFD95A",
        borderBottomWidth: "3px",
      }}
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div
                className="size-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#FFD95A" }}
              >
                <MessageSquare
                  className="w-5 h-5"
                  style={{ color: "#4C3D3D" }}
                />
              </div>
              <h1
                className="text-lg font-bold logo font-playfair"
                style={{ color: "#4C3D3D" }}
              >
                VoiceHub
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom Language Selector */}
            <LanguageSelector />

            {authUser ? (
              <>
                <Link
                  to={"/complaint"}
                  className="hover:opacity-80 border 
                  px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                  hover:shadow-lg font-inter font-medium"
                  style={{
                    backgroundColor: "#FFD95A",
                    color: "#4C3D3D",
                    borderColor: "#C07F00",
                  }}
                >
                  <FileText className="w-4 h-4" style={{ color: "#4C3D3D" }} />
                  <span
                    className="hidden sm:inline nav-link"
                    style={{ color: "#4C3D3D" }}
                  >
                    View Complaints
                  </span>
                </Link>

                <Link
                  to={"/post-complaint"}
                  className="hover:opacity-80 text-white border 
                  px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                  hover:shadow-lg font-inter font-medium"
                  style={{ backgroundColor: "#C07F00", borderColor: "#FFD95A" }}
                >
                  <Plus className="w-4 h-4" style={{ color: "#FFFFFF" }} />
                  <span
                    className="hidden sm:inline nav-link"
                    style={{ color: "#FFFFFF" }}
                  >
                    Post Complaint
                  </span>
                </Link>

                <Link
                  to={"/profile"}
                  className="hover:opacity-80 border 
                px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                hover:shadow-lg font-inter font-medium"
                  style={{
                    backgroundColor: "#4C3D3D",
                    color: "#FFFFFF",
                    borderColor: "#FFD95A",
                  }}
                >
                  <User className="size-5" style={{ color: "#FFFFFF" }} />
                  <span
                    className="hidden sm:inline nav-link"
                    style={{ color: "#FFFFFF" }}
                  >
                    Profile
                  </span>
                </Link>

                <button
                  className="border transition-all duration-200 flex items-center
                px-4 py-2 rounded-lg gap-2 hover:shadow-lg hover:opacity-80 font-inter font-medium"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#FFD95A",
                    color: "#4C3D3D",
                  }}
                  onClick={logout}
                >
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline nav-link">Logout</span>
                </button>
              </>
            ) : !isCheckingAuth ? (
              <>
                <Link
                  to={"/signup"}
                  className="border hover:opacity-80 
                px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                hover:shadow-lg font-inter font-medium"
                  style={{
                    backgroundColor: "#FFD95A",
                    borderColor: "#C07F00",
                    color: "#4C3D3D",
                  }}
                >
                  <span className="hidden sm:inline nav-link">Sign Up</span>
                </Link>
                <Link
                  to={"/login"}
                  className="text-white border hover:opacity-80 
                px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                hover:shadow-lg font-medium font-inter"
                  style={{
                    backgroundColor: "#4C3D3D",
                    borderColor: "#FFD95A",
                    color: "#FFFFFF",
                  }}
                >
                  <span className="hidden sm:inline nav-link">Login</span>
                </Link>
              </>
            ) : (
              <div
                className="w-20 h-10 rounded-lg animate-pulse"
                style={{ backgroundColor: "#FFD95A" }}
              ></div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default NavBar;
