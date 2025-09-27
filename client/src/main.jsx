import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./Pages/HomePage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import SignupPage from "./Pages/SignupPage.jsx";
import SettingPage from "./Pages/SettingPage.jsx";
import MapView from "./Pages/MapView.jsx";
import ComplaintFormPage from "./Pages/ComplaintFormPage.jsx";
import ProfilePage from "./Pages/ProfilePage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/mapView", element: <MapView /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/settings", element: <SettingPage /> },
      { path: "/complaint", element: <ComplaintFormPage /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
