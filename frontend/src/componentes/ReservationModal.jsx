import React, { useState, useEffect } from "react";
import DateRangePickerHero from "./DateRangePickerHero";
import "../styles.css";
const API_URL = process.env.REACT_APP_API_URL || "";



export default function ReservationModal({ 
  isOpen, 
  onClose, 
  vehicle, 
  initialDates = null, 
  usuario = null 
}) {
  const [listaExtras, setListaExtras] = useState([]);
  const [listaSucursales, setListaSucursales] = useState([]);
  
  const [formData, setFormData] = useState({
    recogida: initialDates?.recogida || "",
    entrega: initialDates?.entrega || "",
    inicio: initialDates?.inicio || "",
    fin: initialDates?.fin || "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cedula: "",
    licencia: "",
  });

  // State for selected extras (IDs)
  const [selectedExtras, setSelectedExtras] = useState({});

  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // Fetch catalogs on mount
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [extrasRes, sucursalesRes] = await Promise.all([
          fetch(`${API_URL}/api/extras`),
          fetch(`${API_URL}/api/sucursales`)
        ]);

        if (extrasRes.ok) {
          const extrasData = await extrasRes.json();
          setListaExtras(extrasData);
        }

        if (sucursalesRes.ok) {
          const sucursalesData = await sucursalesRes.json();
          setListaSucursales(sucursalesData);
        }
      } catch (err) {
        console.error("Error fetching catalogs:", err);
      }
    };
    fetchCatalogos();
  }, []);

  useEffect(() => {
    if (usuario) {
      setFormData(prev => ({
        ...prev,
        nombre: usuario.Nombre || "",
        apellido: usuario.Apellido || "",
        email: usuario.Correo_Electronico || "",
        telefono: usuario.Telefono || "",
        cedula: usuario.Cedula || "",
        licencia: usuario.Licencia_Conducir || "",
      }));
    }
  }, [usuario]);

  useEffect(() => {
    if (isOpen && initialDates) {
      setFormData(prev => ({
        ...prev,
        recogida: initialDates.recogida || prev.recogida,
        entrega: initialDates.entrega || prev.entrega,
        inicio: initialDates.inicio || prev.inicio,
        fin: initialDates.fin || prev.fin,
      }));
    }
    setError(null);
    setExito(null);
  }, [isOpen, initialDates]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleExtraChange = (extraId) => {
    setSelectedExtras(prev => ({ ...prev, [extraId]: !prev[extraId] }));
  };

  const onRangeChange = (payload) => {
    setFormData(prev => ({
      ...prev,
      inicio: payload.Fecha_Recogida,
      fin: payload.Fecha_Devolucion,
    }));
    setError(null);
  };

  const calcularDias = () => {
    if (!formData.inicio || !formData.fin) return 0;
    const inicio = new Date(formData.inicio);
    const fin = new Date(formData.fin);
    if (isNaN(inicio) || isNaN(fin)) return 0;
    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    return dias >= 0 ? dias : 0;
  };

  const calcularSubtotal = () => {
    const dias = calcularDias();
    const precioDia = Number(vehicle?.Precio || vehicle?.precio || 0);
    return dias * precioDia;
  };

  const calcularExtras = () => {
    const dias = calcularDias();
    return listaExtras.reduce((total, extra) => {
      if (selectedExtras[extra.ID_Extra]) {
        return total + (Number(extra.Precio) * dias);
      }
      return total;
    }, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularExtras();
  };

  const validar = () => {
    if (!usuario) return "Debes iniciar sesión para completar una reservación.";
    if (!formData.recogida) return "Selecciona ubicación de recogida.";
    if (!formData.entrega) return "Selecciona ubicación de entrega.";
    if (!formData.inicio || !formData.fin) return "Selecciona las fechas.";
    
    const inicio = new Date(formData.inicio);
    const fin = new Date(formData.fin);
    if (inicio >= fin) return "La fecha de recogida debe ser anterior a la devolución.";
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validar();
    if (err) {
      setError(err);
      return;
    }

    const monto = calcularTotal();
    if (monto <= 0) {
      setError("El monto no puede ser cero. Verifica las fechas.");
      return;
    }

    const payload = {
      ID_Vehiculo: vehicle?.ID_Vehiculo || 0,
      ID_Usuario: usuario?.ID_Usuario || 0,
      Ubicacion_Entrega: formData.recogida,
      Fecha_Recogida: formData.inicio,
      Fecha_Devolucion: formData.fin,
      Ubicacion_Devolucion: formData.entrega,
      Monto_Reservacion: monto,
      Nombre: usuario?.Nombre || formData.nombre,
      Apellido: usuario?.Apellido || formData.apellido,
      Cedula: usuario?.Cedula || formData.cedula,
      Licencia_Conducir: usuario?.Licencia_Conducir || formData.licencia,
      Correo_Electronico: usuario?.Correo_Electronico || formData.email,
      Telefono: usuario?.Telefono || formData.telefono,
      Extras: Object.entries(selectedExtras)
        .filter(([_, selected]) => selected)
        .map(([id]) => Number(id)),
    };

    setProcesando(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/reservaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = `Error ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = await res.text();
        }
        throw new Error(errorMessage);
      }

      await res.json();
      setExito("¡Reservación confirmada exitosamente!");
      
      setTimeout(() => {
        onClose();
        setExito(null);
      }, 3000);

    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  const dias = calcularDias();

  return (
    <div className="reservation-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      {/* Processing Overlay */}
      {procesando && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <h3>Procesando tu reservación</h3>
            <p>Por favor espera un momento...</p>
          </div>
        </div>
      )}

      <div className="reservation-modal">
        {/* Header */}
        <div className="reservation-header">
          <img 
            src={vehicle.ImagenUrl || vehicle.imagen || '/assets/placeholder.jpg'} 
            alt={vehicle.Marca || vehicle.nombre} 
            className="vehicle-image"
          />
          <div className="vehicle-info">
            <h2>{vehicle.Marca} {vehicle.Modelo || vehicle.nombre}</h2>
            <p className="vehicle-details">
              {vehicle.Tipo || vehicle.tipo} • {vehicle.Año || vehicle.año} • {vehicle.CapacidadPasajeros || vehicle.asientos} asientos
            </p>
            <p className="vehicle-price">
              ${Number(vehicle.Precio || vehicle.precio || 0).toFixed(2)}<span>/día</span>
            </p>
          </div>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="reservation-form">
          {!usuario && (
            <div className="message error-message">Debes iniciar sesión para reservar.</div>
          )}
          {/* Fechas */}
          <div className="form-section">
            <h3>📅 Fechas de Reserva</h3>
            <DateRangePickerHero onChangeRange={onRangeChange} months={2} />
          </div>

          {/* Ubicaciones */}
          <div className="form-section">
            <h3>📍 Ubicaciones</h3>
            <div className="location-grid">
              <div className="form-field">
                <label>Recoger en</label>
                <select name="recogida" value={formData.recogida} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  {listaSucursales.map((u) => <option key={u.ID_Sucursal} value={u.Nombre}>{u.Nombre}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Entregar en</label>
                <select name="entrega" value={formData.entrega} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  {listaSucursales.map((u) => <option key={u.ID_Sucursal} value={u.Nombre}>{u.Nombre}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Datos personales */}
          {!usuario && (
            <div className="form-section">
              <h3>👤 Datos del Conductor</h3>
              <div className="personal-grid">
                <input name="nombre" type="text" placeholder="Nombre *" value={formData.nombre} onChange={handleChange} required />
                <input name="apellido" type="text" placeholder="Apellido *" value={formData.apellido} onChange={handleChange} required />
                <input name="email" type="email" placeholder="Correo Electrónico *" value={formData.email} onChange={handleChange} required />
                <input name="telefono" type="tel" placeholder="Teléfono *" value={formData.telefono} onChange={handleChange} required />
                <input name="cedula" type="text" placeholder="Cédula / Documento *" value={formData.cedula} onChange={handleChange} required />
                <input name="licencia" type="text" placeholder="Número de Licencia *" value={formData.licencia} onChange={handleChange} required />
              </div>
            </div>
          )}

          {/* Extras */}
          <div className="form-section">
            <h3>✨ Extras Opcionales</h3>
              <div className="extras-grid">
                {listaExtras.map((extra) => (
                  <label key={extra.ID_Extra} className={`extra-card ${selectedExtras[extra.ID_Extra] ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!selectedExtras[extra.ID_Extra]}
                      onChange={() => handleExtraChange(extra.ID_Extra)}
                    />
                    <span className="extra-icon">{extra.Icono || '✨'}</span>
                    <div className="extra-info">
                      <span className="extra-name">{extra.Nombre}</span>
                      <span className="extra-price">+${Number(extra.Precio).toFixed(2)}/día</span>
                    </div>
                  </label>
                ))}
              </div>
          </div>

          {/* Resumen */}
          <div className="summary-section">
            <div className="summary-row">
              <span>Vehículo ({dias} días × ${Number(vehicle.Precio || vehicle.precio || 0).toFixed(2)})</span>
              <span>${calcularSubtotal().toFixed(2)}</span>
            </div>
            {calcularExtras() > 0 && (
              <div className="summary-row">
                <span>Extras ({dias} días)</span>
                <span>${calcularExtras().toFixed(2)}</span>
              </div>
            )}
            <div className="summary-total">
              <span>Total</span>
              <span>${calcularTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Mensajes */}
          {error && <div className="message error-message">⚠️ {error}</div>}
          {exito && <div className="message success-message">✅ {exito}</div>}

          {/* Botones */}
          <div className="action-buttons">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-confirm" disabled={procesando || dias <= 0 || !usuario}>
              Confirmar Reservación - ${calcularTotal().toFixed(2)}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .reservation-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 20px;
        }

        .reservation-modal {
          background: #fff;
          border-radius: 24px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Processing Overlay */
        .processing-overlay {
          position: fixed;
          inset: 0;
          background: rgba(109, 40, 217, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 4000;
          animation: fadeIn 0.3s ease;
        }

        .processing-content {
          text-align: center;
          color: #fff;
        }

        .processing-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          margin: 0 auto 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .processing-content h3 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .processing-content p {
          opacity: 0.8;
        }

        /* Header */
        .reservation-header {
          display: flex;
          gap: 20px;
          padding: 28px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #f8f4ff 0%, #fff 100%);
          border-radius: 24px 24px 0 0;
        }

        .vehicle-image {
          width: 140px;
          height: 100px;
          object-fit: cover;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .vehicle-info {
          flex: 1;
        }

        .vehicle-info h2 {
          font-size: 1.6rem;
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .vehicle-details {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0 0 8px 0;
        }

        .vehicle-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #6d28d9;
          margin: 0;
        }

        .vehicle-price span {
          font-size: 1rem;
          font-weight: 400;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #9ca3af;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        /* Form */
        .reservation-form {
          padding: 28px;
        }

        .form-section {
          margin-bottom: 28px;
        }

        .form-section:first-child {
          /* Dates section - expanded */
        }

        .form-section:first-child .date-range-picker-container {
          width: 100%;
        }

        .form-section:first-child .date-range-picker-container .rdrCalendarWrapper {
          width: 100%;
        }

        .form-section:first-child .date-range-picker-container .rdrMonths {
          justify-content: center;
        }

        .form-section h3 {
          font-size: 1.1rem;
          color: #374151;
          margin: 0 0 16px 0;
          font-weight: 600;
        }

        .location-grid, .personal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-field label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-field select, .personal-grid input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          font-size: 0.95rem;
          background: #f9fafb;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-field select:focus, .personal-grid input:focus {
          outline: none;
          border-color: #6d28d9;
          box-shadow: 0 0 0 4px rgba(109, 40, 217, 0.1);
        }

        /* Extras */
        .extras-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .extra-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .extra-card:hover {
          border-color: #c4b5fd;
        }

        .extra-card.selected {
          border-color: #6d28d9;
          background: #f8f4ff;
        }

        .extra-card input {
          width: 20px;
          height: 20px;
          accent-color: #6d28d9;
        }

        .extra-icon {
          font-size: 1.4rem;
        }

        .extra-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .extra-name {
          font-weight: 500;
          color: #0f172a;
          font-size: 0.95rem;
        }

        .extra-price {
          color: #6d28d9;
          font-weight: 600;
          font-size: 0.85rem;
        }

        /* Summary */
        .summary-section {
          padding: 24px;
          background: linear-gradient(135deg, #f8f4ff 0%, #ede9fe 100%);
          border-radius: 16px;
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 2px solid #ddd6fe;
          margin-top: 12px;
        }

        .summary-total span:first-child {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
        }

        .summary-total span:last-child {
          font-size: 1.6rem;
          font-weight: 700;
          color: #6d28d9;
        }

        /* Messages */
        .message {
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 0.95rem;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .success-message {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
        }

        /* Buttons */
        .action-buttons {
          display: flex;
          gap: 16px;
        }

        .btn-cancel {
          flex: 1;
          padding: 16px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: #fff;
          color: #374151;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-confirm {
          flex: 2;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #6d28d9, #5b21b6);
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(109, 40, 217, 0.4);
          transition: all 0.2s;
        }

        .btn-confirm:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(109, 40, 217, 0.5);
        }

        .btn-confirm:disabled {
          background: #9ca3af;
          box-shadow: none;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 700px) {
          .reservation-header {
            flex-direction: column;
            text-align: center;
          }

          .vehicle-image {
            width: 100%;
            height: 150px;
          }

          .location-grid, .personal-grid, .extras-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-cancel, .btn-confirm {
            flex: none;
          }
        }
      `}</style>
    </div>
  );
}
