import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import LiveMap from "./pages/LiveMap";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import SosCenter from "./pages/SosCenter";
import Recommendations from "./pages/Recommendations";
import TouristId from "./pages/TouristId";
import Assistant from "./pages/Assistant";
import Reviews from "./pages/Reviews";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/sos" element={<SosCenter />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/tourist-id" element={<TouristId />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
