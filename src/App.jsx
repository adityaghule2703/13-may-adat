// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Receipts from "./pages/Receipts";

import Login from "./auth/Login";
import Farmers from "./pages/farmers/Farmers";
import AddFarmer from "./pages/farmers/AddFarmer";
import EditFarmer from "./pages/farmers/EditFarmer";


// Protected Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (!token || isLoggedIn !== "true") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No authentication needed */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="account" element={<Account />} />
          <Route path="receipts" element={<Receipts />} />
          
          {/* Farmers Module Routes - Using pattern like your example */}
          <Route path="farmers/add" element={<AddFarmer />} />
          <Route path="farmers/edit/:id" element={<EditFarmer />} />
          <Route path="farmers" element={<Farmers />} />
          
          {/* Additional routes for full finance system */}
          <Route path="purchases" element={<div>Purchases Page</div>} />
          <Route path="payments" element={<div>Payments Page</div>} />
          <Route path="inventory" element={<div>Inventory Page</div>} />
          <Route path="sales" element={<div>Sales Page</div>} />
          <Route path="reports" element={<div>Reports Page</div>} />
          <Route path="expenses" element={<div>Expenses Page</div>} />
          <Route path="users-roles" element={<div>Users & Roles Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;