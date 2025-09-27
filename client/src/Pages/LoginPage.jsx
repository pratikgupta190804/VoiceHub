import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useStoreAuth } from "../store/useAuthStore";

function LoginPage() {
  const { register, handleSubmit } = useForm();
  const { login, isLoggingIn, toggleNav, getGooglePage } = useStoreAuth();
  const navigate = useNavigate();
  useEffect(() => {
    toggleNav(false);
  }, [toggleNav]);

  const loginForm = (data) => {
    login(data).then(() => {
      toggleNav(true);
      navigate("/");
    });
  };

  const handleGoogleLogin = () => {
    getGooglePage();
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#FFD95A" }}>
      {/* Left Section - Form (now on left) */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-full max-w-md p-8 rounded-2xl shadow-2xl border-2"
          style={{
            backgroundColor: "white",
            borderColor: "#C07F00",
          }}
        >
          <h3
            className="heading text-2xl text-center mb-6 font-playfair font-bold"
            style={{ color: "#4C3D3D" }}
          >
            Welcome Back
          </h3>

          <form onSubmit={handleSubmit(loginForm)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="label block text-sm font-inter font-medium"
                style={{ color: "#4C3D3D" }}
              >
                E‑mail
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: true })}
                className="input mt-1 block w-full h-12 border-2 rounded-lg shadow-sm focus:ring-2 placeholder:truncate placeholder:px-2 font-inter"
                placeholder="you@example.com"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#FFD95A",
                  color: "#000000",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  "--tw-ring-color": "#4C3D3D",
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="label block text-sm font-inter font-medium"
                style={{ color: "#4C3D3D" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password", { required: true })}
                className="input mt-1 block w-full h-12 border-2 rounded-lg shadow-sm focus:ring-2 placeholder:truncate placeholder:px-2 font-inter"
                placeholder="Enter your password"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#FFD95A",
                  color: "#000000",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  "--tw-ring-color": "#4C3D3D",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn w-full text-white rounded-lg hover:opacity-80 transition-all duration-200 h-12 shadow-lg font-inter font-medium"
              disabled={isLoggingIn}
              style={{ backgroundColor: "#4C3D3D" }}
            >
              {isLoggingIn ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <hr style={{ borderColor: "#FFD95A" }} className="flex-grow" />
            <span
              className="caption mx-2 font-inter"
              style={{ color: "#4C3D3D", opacity: 0.7 }}
            >
              OR
            </span>
            <hr style={{ borderColor: "#FFD95A" }} className="flex-grow" />
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="btn w-full py-3 flex items-center justify-center border-2 rounded-lg hover:opacity-80 transition-all duration-200 shadow-lg font-inter font-medium"
            style={{
              backgroundColor: "#FFD95A",
              borderColor: "#C07F00",
              color: "#4C3D3D",
            }}
          >
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google"
              className="mr-2"
            />
            Continue with Google
          </button>

          <p
            className="body-text mt-6 text-center text-sm font-inter"
            style={{ color: "#4C3D3D", opacity: 0.8 }}
          >
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="nav-link hover:underline transition-colors font-medium"
              style={{ color: "#C07F00" }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      {/* Right Section - Branding (now on right) */}
      <div
        className="hidden md:flex md:w-[45%] items-center justify-center rounded-l-[3rem] border-2 h-screen flex-col shadow-2xl"
        style={{
          backgroundColor: "#C07F00",
          borderColor: "#FFD95A",
        }}
      >
        <img src="/logo.png" alt="chit-chat-logo" className="h-30 w-55 mb-4 " />
        <div className="space-y-4 text-center px-8">
          <h1
            className="brand text-5xl font-playfair font-bold"
            style={{ color: "#FFFFFF" }}
          >
            Your Voice
            <br />
            <span
              className="heading font-playfair"
              style={{ color: "#FFD95A" }}
            >
              Amplified
            </span>
          </h1>
          <p
            className="body-text mt-4 text-lg font-inter"
            style={{ color: "#FFFFFF", opacity: 0.9 }}
          >
            Log in to connect and submit complaints instantly!
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
