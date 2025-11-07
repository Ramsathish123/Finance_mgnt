import LoginForm from "./pages/LoginPage/LoginForm";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Box, Flex } from "@chakra-ui/react";
import Header from "./components/Header/Header";
import Fotter from "./components/Footer/Fotter";
import Register from "./pages/RegisterPage/Register";
import "./App.css";
import LeftMenu from "./pages/Menu/LeftMenu";
import Dashboard from "./pages/dashboard/dashboard";
import Stock from "./pages/Stock/Stock";
import Expense from "./pages/Expense/Expense";
import Service from "./pages/Service/Service";
import Invoice from "./pages/Invoice/Invoice";
import { FileProvider } from "./context/Filecontext";
import Report from "./pages/Invoice/Report";
import PrivateRoute from "../src/components/Route/PrivateRoute";
import { MenuProvider } from "./components/Menuprovider";

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
          <Route path="stock" element={<Stock />} />
          <Route path="expense" element={<Expense />} />
          <Route path="service" element={<Service />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="report" element={<Report />} />
        </Route></Route>
      </Routes>
    </Router>
    </FileProvider></MenuProvider>
  );
}

export default App;
