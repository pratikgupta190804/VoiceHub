import { Link } from "react-router-dom";
import { useStoreAuth } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const NavBar = () => {
  const { logout, authUser, showNavBar, isCheckingAuth } = useStoreAuth();
  

  return showNavBar ? (
    <header
      className=" border-b border-gray-700 fixed w-full top-0 z-40 
    backdrop-blur-lg shadow-lg"
    style={{ backgroundColor: "#0f70cd " }}
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Silent Shout</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className=" hover:bg-gray-700 text-white border border-gray-600 
              px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
              hover:shadow-lg"
              style={{backgroundColor: '#ec8b0a'}}
            >
              <Settings className="w-4 h-4 text-black" />
              <span className="hidden sm:inline text-black">Settings</span>
            </Link>

            {authUser ? (
              <>
                <Link
                  to={"/profile"}
                  className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 
                px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                hover:shadow-lg"
                style={{backgroundColor: '#ec8b0a'}}
                >
                  <User className="size-5   text-black" />
                  <span className="hidden sm:inline  text-black">Profile</span>
                </Link>

                <button
                  className="bg-red-600 hover:bg-red-700 text-white border border-red-500
                px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                hover:shadow-lg"
                  onClick={logout}
                >
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : !isCheckingAuth ? (
              <>
                <Link
                  to={"/signup"}
                  className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 
                px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                hover:shadow-lg"
                >
                  <span className="hidden sm:inline">Sign Up</span>
                </Link>
                <Link
                  to={"/login"}
                  className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 
                px-4 py-2 rounded-lg gap-2 transition-all duration-200 flex items-center
                hover:shadow-lg font-medium"
                >
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </>
            ) : (
              <div className="w-20 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  ) : (
    <></>
  );
};
export default NavBar;
