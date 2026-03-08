import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles.css";

const API_URL = process.env.REACT_APP_API_URL || '';
import TarjetaReserva from "./TarjetaReserva";

export default function Categorias({ onSelectVehicle }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filtroUrl = searchParams.get("filtro") || "todos";
  
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVehiculos() {
      try {
        const res = await fetch(`${API_URL}/api/vehiculos`);
        if (!res.ok) throw new Error("Error al cargar vehículos");
        const data = await res.json();
        setVehiculos(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchVehiculos();
  }, []);

  const filtrarVehiculos = () => {
    if (filtroUrl === "todos") return vehiculos;
    
    // Filtros lógicos
    if (filtroUrl === "capacidad5") return vehiculos.filter(v => v.CapacidadPasajeros >= 5);
    if (filtroUrl === "recientes") return vehiculos.filter(v => v.Año >= 2024);
    
    // Filtro exacto por Tipo
    return vehiculos.filter(v => v.Tipo === filtroUrl);
  };

  const handleFiltro = (nuevoFiltro) => {
    setSearchParams({ filtro: nuevoFiltro });
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Cargando vehículos...</div>;
  if (error) return <div style={{ padding: "100px", textAlign: "center", color: "red" }}>{error}</div>;

  const vehiculosFiltrados = filtrarVehiculos();

  const categorias = [
    { key: "todos", label: "Todos" },
    { key: "Económico", label: "Económico" },
    { key: "SUV", label: "SUV" },
    { key: "Lujo", label: "Lujo" },
    { key: "Sedán", label: "Sedán" },
    { key: "Eléctrico", label: "Eléctrico" },
    { key: "Camioneta", label: "Camioneta" },
    { key: "Todoterreno", label: "Todoterreno" },
    { key: "capacidad5", label: "5+ Pasajeros" },
    { key: "recientes", label: "Recientes" }
  ];

  return (
    <section className="categorias" id="categorias" style={{ padding: "100px 0 50px" }}>
      <div className="contenedor">
        <h2 className="categorias-titulo">Categorías</h2>

        <div className="categorias-buttons" style={{ marginBottom: "30px", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {categorias.map(cat => (
            <button
              key={cat.key}
              className={`cat-btn ${filtroUrl === cat.key ? "active" : ""}`}
              onClick={() => handleFiltro(cat.key)}
              style={{ textTransform: "capitalize" }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="vehiculos-list" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "20px" 
        }}>
          {vehiculosFiltrados.length > 0 ? (
            vehiculosFiltrados.map((v) => (
              <div key={v.ID_Vehiculo} style={{ height: "100%" }}>
                <TarjetaReserva 
                  carro={{
                    ID_Vehiculo: v.ID_Vehiculo,
                    imagen: v.ImagenUrl ? v.ImagenUrl : "./assets/lambo.jpg",
                    nombre: `${v.Marca} ${v.Modelo}`,
                    tipo: v.Tipo,
                    precio: v.Precio,
                    combustible: v.TipoCombustible || v.Tipo, 
                    asientos: v.CapacidadPasajeros,
                    año: v.Año,
                  }}
                  onSelect={onSelectVehicle} 
                />
              </div>
            ))
          ) : (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "12px" }}>
              No hay vehículos disponibles en esta categoría.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


