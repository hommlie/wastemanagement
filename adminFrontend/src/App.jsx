// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CitiesPage from "./pages/CitiesPage";
import StatesPage from "./pages/StatesPage";
import ZonesPage from "./pages/ZonesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="states" element={<StatesPage />} />
          <Route path="cities" element={<CitiesPage />} />
          <Route path="zones" element={<ZonesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
