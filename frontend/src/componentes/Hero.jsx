import React, { useState, useEffect } from "react";
import "../styles.css";
import DateRangePickerHero from "./DateRangePickerHero";
import { useNavigate } from "react-router-dom"; 

export default function Hero({ selectedVehicle = null, usuario = null, onCategorySelect, vehiculos = [] }) {
  const navigate = useNavigate(); // Hook para navegación programática
  const ubicaciones = [
    "Aeropuerto Las Américas, Santo Domingo",
    "Aeropuerto Cibao, Santiago",
    "Punta Cana Centro",
    "Santo Domingo Centro",
    "Punta Cana Bavaro",
    "Santo Domingo Zona Colonial",
    "Punta Cana Uvero Alto"
  ];

  const [formulario, setFormulario] = useState({
    recogida: "",
    entrega: "",
    inicio: "",
    fin: "",
    categoria: "todos",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cedula: "",
    licencia: "",
  });

  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [modoReservarVehiculo, setModoReservarVehiculo] = useState(false);
  const [reporte, setReporte] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    setModoReservarVehiculo(!!selectedVehicle);
    if (selectedVehicle) {
      console.log("Vehículo recibido en Hero:", selectedVehicle);
      console.log("Tipo de Precio:", typeof selectedVehicle.Precio, "Tipo de precio:", typeof selectedVehicle.precio);
      setFormulario((prev) => ({
        ...prev,
        nombre: usuario?.Nombre || "",
        apellido: usuario?.Apellido || "",
        cedula: usuario?.Cedula || "",
        licencia: usuario?.Licencia_Conducir || "",
        email: usuario?.Correo_Electronico || "",
        telefono: usuario?.Telefono || "",
        categoria: selectedVehicle?.Tipo ? selectedVehicle.Tipo.toLowerCase() : "todos"
      }));
    }
  }, [selectedVehicle, usuario]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
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

  function calcularMonto() {
    if (!selectedVehicle || !formulario.inicio || !formulario.fin) return 0;
    const inicio = new Date(formulario.inicio);
    const fin = new Date(formulario.fin);
    if (isNaN(inicio) || isNaN(fin)) return 0;
    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    const precioDia = Number(selectedVehicle?.Precio || selectedVehicle?.precio || 0);
    return dias >= 0 ? dias * precioDia : 0;
  }

  function validar() {
    if (!formulario.inicio || !formulario.fin) return "Debes indicar fechas.";
    const inicio = new Date(formulario.inicio);
    const fin = new Date(formulario.fin);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (inicio >= fin) return "La fecha de recogida debe ser anterior a la de devolución.";
    if (modoReservarVehiculo) {
      if (!usuario) {
        if (!formulario.nombre || !formulario.apellido || !formulario.cedula || !formulario.licencia || !formulario.email || !formulario.telefono)
            return "Completa todos los campos personales.";
      }
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validar();
    if (err) {
      setError(err);
      return;
    }
  
    // Login opcional: Si no hay usuario, enviamos los datos para crear uno o usarlo como guest
    // Removed: if (modoReservarVehiculo && !usuario) { navigate('/login'); return; }
  
    if (modoReservarVehiculo) {
      const monto = calcularMonto();
      if (monto <= 0) {
        setError("El monto estimado no puede ser cero. Verifica las fechas ingresadas.");
        return;
      }
    
      const payload = {
        ID_Vehiculo: selectedVehicle?.ID_Vehiculo || 0,
        ID_Usuario: usuario?.ID_Usuario || 0, // 0 indica Guest/Nuevo Usuario
        Ubicacion_Entrega: formulario.recogida,
        Fecha_Recogida: formulario.inicio, 
        Fecha_Devolucion: formulario.fin,
        Ubicacion_Devolucion: formulario.entrega,
        Monto_Reservacion: monto,
        // Datos Guest
        Nombre: usuario?.Nombre || formulario.nombre,
        Apellido: usuario?.Apellido || formulario.apellido,
        Cedula: usuario?.Cedula || formulario.cedula,
        Licencia_Conducir: usuario?.Licencia_Conducir || formulario.licencia,
        Correo_Electronico: usuario?.Correo_Electronico || formulario.email,
        Telefono: usuario?.Telefono || formulario.telefono,
      };
    
      console.log("Payload enviado:", payload); 
    
      setProcesando(true); // Iniciar estado de carga
      try {
        const res = await fetch('/api/reservaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      
        if (!res.ok) {
          let errorMessage = `Error ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = await res.text();
          }
          throw new Error(errorMessage);
        }
      
        const data = await res.json();
        setExito(`Reservación creada con éxito! ID: ${data.id}`);
        setReporte(data.reporte);
      
        setFormulario((prev) => ({
          ...prev,
          nombre: "",
          apellido: "",
          cedula: "",
          licencia: "",
          email: "",
          telefono: ""
        }));
        setModoReservarVehiculo(false);
      } catch (err) {
        console.error("Error completo:", err);
        setError(err.message);
      } finally {
        setProcesando(false); // Terminar estado de carga siempre
      }
    } else {
      const seccionCarros = document.querySelector("#autos");
      if (seccionCarros) {
        seccionCarros.scrollIntoView({ behavior: "smooth" });
      }
    }
  }
  
  return (
    <section className="hero-section">
      <div className="contenedor hero-unido">
        <div className="texto-hero">
          <h1>Vive el camino como nunca antes</h1>
          <p>Reserva en minutos, elige la mejor opción para ti para viajar con tranquilidad.</p>
        </div>
        <aside className="busqueda-aside">
          <form className="busqueda-form" onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "600px" }}>
              <select name="recogida" value={formulario.recogida} onChange={handleChange} style={{ gridColumn: "1 / 2" }} required>
                <option value="">Ubicación de recogida</option>
                {ubicaciones.map((u, i) => <option key={i} value={u}>{u}</option>)}
              </select>
              <select name="entrega" value={formulario.entrega} onChange={handleChange} style={{ gridColumn: "2 / 3" }} required>
                <option value="">Ubicación de entrega</option>
                {ubicaciones.map((u, i) => <option key={i} value={u}>{u}</option>)}
              </select>

              <div style={{ gridColumn: "1 / 3" }}>
                <DateRangePickerHero onChangeRange={onRangeChange} />
              </div>

              {/* Selector de Categoría (Reemplaza botones para ahorrar espacio y ser dinámico 'heavy') */}
              <div style={{ gridColumn: "1 / 3", marginTop: "8px" }}>
                <select 
                  className="input-field" 
                  value={formulario.categoria} 
                  onChange={(e) => {
                      handleChange(e); 
                      if(onCategorySelect) onCategorySelect(e.target.value);
                  }}
                  name="categoria"
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" }}
                >
                  <option value="todos">Todas las categorías</option>
                  
                  <optgroup label="Más buscados">
                    <option value="economica">Económica ($&lt;50)</option>
                    <option value="lujo">Lujo ($&gt;100)</option>
                    <option value="suv">SUV / Jeepeta</option>
                    <option value="capacidad5">Familiar (5+ Pasajeros)</option>
                  </optgroup>

                  <optgroup label="Por Tipo de Carrocería">
                    {/* Generar dinámicamente tipos que no sean los de arriba (para evitar duplicados visuales si se quiere, o mostrar todos) */}
                    {[...new Set(vehiculos.map(v => v.Tipo).filter(Boolean))].map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {selectedVehicle && modoReservarVehiculo && (
                <div style={{ gridColumn: "1 / 3", marginTop: "8px", padding: "8px", border: "1px solid #e6eef6", borderRadius: "6px" }}>
                  <div>Vehículo seleccionado: {selectedVehicle.Marca || selectedVehicle.nombre || "Sin nombre"}</div>
                  <div>Categoría: {selectedVehicle.Tipo || selectedVehicle.tipo || "Sin tipo"}</div>
                  <div>Precio por día: ${(Number(selectedVehicle.Precio || selectedVehicle.precio || 0)).toFixed(2)}</div>
                  <div>Monto estimado: ${calcularMonto().toFixed(2)}</div>
                </div>
              )}

              {modoReservarVehiculo && (
                <>
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Nombre"
                    value={formulario.nombre}
                    onChange={handleChange}
                    style={{ gridColumn: "1 / 2", marginTop: "8px" }}
                  />
                  <input
                    name="apellido"
                    type="text"
                    placeholder="Apellido"
                    value={formulario.apellido}
                    onChange={handleChange}
                    style={{ gridColumn: "2 / 3", marginTop: "8px" }}
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder="Correo Electrónico"
                    value={formulario.email}
                    onChange={handleChange}
                    style={{ gridColumn: "1 / 2", marginTop: "8px" }}
                  />
                  <input
                    name="telefono"
                    type="tel"
                    placeholder="Teléfono"
                    value={formulario.telefono}
                    onChange={handleChange}
                    style={{ gridColumn: "2 / 3", marginTop: "8px" }}
                  />
                  <input
                    name="cedula"
                    type="text"
                    placeholder="Cédula / Documento"
                    value={formulario.cedula}
                    onChange={handleChange}
                    style={{ gridColumn: "1 / 2", marginTop: "8px" }}
                  />
                  <input
                    name="licencia"
                    type="text"
                    placeholder="Número de licencia"
                    value={formulario.licencia}
                    onChange={handleChange}
                    style={{ gridColumn: "2 / 3", marginTop: "8px" }}
                  />
                </>
              )}

              {error && <div style={{ color: "#b91c1c", fontSize: "13px", gridColumn: "1 / 3", marginTop: "8px" }}>{error}</div>}
              {exito && <div style={{ color: "green", fontSize: "13px", gridColumn: "1 / 3", marginTop: "8px" }}>{exito}</div>}

              <div style={{ display: "flex", gap: "8px", marginTop: "8px", gridColumn: "1 / 3" }}>
                <button type="submit" className="btn btn-primario todos" disabled={procesando} style={{ opacity: procesando ? 0.7 : 1 }}>
                  {procesando ? "Procesando..." : (modoReservarVehiculo ? "Reservar vehículo" : "Buscar autos")}
                </button>
                <button
                  type="button"
                  className="btn btn-contorno"
                  onClick={() => setModoReservarVehiculo((v) => !v)}
                >
                  {modoReservarVehiculo ? "Cancelar reserva" : "Reservar"}
                </button>
              </div>
            </div>
          </form>
        </aside>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(79,70,229,0.45), rgba(124,58,237,0.4))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('./assets/lambo.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />
    </section>
  );
}