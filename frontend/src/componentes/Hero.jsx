import React, { useState, useEffect, useRef } from "react";
import "../styles.css";
import DateRangePickerHero from "./DateRangePickerHero";
import { useNavigate } from "react-router-dom"; 
const API_URL = process.env.REACT_APP_API_URL || "";

export default function Hero({ selectedVehicle = null, usuario = null, onCategorySelect, vehiculos = [] }) {
  const navigate = useNavigate();
  
  const [listaSucursales, setListaSucursales] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/sucursales`)
      .then(res => res.json())
      .then(data => setListaSucursales(data))
      .catch(err => console.error("Error fetching sucursales:", err));
  }, []);

  const [formulario, setFormulario] = useState({
    recogida: "",
    devolucion: "",
    inicio: "",
    fin: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'recogida' | 'devolucion' | null
  const [error, setError] = useState(null);
  
  const recogidaRef = useRef(null);
  const devolucionRef = useRef(null);
  const datePickerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (recogidaRef.current && !recogidaRef.current.contains(event.target)) {
        if (activeDropdown === 'recogida') setActiveDropdown(null);
      }
      if (devolucionRef.current && !devolucionRef.current.contains(event.target)) {
        if (activeDropdown === 'devolucion') setActiveDropdown(null);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        if (showDatePicker) setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown, showDatePicker]);

  function handleLocationSelect(field, value) {
    setFormulario((prev) => ({ ...prev, [field]: value }));
    setActiveDropdown(null);
    setError(null);
  }

  function onRangeChange(payload) {
    setFormulario((prev) => ({
      ...prev,
      inicio: payload.Fecha_Recogida,
      fin: payload.Fecha_Devolucion,
    }));
    setError(null);
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return "Seleccionar";
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  function handleSearch(e) {
    e.preventDefault();
    
    if (!formulario.recogida) {
      setError("Selecciona una ubicación de recogida");
      return;
    }
    if (!formulario.devolucion) {
      setError("Selecciona una ubicación de devolución");
      return;
    }
    if (!formulario.inicio || !formulario.fin) {
      setError("Selecciona las fechas de tu viaje");
      return;
    }

    // Scroll a la sección de autos
    const seccionCarros = document.querySelector("#autos");
    if (seccionCarros) {
      seccionCarros.scrollIntoView({ behavior: "smooth" });
    }
  }
  
  return (
    <section className="hero-section" id="hero-section">
      {/* Background */}
      <div className="hero-background">
        <div className="hero-overlay" />
        <div className="hero-image" style={{ backgroundImage: "url('./assets/lambo.jpg')" }} />
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="hero-text">
          <h1>Vive el camino como nunca antes</h1>
          <p>Reserva en minutos, elige la mejor opción para ti y viaja con tranquilidad.</p>
        </div>

        {/* Airbnb-style Search Bar */}
        <div className="airbnb-search-container">
          <form className="airbnb-search-bar" onSubmit={handleSearch}>
            {/* Ubicación Recogida */}
            <div 
              className={`search-section location-section ${activeDropdown === 'recogida' ? 'active' : ''}`}
              ref={recogidaRef}
            >
              <div 
                className="section-trigger"
                onClick={() => setActiveDropdown(activeDropdown === 'recogida' ? null : 'recogida')}
              >
                <label>Dónde recoger</label>
                <span className="section-value">
                  {formulario.recogida || "Buscar ubicación"}
                </span>
              </div>
              
              {/* Dropdown */}
              <div className={`location-dropdown ${activeDropdown === 'recogida' ? 'open' : ''}`}>
                <div className="dropdown-header">Ubicaciones populares</div>
                {listaSucursales.map((u, i) => (
                  <div 
                    key={u.ID_Sucursal} 
                    className={`dropdown-item ${formulario.recogida === u.Nombre ? 'selected' : ''}`}
                    onClick={() => handleLocationSelect('recogida', u.Nombre)}
                  >
                    <span className="location-icon">📍</span>
                    <span className="location-text">{u.Nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="search-divider" />

            {/* Ubicación Devolución */}
            <div 
              className={`search-section location-section ${activeDropdown === 'devolucion' ? 'active' : ''}`}
              ref={devolucionRef}
            >
              <div 
                className="section-trigger"
                onClick={() => setActiveDropdown(activeDropdown === 'devolucion' ? null : 'devolucion')}
              >
                <label>Dónde entregar</label>
                <span className="section-value">
                  {formulario.devolucion || "Buscar ubicación"}
                </span>
              </div>
              
              {/* Dropdown */}
              <div className={`location-dropdown ${activeDropdown === 'devolucion' ? 'open' : ''}`}>
                <div className="dropdown-header">Ubicaciones populares</div>
                {listaSucursales.map((u, i) => (
                  <div 
                    key={u.ID_Sucursal} 
                    className={`dropdown-item ${formulario.devolucion === u.Nombre ? 'selected' : ''}`}
                    onClick={() => handleLocationSelect('devolucion', u.Nombre)}
                  >
                    <span className="location-icon">📍</span>
                    <span className="location-text">{u.Nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="search-divider" />

            {/* Fechas */}
            <div 
              className={`search-section dates-section ${showDatePicker ? 'active' : ''}`}
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <label>Cuándo</label>
              <div className="dates-display">
                <span>{formatDateDisplay(formulario.inicio)}</span>
                <span className="date-arrow">→</span>
                <span>{formatDateDisplay(formulario.fin)}</span>
              </div>
            </div>

            <div className="search-divider" />

            {/* Botón Buscar */}
            <button type="submit" className="search-button">
              <span className="search-icon">🔍</span>
              <span className="search-text">Buscar</span>
            </button>
          </form>

          {/* Date Picker Dropdown with Overlay */}
          {showDatePicker && (
            <>
              <div 
                className="datepicker-overlay" 
                onClick={() => setShowDatePicker(false)}
              />
              <div className="datepicker-dropdown" ref={datePickerRef}>
                <DateRangePickerHero onChangeRange={onRangeChange} months={2} />
                <button 
                  type="button" 
                  className="datepicker-confirm"
                  onClick={() => setShowDatePicker(false)}
                >
                  Confirmar fechas
                </button>
              </div>
            </>
          )}

          {error && <div className="search-error">{error}</div>}
        </div>
      </div>

      <style>{`
        .hero-section {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          overflow: visible;
        }

        .hero-background {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(79,70,229,0.7), rgba(124,58,237,0.6));
          z-index: 1;
        }

        .hero-image {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 1000px;
          width: 100%;
        }

        .hero-text {
          margin-bottom: 40px;
        }

        .hero-text h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.3);
        }

        .hero-text p {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.9);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Airbnb Search Bar */
        .airbnb-search-container {
          position: relative;
          z-index: 1000;
        }

        .airbnb-search-bar {
          display: flex;
          align-items: stretch;
          background: #fff;
          border-radius: 50px;
          padding: 8px 8px 8px 8px;
          box-shadow: 0 6px 30px rgba(0,0,0,0.15);
          max-width: 900px;
          margin: 0 auto;
          transition: box-shadow 0.3s ease;
        }

        .airbnb-search-bar:hover {
          box-shadow: 0 8px 40px rgba(0,0,0,0.2);
        }

        .search-section {
          position: relative;
          flex: 1;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 30px;
          min-width: 160px;
        }

        .search-section:hover {
          background: #f7f7f7;
        }

        .search-section.active {
          background: #f0f0f0;
          box-shadow: inset 0 0 0 2px #6d28d9;
        }

        .section-trigger {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .search-section label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #222;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          pointer-events: none;
        }

        .section-value {
          font-size: 14px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .location-section.active .section-value,
        .dates-section.active .dates-display {
          color: #0f172a;
        }

        /* Location Dropdown */
        .location-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 0;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          min-width: 320px;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1100;
        }

        .location-dropdown.open {
          max-height: 400px;
          overflow-y: auto;
          opacity: 1;
          transform: translateY(0);
          padding: 8px 0;
        }

        .dropdown-header {
          padding: 12px 20px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dropdown-item:hover {
          background: #f7f7f7;
        }

        .dropdown-item.selected {
          background: #f3e8ff;
        }

        .location-icon {
          font-size: 18px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 10px;
        }

        .location-text {
          font-size: 14px;
          color: #0f172a;
        }

        .dates-section {
          min-width: 200px;
        }

        .dates-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .date-arrow {
          color: #6d28d9;
          font-weight: bold;
        }

        .search-divider {
          width: 1px;
          background: #e5e7eb;
          margin: 8px 0;
          align-self: stretch;
        }

        .search-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6d28d9, #5b21b6);
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(109, 40, 217, 0.4);
          white-space: nowrap;
        }

        .search-button:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(109, 40, 217, 0.5);
        }

        .search-icon {
          font-size: 18px;
        }

        /* Date Picker Dropdown */
        .datepicker-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 99990;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.25s ease;
        }

        .datepicker-dropdown {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          z-index: 99999;
          animation: fadeInScale 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 90vh;
          overflow-y: auto;
        }
        

        @keyframes fadeInScale {
          from { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .datepicker-confirm {
          width: 100%;
          margin-top: 16px;
          padding: 14px;
          background: linear-gradient(135deg, #6d28d9, #5b21b6);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .datepicker-confirm:hover {
          transform: scale(1.02);
        }

        .search-error {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          background: #fef2f2;
          color: #dc2626;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          animation: fadeInUp 0.2s ease;
        }

        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateX(-50%) translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0); 
          }
        }

        @media (max-width: 900px) {
          .hero-text h1 {
            font-size: 2rem;
          }

          .airbnb-search-bar {
            flex-direction: column;
            border-radius: 24px;
            padding: 16px;
            gap: 4px;
          }

          .search-section {
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
          }

          .section-value {
            max-width: none;
          }

          .location-dropdown {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 400px;
          }

          .location-dropdown.open {
            transform: translate(-50%, -50%);
          }

          .search-divider {
            display: none;
          }

          .search-button {
            width: 100%;
            justify-content: center;
            border-radius: 12px;
            margin-top: 8px;
          }

          .datepicker-dropdown {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 95%;
            max-width: 400px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .search-error {
            position: static;
            transform: none;
            margin-top: 12px;
          }
        }
      `}</style>
    </section>
  );
}
