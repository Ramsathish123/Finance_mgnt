import LoginForm from "./pages/LoginPage/LoginForm";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import Register from "./pages/RegisterPage/Register";
import "./App.css";

import Dashboard from "./pages/dashboard/dashboard";
import Loan from "./pages/Loan/Loan";
import Expense from "./pages/Expense/Expense";
import Repayment from "./pages/Repayment/Repayment";
import Customer from "./pages/Customer/Customer";
import { FileProvider } from "./context/Filecontext";
import Report from "./pages/Customer/Report";
import PrivateRoute from "../src/components/Route/PrivateRoute";
import { MenuProvider } from "./components/Menuprovider";
import LeftMenu from "./components/Menu/LeftMenu";
import Supplier from "./pages/Supplier/Supplier";

function App() {
  return (
    <MenuProvider>
      <FileProvider>
        <Router>
          <Routes>
            {/* Standalone routes */}
            <Route path="/" element={<LoginForm />} />
            <Route path="/register" element={<Register />} />

            {/* Layout route with nested content */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<LeftMenu />}>
                <Route path="loan" element={<Loan />} />
                <Route path="supplier" element={<Supplier />} />
                <Route path="expense" element={<Expense />} />
                <Route path="repayment" element={<Repayment />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="customer" element={<Customer />} />
                <Route path="report" element={<Report />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </FileProvider>
    </MenuProvider>
  );
}

export default App;
