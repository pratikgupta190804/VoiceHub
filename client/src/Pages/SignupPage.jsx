import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useStoreAuth } from "../store/useAuthStore";

function SignupPage() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { signup, isSigningUp, toggleNav, getGooglePage } = useStoreAuth();

  useEffect(() => {
    toggleNav(false);
  }, []);

  const signupForm = (data) => {
    signup(data).then(() => {
      toggleNav(true);
      navigate("/");
    });
  };

  const handlegoogle = () => {
    getGooglePage();
  };
  return (
    <div className="flex bg-gray-900 min-h-screen">
      {/* Left Section - Branding */}
      <div className="hidden md:flex md:w-[45%] items-center justify-center bg-gray-800 rounded-r-[3rem] border border-gray-700 text-white h-screen flex-col shadow-2xl">
        <img src="/logo.png" alt="chit-chat-logo" className="h-30 w-55 mb-4" />
        <div className="space-y-4 text-center px-8">
          <h1 className="text-5xl font-extrabold text-white">
            Your Voice
            <br />
            <span className="text-blue-400">Amplified</span>
          </h1>
          <p className="mt-4 text-lg font-medium text-gray-400">
            Sign up for messaging that truly resonates!
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
          <h3 className="text-2xl font-bold text-center mb-6 text-white">
            Create Your Account
          </h3>

          <form onSubmit={handleSubmit(signupForm)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-gray-200"
              >
                Name
              </label>
              <input
                id="fullname"
                type="text"
                {...register("fullname", { required: true })}
                className="mt-1 block w-full h-12 border border-gray-600 bg-gray-700 text-white rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 placeholder:truncate placeholder:px-2"
                placeholder="Your full name"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200"
              >
                E‑mail
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: true })}
                className="mt-1 block w-full h-12 border border-gray-600 bg-gray-700 text-white rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 placeholder:truncate placeholder:px-2"
                placeholder="you@example.com"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password", { required: true })}
                className="mt-1 block w-full h-12 border border-gray-600 bg-gray-700 text-white rounded-lg shadow-sm focus:ring-blue-400 focus:border-blue-400 placeholder-gray-400 placeholder:truncate placeholder:px-2"
                placeholder="Enter a secure password"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 h-12 shadow-lg"
              disabled={isSigningUp}
            >
              {isSigningUp ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <hr className="flex-grow border-gray-600" />
            <span className="mx-2 text-gray-400">OR</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <button
            className="w-full py-3 flex items-center justify-center border border-gray-600 rounded-lg hover:bg-gray-700 transition-all duration-200 bg-gray-800 text-white shadow-lg"
            onClick={handlegoogle}
          >
            <img
              src="https://img.icons8.com/color/16/000000/google-logo.png"
              alt="Google"
              className="mr-2"
            />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 font-medium hover:text-blue-300 hover:underline transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
