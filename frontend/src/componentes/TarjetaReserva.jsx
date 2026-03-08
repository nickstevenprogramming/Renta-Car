import React, { useState } from "react";
import "../styles.css";

export default function TarjetaReserva({ carro = {}, onSelect, onOpenReservation }) {
  const {
    imagen = "./assets/lambo.jpg",
    nombre = "Sin nombre",
    tipo = "",
    precio = "—",
    combustible = "",
    asientos = "—",
    año = "—",
  } = carro || {};

  const [modalOpen, setModalOpen] = useState(false);

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const handleReserveFromModal = () => {
    if (onOpenReservation) {
      console.log("Abriendo modal de reservación para:", carro);
      onOpenReservation(carro);
    } else if (onSelect) {
      onSelect(carro);
    }
    setModalOpen(false);
  };

  return (
    <>
      <article className="tarjeta" style={{ border: "1px solid #e6eef6", borderRadius: "8px", overflow: "hidden", height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="tarjeta-imagen">
          <img src={imagen} alt={nombre} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
        </div>
        <div className="body-tarjeta" style={{ padding: "16px", display: "flex", flexDirection: "column", minHeight: "150px" }}>
          <div className="head-tarjeta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="apagado">{tipo}</div>
              <h4 className="titulo-tarjeta" style={{ fontSize: "1.2rem" }}>{nombre}</h4>
            </div>
            <div className="precio" style={{ fontSize: "1.2rem", color: "var(--brand)" }}>
              ${precio}<span className="por">/día</span>
            </div>
          </div>
          <p className="sub-tarjeta" style={{ fontSize: "0.95rem", marginTop: "8px", flexGrow: 1 }}>
            {combustible} • {asientos} asientos • Año {año}
          </p>
          <div className="accion-tarjeta" style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button className="btn btn-descripcion" onClick={toggleModal}>Detalles</button>
            <button
              className="btn btn-primario"
              onClick={() => {
                if (onOpenReservation) {
                  console.log("Abriendo modal de reservación desde botón:", carro);
                  onOpenReservation(carro);
                } else if (onSelect) {
                  onSelect(carro);
                }
              }}
            >
              Reservar
            </button>
          </div>
        </div>
      </article>

      {/* Modal para Detalles */}
      {modalOpen && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
        }}>
          <div className="modal-content" style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "12px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            position: "relative",
          }}>
            <img src={imagen} alt={nombre} style={{ width: "100%", height: "250px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }} />
            <h2 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>{nombre}</h2>
            <ul style={{ listStyle: "none", padding: 0, fontSize: "1rem" }}>
              <li><strong>Tipo:</strong> {tipo}</li>
              <li><strong>Precio por día:</strong> ${precio}</li>
              <li><strong>Combustible:</strong> {combustible}</li>
              <li><strong>Asientos:</strong> {asientos}</li>
              <li><strong>Año:</strong> {año}</li>
            </ul>
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button className="btn btn-contorno" onClick={toggleModal}>Cerrar</button>
              <button
                className="btn btn-primario"
                onClick={handleReserveFromModal}
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}