import { BrowserRouter, Routes, Route } from "react-router-dom";

import SidebarLayout from "./components/SidebarLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import B2B from "./pages/B2B";
import ShopOffice from "./pages/ShopOffice";
import Rental from "./pages/Rental";
import Lease from "./pages/Lease";
import Agreement from "./pages/Agreement";
import Civil from "./pages/Civil";
import Interior from "./pages/Interior";
import Showcase from "./pages/Showcase";
import Dress from "./pages/Dress";
import Manpower from "./pages/Manpower";
import JobPortal from "./pages/JobPortal";
import WelcomeKits from "./pages/WelcomeKits";
import Bags from "./pages/Bags";
import Leather from "./pages/Leather";
import Bulk from "./pages/Bulk";
import Procurement from "./pages/Procurement";

/* ✅ NEW IMPORT ADDED */
import AgreementSystem from "./pages/AgreementSystem";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main Pages */}
        <Route path="/" element={<ProtectedRoute><SidebarLayout><Home /></SidebarLayout></ProtectedRoute>} />
        <Route path="/splash" element={<Splash />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />

        {/* Sidebar Extra Pages */}
        <Route path="/profile" element={<ProtectedRoute><SidebarLayout><Profile /></SidebarLayout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><SidebarLayout><Orders /></SidebarLayout></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><SidebarLayout><Account /></SidebarLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SidebarLayout><Settings /></SidebarLayout></ProtectedRoute>} />

        {/* Main Modules */}
        <Route path="/b2b" element={<ProtectedRoute><SidebarLayout><B2B /></SidebarLayout></ProtectedRoute>} />
        <Route path="/shopoffice" element={<ProtectedRoute><SidebarLayout><ShopOffice /></SidebarLayout></ProtectedRoute>} />
        <Route path="/rental" element={<ProtectedRoute><SidebarLayout><Rental /></SidebarLayout></ProtectedRoute>} />
        <Route path="/lease" element={<ProtectedRoute><SidebarLayout><Lease /></SidebarLayout></ProtectedRoute>} />
        <Route path="/agreement" element={<ProtectedRoute><SidebarLayout><Agreement /></SidebarLayout></ProtectedRoute>} />

        {/* ✅ NEW AGREEMENT SYSTEM ROUTE */}
        <Route
          path="/agreement/system"
          element={<ProtectedRoute><SidebarLayout><AgreementSystem /></SidebarLayout></ProtectedRoute>}
        />

        <Route path="/civil" element={<ProtectedRoute><SidebarLayout><Civil /></SidebarLayout></ProtectedRoute>} />
        <Route path="/interior" element={<ProtectedRoute><SidebarLayout><Interior /></SidebarLayout></ProtectedRoute>} />
        <Route path="/showcase" element={<ProtectedRoute><SidebarLayout><Showcase /></SidebarLayout></ProtectedRoute>} />
        <Route path="/dress" element={<ProtectedRoute><SidebarLayout><Dress /></SidebarLayout></ProtectedRoute>} />
        <Route path="/manpower" element={<ProtectedRoute><SidebarLayout><Manpower /></SidebarLayout></ProtectedRoute>} />
        <Route path="/jobportal" element={<ProtectedRoute><SidebarLayout><JobPortal /></SidebarLayout></ProtectedRoute>} />
        <Route path="/welcomekits" element={<ProtectedRoute><SidebarLayout><WelcomeKits /></SidebarLayout></ProtectedRoute>} />
        <Route path="/bags" element={<ProtectedRoute><SidebarLayout><Bags /></SidebarLayout></ProtectedRoute>} />
        <Route path="/leather" element={<ProtectedRoute><SidebarLayout><Leather /></SidebarLayout></ProtectedRoute>} />
        <Route path="/bulk" element={<ProtectedRoute><SidebarLayout><Bulk /></SidebarLayout></ProtectedRoute>} />
        <Route path="/procurement" element={<ProtectedRoute><SidebarLayout><Procurement /></SidebarLayout></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}