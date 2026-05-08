// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Receipts from "./pages/Receipts";

import Login from "./auth/Login";

// Farmers Module
import Farmers from "./pages/farmers/Farmers";
import AddFarmer from "./pages/farmers/AddFarmer";
import EditFarmer from "./pages/farmers/EditFarmer";

// Expenses Module
import Expenses from "./pages/expenses/Expenses";
import AddExpense from "./pages/expenses/AddExpense";
import ViewExpense from "./pages/expenses/ViewExpense";

// Purchase Module
import Purchases from "./pages/purchase/Purchases";
import AddPurchase from "./pages/purchase/AddPurchase";
import ViewPurchase from "./pages/purchase/ViewPurchase";
import PurchaseSummary from "./pages/purchase/PurchaseSummary";
import EditPurchase from "./pages/purchase/EditPurchase";
import UpdatePurchaseStatus from "./pages/purchase/UpdatePurchaseStatus";

// Payment Module
import Payments from "./pages/payment/Payments";
import AddPayment from "./pages/payment/AddPayemt";
import UpdateChequeStatus from "./pages/payment/UpdateChequeStatus";
import ViewPayment from "./pages/payment/ViewPayment";

// Inventory Module
import Inventory from "./pages/inventory/Inventory";
import AdjustStock from "./pages/inventory/AdjustStock";
import TransferStock from "./pages/inventory/TransferStock";
import ProductStockDetails from "./pages/inventory/ProductStockDetails";

// Warehouse Module
import Warehouses from "./pages/inventory/Warehouses";
import AddWarehouse from "./pages/inventory/AddWarehouse";
import EditWarehouse from "./pages/inventory/EditWarehouse";
import ViewWarehouse from "./pages/inventory/ViewWarehouse";

// Sales Module
import Sales from "./pages/sales/Sales";
import AddSale from "./pages/sales/AddSale";
import ViewSale from "./pages/sales/ViewSale";  // Note: Your file is ViewSales.jsx, rename to ViewSale.jsx

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
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
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
          
          {/* ========== FARMERS MODULE ========== */}
          <Route path="farmers" element={<Farmers />} />
          <Route path="farmers/add" element={<AddFarmer />} />
          <Route path="farmers/edit/:id" element={<EditFarmer />} />

          {/* ========== EXPENSES MODULE ========== */}
          <Route path="expenses" element={<Expenses />} />
          <Route path="expenses/add" element={<AddExpense />} />
          <Route path="expenses/view/:id" element={<ViewExpense />} />
          
          {/* ========== PURCHASE MODULE ========== */}
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/add" element={<AddPurchase />} />
          <Route path="purchases/view/:id" element={<ViewPurchase />} />
          <Route path="purchases/summary" element={<PurchaseSummary />} />
          <Route path="purchases/edit/:id" element={<EditPurchase />} />
          <Route path="purchases/update-status/:id" element={<UpdatePurchaseStatus />} />

          {/* ========== PAYMENT MODULE ========== */}
          <Route path="payments" element={<Payments />} />
          <Route path="payments/add" element={<AddPayment />} />
          <Route path="payments/view/:id" element={<ViewPayment />} />
          <Route path="payments/update-cheque/:id" element={<UpdateChequeStatus />} />

          {/* ========== INVENTORY MODULE ========== */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/adjust" element={<AdjustStock />} />
          <Route path="inventory/transfer" element={<TransferStock />} />
          <Route path="inventory/product/:productName" element={<ProductStockDetails />} />

          {/* ========== WAREHOUSE MODULE ========== */}
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="warehouses/add" element={<AddWarehouse />} />
          <Route path="warehouses/view/:id" element={<ViewWarehouse />} />
          <Route path="warehouses/edit/:id" element={<EditWarehouse />} />

          {/* ========== SALES MODULE ========== */}
          <Route path="sales" element={<Sales />} />
          <Route path="sales/add" element={<AddSale />} />
          <Route path="sales/view/:id" element={<ViewSale />} />
          {/* <Route path="sales/edit/:id" element={<EditSale />} /> */}

          {/* ========== OTHER MODULES (Todo) ========== */}
          <Route path="reports" element={<div>Reports Page</div>} />
          <Route path="expenses" element={<div>Expenses Page</div>} />
          <Route path="users-roles" element={<div>Users & Roles Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;