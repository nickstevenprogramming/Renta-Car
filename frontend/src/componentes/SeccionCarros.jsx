import React, { useState, useEffect } from "react";
import "../styles.css";
import TarjetaReserva from "./TarjetaReserva";

export default function SeccionCarros({ onSelectVehicle, currentFilter = "todos", onFilterChange, vehiculos = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const filtrarVehiculos = () => {
    if (currentFilter === "todos") return vehiculos;
    
    // Filtros lógicos
    if (currentFilter === "capacidad5") return vehiculos.filter(v => v.CapacidadPasajeros >= 5);
    if (currentFilter === "recientes") return vehiculos.filter(v => v.Año >= 2024);
    
    // Filtro exacto por Tipo (Económico, SUV, Lujo, Sedán)
    return vehiculos.filter(v => v.Tipo === currentFilter);
  };

  const handleFiltro = (categoria) => {
    if (onFilterChange) {
      onFilterChange(categoria);
    } 
  };

  if (loading) return <div style={{ padding: 24, textAlign: "center" }}>Cargando...</div>;
  if (error) return <div style={{ padding: 24, textAlign: "center", color: "#b91c1c" }}>{error}</div>;

  return (
    <section className="seccion-carros" id="autos">
      <div className="contenedor">
        <div className="seccion-head">
          <h2 style={{ fontSize: "2rem", color: "var(--brand)" }}>Elige el coche que se ajuste a ti</h2>
          
          <div className="filtro" style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: 'center' }}>
            <button className={`chip small ${currentFilter === "todos" ? "activo" : ""}`} onClick={() => handleFiltro("todos")}>
              Todos
            </button>
            
            <button className={`chip small ${currentFilter === "Económico" ? "activo" : ""}`} onClick={() => handleFiltro("Económico")}>
              Económico
            </button>
            <button className={`chip small ${currentFilter === "SUV" ? "activo" : ""}`} onClick={() => handleFiltro("SUV")}>
              SUV
            </button>
            <button className={`chip small ${currentFilter === "Lujo" ? "activo" : ""}`} onClick={() => handleFiltro("Lujo")}>
              Lujo
            </button>
            <button className={`chip small ${currentFilter === "Sedán" ? "activo" : ""}`} onClick={() => handleFiltro("Sedán")}>
              Sedán
            </button>
            <button className={`chip small ${currentFilter === "Eléctrico" ? "activo" : ""}`} onClick={() => handleFiltro("Eléctrico")}>
              Eléctrico
            </button>
            <button className={`chip small ${currentFilter === "Camioneta" ? "activo" : ""}`} onClick={() => handleFiltro("Camioneta")}>
              Camioneta
            </button>
            <button className={`chip small ${currentFilter === "Todoterreno" ? "activo" : ""}`} onClick={() => handleFiltro("Todoterreno")}>
              Todoterreno
            </button>

            <div style={{ width: '1px', background: '#ddd', margin: '0 5px' }}></div>
            
            <button className={`chip small ${currentFilter === "capacidad5" ? "activo" : ""}`} onClick={() => handleFiltro("capacidad5")}>
              5+ Pasajeros
            </button>
            <button className={`chip small ${currentFilter === "recientes" ? "activo" : ""}`} onClick={() => handleFiltro("recientes")}>
              Recientes
            </button>
          </div>
        </div>

        <div className="tarjeta-grid" style={{
          display: "grid",
          overflowY: "auto",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
          paddingBottom: "20px",
          scrollSnapType: "x mandatory",
        }}>
          {filtrarVehiculos().length > 0 ? (
            filtrarVehiculos().map((carro) => (
              <div style={{ height: "100%", scrollSnapAlign: "start" }} key={carro.ID_Vehiculo}>
                <TarjetaReserva
                  key={carro.ID_Vehiculo}
                  carro={{
                    ID_Vehiculo: carro.ID_Vehiculo,
                    imagen: carro.ImagenUrl ? `http://127.0.0.1:5000${carro.ImagenUrl}` : "./assets/lambo.jpg",
                    nombre: `${carro.Marca} ${carro.Modelo}`,
                    tipo: carro.Tipo,
                    precio: carro.Precio,
                    combustible: carro.TipoCombustible || carro.Tipo,
                    asientos: carro.CapacidadPasajeros,
                    año: carro.Año,
                  }}
                  onSelect={(vehiculo) => onSelectVehicle(vehiculo || carro)}
                />
              </div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
              No hay vehículos que coincidan con este filtro.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
