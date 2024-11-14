import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; // Include Navigate for redirects
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Chat from "./pages/Chat.jsx";
import QA from "./pages/QA.jsx";
import Contact from "./pages/Contact.jsx";
import Profile from "./pages/Profile.jsx";
import QuestionDetail from "./pages/QuestionDetail.jsx";
import NavBar from "./components/NavBar.jsx";
import PageContainer from "./PageContainer.jsx.jsx";
import Login from "./pages/Login.jsx"; // Your existing Login component
import Register from "./pages/Register.jsx"; // Assuming you have a Register component

import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Footer from "./components/Footer.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import CookiesPolicy from "./pages/CookiesPolicy.jsx";
import Notification from "./components/Notification.jsx";
import Dashboard from "./components/UD.jsx";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app-container">
            <NavBar />
            <PageContainer>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route
                  path="/terms-and-conditions"
                  element={<TermsAndConditions />}
                />
                <Route path="/cookies-policy" element={<CookiesPolicy />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ad"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/qa"
                  element={
                    <ProtectedRoute>
                      <QA />
                    </ProtectedRoute>
                  }
                />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/questions/:id"
                  element={
                    <ProtectedRoute>
                      <QuestionDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notification"
                  element={
                    <ProtectedRoute>
                      <Notification />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </PageContainer>
            <Footer /> {/* Footer outside of PageContainer */}
          </div>
          <ToastContainer />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
