import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

// ── Pages ──────────────────────────────────────────────────────────────────
import Login      from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword  from "../pages/ResetPassword";
import Dashboard  from "../pages/Dashboard";
import Products   from "../pages/Products";
import OneProduct from "../pages/OneProduct";
import Categories from "../pages/Categories";
import Brands     from "../pages/Brands";
import Suppliers  from "../pages/Suppliers";
import Sales      from "../pages/Sales";
import Orders     from "../pages/Orders";
import Profile    from "../pages/Profile";
import AI         from "../pages/AI";
import NotFound   from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password"        element={<ForgotPassword />} />
<Route path="/reset-password/:token"  element={<ResetPassword />} />

      {/* Root → redirect to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected — all wrapped in Layout (sidebar + navbar) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/products"   element={<Products />} />
        <Route path="/products/:id" element={<OneProduct />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/brands"     element={<Brands />} />
        <Route path="/suppliers"  element={<Suppliers />} />
        <Route path="/sales"      element={<Sales />} />
        <Route path="/orders"     element={<Orders />} />
        <Route path="/profile"    element={<Profile />} />
        <Route path="/ai"         element={<AI />} />

      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}