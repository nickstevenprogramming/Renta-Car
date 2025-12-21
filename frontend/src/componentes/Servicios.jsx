import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaTools, FaShieldAlt, FaStar, FaTruck, FaWifi } from "react-icons/fa"; 
import "../styles.css";

const servicioItems = [
  { id: 1, titulo: "Alquiler Diario", descripcion: "Renta por día con tarifas claras y cobertura básica incluida.", icon: <FaCalendarAlt /> },
  { id: 2, titulo: "Asistencia 24/7", descripcion: "Soporte en carretera las 24 horas, los 7 días de la semana.", icon: <FaTools /> },
  { id: 3, titulo: "Seguro Completo", descripcion: "Protección a todo riesgo para viajar sin preocupaciones.", icon: <FaShieldAlt /> },
  { id: 4, titulo: "Flota Premium", descripcion: "Vehículos de lujo con mantenimiento premium garantizado.", icon: <FaStar /> },
  { id: 5, titulo: "Entrega a Domicilio", descripcion: "Recibe y devuelve el vehículo donde prefieras sin costo extra.", icon: <FaTruck /> },
  { id: 6, titulo: "WiFi Gratis", descripcion: "Conexión WiFi de alta velocidad incluida en todos los vehículos.", icon: <FaWifi /> },
];

export default function Servicios() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % servicioItems.length);
      setIsTransitioning(false);
    }, 150);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + servicioItems.length) % servicioItems.length);
      setIsTransitioning(false);
    }, 150);
  };

  // Auto-play cada 5 segundos
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="servicios" id="servicios">
      <div className="contenedor">
        <h2 className="servicios-titulo" style={{ fontSize: "2.2rem", color: "var(--brand)", marginBottom: "24px", textAlign: "center" }}>
          Nuestros Servicios
        </h2>
        
        <div className="servicios-grid" style={{ position: "relative", overflow: "hidden", padding: "20px 0" }}>
          <div
            className="servicios-carousel"
            style={{
              display: "flex",
              transform: `translateX(-${currentIndex * 33.33}%)`, 
              transition: isTransitioning ? "none" : "transform 0.5s ease-in-out",
              gap: "20px",
              width: "100%",
            }}
          >
            {servicioItems.map((s) => (
              <article
                key={s.id}
                className="servicio-tarjeta"
                style={{
                  flex: "0 0 calc(45.15% - 25px)", 
                  minWidth: "calc(45.15% - 25px)",
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "28px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  textAlign: "center",
                  border: "1px solid #e6eef6",
                }}
              >
                <div className="servicio-icono" style={{ 
                  marginBottom: "20px", 
                  display: "flex", 
                  justifyContent: "center",
                  fontSize: "48px",
                  color: "var(--brand)"
                }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: "1.4rem", color: "#0f172a", marginBottom: "12px" }}>{s.titulo}</h3>
                <p style={{ fontSize: "1rem", color: "#4b5563", lineHeight: "1.6" }}>{s.descripcion}</p>
              </article>
            ))}
          </div>
          
          <button
            onClick={prevSlide}
            aria-label="Anterior"
            style={{
              position: "absolute",
              left: "-10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#fff",
              border: "2px solid #6d28d9",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            aria-label="Siguiente"
            style={{
              position: "absolute",
              right: "-10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#fff",
              border: "2px solid #6d28d9",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Indicadores */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
          {servicioItems.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: currentIndex === index ? "#6d28d9" : "#e6eef6",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}