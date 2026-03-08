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
import ReservationModal from "./componentes/ReservationModal";
import { getStoredUser, isAdminUser, normalizeUser } from "./utils/session";

const API_URL = process.env.REACT_APP_API_URL || '';

function App() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState("todos");
  const [vehiculos, setVehiculos] = useState([]);
  
  // Estado para el modal de reservación
  const [reservationModal, setReservationModal] = useState({
    isOpen: false,
    vehicle: null,
    initialDates: null
  });

  useEffect(() => {
    fetch(`${API_URL}/api/vehiculos`)
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

  // Handler para abrir el modal de reservación
  function handleOpenReservation(vehicle, dates = null) {
    console.log("Abriendo modal de reservación para:", vehicle);
    setReservationModal({
      isOpen: true,
      vehicle,
      initialDates: dates
    });
  }

  // Handler para cerrar el modal
  function handleCloseReservation() {
    setReservationModal({
      isOpen: false,
      vehicle: null,
      initialDates: null
    });
  }

  function handleCategorySelect(category) {
    setVehicleFilter(category);
    const carsSection = document.getElementById("autos");
    if (carsSection) carsSection.scrollIntoView({ behavior: "smooth" });
  }

  function handleLogin(userData) {
    const normalized = normalizeUser(userData);
    setUsuario(normalized);
    if (normalized) localStorage.setItem("usuario", JSON.stringify(normalized));
    restoreTempVehicle();
  }

  function handleRegister(userData) {
    const normalized = normalizeUser(userData);
    setUsuario(normalized);
    if (normalized) localStorage.setItem("usuario", JSON.stringify(normalized));
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
    const savedUser = getStoredUser();
    if (savedUser) {
      setUsuario(savedUser);
      restoreTempVehicle();
    } else {
      setUsuario(null);
    }
    setAuthReady(true);
  }, []);

  const isAdminAuthenticated = !!localStorage.getItem("authToken") && isAdminUser(usuario);

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
                  vehiculos={vehiculos}
                />
                <Servicios />
                <SeccionCarros 
                  onSelectVehicle={handleSelectVehicle}
                  onOpenReservation={handleOpenReservation}
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
              !authReady ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <h2>Validando sesión...</h2>
                </div>
              ) : isAdminAuthenticated ? (
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

      {/* Modal de Reservación Global */}
      <ReservationModal
        isOpen={reservationModal.isOpen}
        onClose={handleCloseReservation}
        vehicle={reservationModal.vehicle}
        initialDates={reservationModal.initialDates}
        usuario={usuario}
      />
    </Router>
  );
}

export default App;
