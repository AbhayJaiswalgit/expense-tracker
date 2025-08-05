import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import SignUp from "./pages/SignUp.jsx";
import Login from "./pages/Login.jsx";
import App from "./App.jsx";
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddIncome from "./pages/AddIncome.jsx";
import AddExpense from "./pages/AddExpense.jsx";
import Statistics from "./components/Statistics.jsx";
import AllTransactions from "./components/AllTransactions.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/signup" /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/login", element: <Login /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="summary" /> },
      { path: "summary", element: <Dashboard /> },
      { path: "add-income", element: <AddIncome /> },
      { path: "add-expense", element: <AddExpense /> },
      { path: "statistics", element: <Statistics /> },
      { path: "all-Transactions", element: <AllTransactions /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
