import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./componentes/Navbar";
import Hero from "./componentes/Hero";
import Servicios from "./componentes/Servicios";
import SeccionCarros from "./componentes/SeccionCarros";
import Footer from "./componentes/Footer";
import AdminDashboard from "./componentes/AdminDashboard";
import Login from "./componentes/login";
import Register from "./componentes/Register";
import Categorias from "./componentes/categorias";

function App() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState("todos");
  const [vehiculos, setVehiculos] = useState([]);

  useEffect(() => {
    fetch("/api/vehiculos")
      .then((res) => res.json())
      .then((data) => setVehiculos(data))
      .catch((err) => console.error("Error cargando vehículos:", err));
  }, []);

  function handleSelectVehicle(vehicle) {
    setSelectedVehicle(vehicle);
    localStorage.setItem('tempSelectedVehicle', JSON.stringify(vehicle));
    console.log("Vehículo seleccionado en App:", vehicle);
    const heroSection = document.querySelector(".hero-section");
    if (heroSection) heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCategorySelect(category) {
    setVehicleFilter(category);
    const carsSection = document.getElementById("autos");
    if (carsSection) carsSection.scrollIntoView({ behavior: "smooth" });
  }

  function handleLogin(userData) {
    setUsuario(userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
    restoreTempVehicle();
  }

  function handleRegister(userData) {
    setUsuario(userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
    restoreTempVehicle();
  }

  function restoreTempVehicle() {
    const tempVehicle = localStorage.getItem('tempSelectedVehicle');
    if (tempVehicle) {
      setSelectedVehicle(JSON.parse(tempVehicle));
      localStorage.removeItem('tempSelectedVehicle');
      const heroSection = document.querySelector(".hero-section");
      if (heroSection) heroSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      setUsuario(JSON.parse(savedUser));
      restoreTempVehicle();
    }
  }, []);

  return (
    <Router>
      <Navbar usuario={usuario} setUsuario={setUsuario} />
      <main>
        <Routes>
          {/* PÁGINA PRINCIPAL - Solo Hero, Servicios, Carros */}
          <Route
            path="/"
            element={
              <>
                <Hero 
                  selectedVehicle={selectedVehicle} 
                  usuario={usuario} 
                  onCategorySelect={handleCategorySelect} 
                  vehiculos={vehiculos} // Pass vehicles for dynamic dropdown
                />
                <Servicios />
                <SeccionCarros 
                  onSelectVehicle={handleSelectVehicle} 
                  currentFilter={vehicleFilter} 
                  onFilterChange={setVehicleFilter}
                  vehiculos={vehiculos} 
                />
              </>
            }
          />

          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/categorias" element={<Categorias onSelectVehicle={handleSelectVehicle} />} />

          {/* ADMIN DASHBOARD - SOLO en /admin */}
          <Route
            path="/admin"
            element={
              usuario && usuario.esAdmin ? (
                <AdminDashboard />
              ) : (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <h2>No autorizado</h2>
                  <p>Debes ser administrador para acceder a esta página.</p>
                </div>
              )
            }
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;