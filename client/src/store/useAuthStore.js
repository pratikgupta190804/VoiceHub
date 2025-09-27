import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "https://chit-chat-realtime-chat-app-2.onrender.com";

export const useStoreAuth = create((set) => ({
  authUser: null,
  isSigningup: false,
  isLoggingIn: false,
  isCheckingAuth: false,
  showNavBar: true,
  isChattingToGroup: false,

  getGooglePage: () => {
    try {
      const url = `${BASE_URL}/api/auth/google`;
      window.location.href = url;
    } catch {
      toast.error("Failed to initiate Google login");
    }
  },
  setprofileClicked: (val) => {
    set({ profileClicked: val });
  },
  toggleNav: (val) => {
    set({ showNavBar: val });
  },
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, showNavBar: true });
    } catch (err) {
      set({ authUser: null, showNavBar: true });
      if (err.response) {
        // Server responded with a status outside 2xx
        console.error("Auth check failed:", err.response.data?.message);
      } else {
        // Network error or no response
        console.error("Network error during auth check");
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningup: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data, showNavBar: true });
      toast.success("Signup successful!");
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Signup failed");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ isSigningup: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data, showNavBar: true });
      toast.success("Login successful!");
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Login failed");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout successful!");
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Logout failed");
      } else {
        toast.error("Network error — please try again");
      }
    }
  },
}));
