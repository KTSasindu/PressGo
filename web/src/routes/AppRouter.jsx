import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";
import CustomerDashboard from "../pages/customer/CustomerDashboard.jsx";
import LaundryDetailsPage from "../pages/customer/LaundryDetailsPage.jsx";
import OrderDetailsPage from "../pages/orders/OrderDetailsPage.jsx";
import DriverDashboard from "../pages/driver/DriverDashboard.jsx";
import OwnerDashboard from "../pages/owner/OwnerDashboard.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import PaymentManagementPage from "../pages/admin/PaymentManagementPage.jsx";
import ShopManagementPage from "../pages/admin/ShopManagementPage.jsx";
import UserManagementPage from "../pages/admin/UserManagementPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/laundries/:id" element={<LaundryDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["CUSTOMER", "LAUNDRY_OWNER", "ADMIN"]}
            />
          }
        >
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["DRIVER"]} />}>
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["LAUNDRY_OWNER"]} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/payments" element={<PaymentManagementPage />} />
          <Route path="/admin/shops" element={<ShopManagementPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
