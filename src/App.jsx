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
import ViewFarmer from "./pages/farmers/ViewFarmer";
import FarmerLedger from "./pages/farmers/FarmerLedger";

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
import PurchaseReceipt from "./pages/purchase/PurchaseReceipt";

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

// Ledger Module
import Ledger from "./pages/ledger/Ledger";
// import OperatorExpenseLedger from "./pages/ledger/OperatorExpenseLedger";
// import OperatorCombinedLedger from "./pages/ledger/OperatorCombinedLedger";


// Budget Alerts Module
import BudgetAlerts from "./pages/budgetalerts/BudgetAlerts";
import AddBudget from "./pages/budgetalerts/AddBudget";
import EditBudget from "./pages/budgetalerts/EditBudget";
import ViewBudget from "./pages/budgetalerts/ViewBudget";
import FarmerPayments from "./pages/farmers/FarmerPayments";
import FarmerDues from "./pages/farmers/FarmerDues";
import DueSummary from "./pages/payment/DueSummary";
import EditExpense from "./pages/expenses/EditExpense";
import FarmerLedgerDetail from "./pages/ledger/FarmerLedgerDetail";
import OperatorLedgerDetail from "./pages/ledger/OperatorLedgerDetail";
import Users from "./pages/users/Users";
import AddUser from "./pages/users/AddUser";
import AuditLogs from "./pages/auditlogs/AuditLogs";
import ViewUser from "./pages/users/ViewUser";
import ViewAuditLog from "./pages/auditlogs/ViewAuditLog";
import Buyers from "./pages/buyers/Buyers";
import AddBuyer from "./pages/buyers/AddBuyer";
import EditBuyer from "./pages/buyers/EditBuyer";
import ViewBuyer from "./pages/buyers/ViewBuyer";
import Products from "./pages/products/Products";
import AddProduct from "./pages/products/AddProduct";
import EditProduct from "./pages/products/EditProduct";
import ViewProduct from "./pages/products/ViewProduct";
import SalePayments from "./pages/salepayments/SalePayments";
import AddSalePayment from "./pages/salepayments/AddSalePayment";
import ViewSalePayment from "./pages/salepayments/ViewSalePayment";
import FarmerModal from "./pages/purchase/FarmerModal";
import OpeningBalance from "./pages/openingbalance/OpeningBalance";


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
    // <BrowserRouter>
       <BrowserRouter basename="/agri_tred-front">
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
          <Route path="farmers/view/:id" element={<ViewFarmer />} />
          <Route path="farmers/ledger/:id" element={<FarmerLedger />} />
          <Route path="farmers/payments/:id" element={<FarmerPayments />} />
          <Route path="/farmers/dues/:id" element={<FarmerDues />} />


          {/* ========== EXPENSES MODULE ========== */}
          <Route path="expenses" element={<Expenses />} />
          <Route path="expenses/add" element={<AddExpense />} />
          <Route path="/expenses/edit/:id" element={<EditExpense />} />
          <Route path="expenses/view/:id" element={<ViewExpense />} />
          
          {/* ========== PURCHASE MODULE ========== */}
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/add" element={<AddPurchase />} />
          <Route path="farmermodal/add" element={<FarmerModal />} />
          <Route path="purchases/view/:id" element={<ViewPurchase />} />
          <Route path="purchases/summary" element={<PurchaseSummary />} />
          <Route path="purchases/edit/:id" element={<EditPurchase />} />
          <Route path="purchases/update-status/:id" element={<UpdatePurchaseStatus />} />
          <Route path="purchases/receipt/:id" element={<PurchaseReceipt />} />

          {/* ========== PAYMENT MODULE ========== */}
          <Route path="payments" element={<Payments />} />
          <Route path="payments/add" element={<AddPayment />} />
          <Route path="payments/view/:id" element={<ViewPayment />} />
          <Route path="payments/update-cheque/:id" element={<UpdateChequeStatus />} />
          <Route path="/payments/due-summary" element={<DueSummary />} />

          {/* ========== INVENTORY MODULE ========== */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/adjust" element={<AdjustStock />} />
          <Route path="inventory/transfer" element={<TransferStock />} />
          <Route path="inventory/product/:productName" element={<ProductStockDetails />} />


          <Route path="openingbalance" element={<OpeningBalance />} />

          {/* ========== WAREHOUSE MODULE ========== */}
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="warehouses/add" element={<AddWarehouse />} />
          <Route path="warehouses/view/:id" element={<ViewWarehouse />} />
          <Route path="warehouses/edit/:id" element={<EditWarehouse />} />

          <Route path="buyers" element={<Buyers />} />
           <Route path="/buyers/add" element={<AddBuyer />} />
           <Route path="/buyers/edit/:id" element={<EditBuyer />}  />
           <Route path="/buyers/view/:id" element={<ViewBuyer />} />


           <Route path="/products" element={<Products />} />
<Route path="/products/add" element={<AddProduct />} />
<Route path="/products/edit/:id" element={<EditProduct />} />
<Route path="/products/view/:id" element={<ViewProduct />} />

          {/* ========== SALES MODULE ========== */}
          <Route path="sales" element={<Sales />} />
          <Route path="sales/add" element={<AddSale />} />
          <Route path="sales/view/:id" element={<ViewSale />} />
          {/* <Route path="sales/edit/:id" element={<EditSale />} /> */}

           <Route path="/sale-payments" element={<SalePayments />} />
<Route path="/sale-payments/add" element={<AddSalePayment />} />
<Route path="/sale-payments/view/:id" element={<ViewSalePayment />} />

          {/* ========== LEDGER MODULE ========== */}
          <Route path="ledger" element={<Ledger />} />
          <Route path="/ledger/farmers/:farmerId" element={<FarmerLedgerDetail />} />
          <Route path="/ledger/operators/:operatorId" element={<OperatorLedgerDetail />} />
          {/* <Route path="ledger/expenses" element={<OperatorExpenseLedger />} />
          <Route path="ledger/combined" element={<OperatorCombinedLedger />} /> */}

          {/* ========== BUDGET ALETS MODULE ========== */}
          <Route path="budget-alerts" element={<BudgetAlerts />} />
          <Route path="budget-alerts/add" element={<AddBudget />} />
          <Route path="budget-alerts/edit/:id" element={<EditBudget />} />
          <Route path="budget-alerts/view/:id" element={<ViewBudget />} />


          <Route path="users" element={<Users />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/view/:id" element={<ViewUser />} />


          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="/audit-logs/view/:id" element={<ViewAuditLog />} />

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