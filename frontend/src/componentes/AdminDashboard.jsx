import React, { useState, useEffect, useRef } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import "../styles.css";

export default function AdminDashboard() {
  const [vehiculos, setVehiculos] = useState([]);
  const [vehFilter, setVehFilter] = useState({ marca: "", ano: "", capacidad: "" });
  const [usuarios, setUsuarios] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [resFilter, setResFilter] = useState({ min_monto: "", max_monto: "", idVehiculo: "", idUsuario: "" });
  const [selectedUserReservas, setSelectedUserReservas] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserReservasLoading, setIsUserReservasLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [formulario, setFormulario] = useState({
    Marca: "", Modelo: "", Año: "", Tipo: "", Precio: "", Color: "", CapacidadPasajeros: "", imagen: null
  });
  const [resetStep, setResetStep] = useState(0); // 0: nada, 1: advertencia 1, 2: advertencia 2, 3: advertencia 3
  const [userFilter, setUserFilter] = useState({ query: "" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const vehRes = await fetch('/api/vehiculos');
      if (!vehRes.ok) throw new Error("Error al cargar vehículos");
      setVehiculos(await vehRes.json() || []);

      const usrRes = await fetch('/api/usuarios');
      let usrData = await usrRes.json();
      console.log("Usuarios data raw:", usrData);

      let usersArray = [];
      if (Array.isArray(usrData)) {
        usersArray = usrData;
      } else if (usrData && typeof usrData === 'object' && usrData !== null) {
        if (usrData.error) {
          throw new Error(usrData.error);
        } else if (Array.isArray(usrData.users)) {
          usersArray = usrData.users;
        } else if (Array.isArray(usrData.data)) {
          usersArray = usrData.data;
        } else {
          const values = Object.values(usrData);
          if (values.length > 0 && values.every(v => typeof v === 'object' && v !== null && !Array.isArray(v))) {
            usersArray = values;
          }
        }
      }
      setUsuarios(usersArray);

      const resRes = await fetch('/api/reservaciones');
      if (!resRes.ok) throw new Error("Error al cargar reservaciones");
      setReservaciones(await resRes.json() || []);

    } catch (err) {
      setError(err.message);
      setUsuarios([]);
      setVehiculos([]);
      setReservaciones([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleFilterChange(e, type) {
    const { name, value } = e.target;
    if (type === 'veh') setVehFilter((prev) => ({ ...prev, [name]: value }));
    if (type === 'res') setResFilter((prev) => ({ ...prev, [name]: value }));
  }

  const filteredVehiculos = vehiculos.filter(v => 
    (vehFilter.marca ? v.Marca.toLowerCase().includes(vehFilter.marca.toLowerCase()) : true) &&
    (vehFilter.ano ? v.Año.toString().includes(vehFilter.ano) : true) &&
    (vehFilter.capacidad ? v.CapacidadPasajeros.toString().includes(vehFilter.capacidad) : true)
  );

  const filteredReservaciones = reservaciones.filter(r => {
    const monto = r.Monto_Reservacion || 0;
    const minMonto = parseFloat(resFilter.min_monto) || 0;
    const maxMonto = parseFloat(resFilter.max_monto) || Infinity;
    return (
      (monto >= minMonto && monto <= maxMonto) &&
      (resFilter.idVehiculo ? r.ID_Vehiculo.toString().includes(resFilter.idVehiculo) : true) &&
      (resFilter.idUsuario ? r.ID_Usuario.toString().includes(resFilter.idUsuario) : true)
    );
  });

  const filteredUsuarios = usuarios.filter(u => {
    const q = userFilter.query.toLowerCase();
    return (
      u.ID_Usuario.toString().includes(q) ||
      (u.Nombre + " " + u.Apellido).toLowerCase().includes(q) ||
      u.Cedula.includes(q) ||
      u.Correo_Electronico.toLowerCase().includes(q)
    );
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    setFormulario((prev) => ({ ...prev, imagen: e.target.files[0] }));
  }

  async function handleAddVehicle(e) {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(formulario).forEach(key => {
      if (key !== 'imagen') formData.append(key, formulario[key]);
    });
    if (formulario.imagen) formData.append('imagen', formulario.imagen);
    
    try {
      let url = '/api/vehiculos';
      let method = 'POST';
      
      if (editMode && editId) {
        url = `/api/vehiculos/${editId}`;
        method = 'PUT';
      }

      const res = await fetch(url, { method: method, body: formData });
      if (!res.ok) throw new Error("Error al guardar vehículo");
      
      fetchData();
      cancelEdit();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message);
    }
  }

  function handleEditVehicle(v) {
    setEditMode(true);
    setEditId(v.ID_Vehiculo);
    setFormulario({
      Marca: v.Marca,
      Modelo: v.Modelo,
      Año: v.Año,
      Tipo: v.Tipo,
      Precio: v.Precio,
      Color: v.Color || "",
      CapacidadPasajeros: v.CapacidadPasajeros,
      imagen: null // La imagen no se puede pre-cargar en un input file por eso esta null
    });
    const form = document.querySelector('form');
    if (form) form.scrollIntoView({ behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditMode(false);
    setEditId(null);
    setFormulario({ Marca: "", Modelo: "", Año: "", Tipo: "", Precio: "", Color: "", CapacidadPasajeros: "", imagen: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDeleteVehicle(id) {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este vehículo?")) return;
    try {
      const res = await fetch(`/api/vehiculos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Error al eliminar vehículo");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewUserReservas(id) {
    setSelectedUserId(id);
    setIsUserReservasLoading(true);
    setSelectedUserReservas([]);
    try {
      const res = await fetch(`/api/reservaciones?id_usuario=${id}`);
      if (!res.ok) throw new Error(`Error al cargar reservas del usuario ${id}`);
      const data = await res.json();
      console.log(`Reservas para usuario ${id}:`, data);
      setSelectedUserReservas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setSelectedUserReservas([]);
    } finally {
      setIsUserReservasLoading(false);
    }
  }

  async function handleViewPdf(idReservacion) {
    try {
      console.log(`Solicitando PDF para reservación ${idReservacion}`);
      const res = await fetch(`/api/reservaciones/${idReservacion}/pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      const contentType = res.headers.get('Content-Type');
      if (!res.ok || !contentType || !contentType.includes('application/pdf')) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = await res.text();
        }
        throw new Error(`Error del servidor: ${typeof errorData === 'object' ? JSON.stringify(errorData) : errorData}`);
      }
      const blob = await res.blob();
      console.log(`PDF Blob: size=${blob.size}, type=${blob.type}`);
      if (blob.size === 0) {
        throw new Error("El PDF está vacío (tamaño 0 bytes). Verifica el backend.");
      }
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        console.warn("No se pudo abrir la ventana. Forzando descarga...");
        const link = document.createElement('a');
        link.href = url;
        link.download = `reservacion_${idReservacion}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error en handleViewPdf:", err.message);
    }
  }

  async function handleFullReset() {
    if (resetStep === 0) {
      setResetStep(1);
    } else if (resetStep === 1) {
      setResetStep(2);
    } else if (resetStep === 2) {
      setResetStep(3);
    } else if (resetStep === 3) {
      try {
        const res = await fetch('/api/vehiculos/reset-all', { method: 'DELETE' });
        if (!res.ok) throw new Error("Error al resetear la base de datos.");
        const data = await res.json();
        alert(data.message);
        fetchData();
        setResetStep(0);
      } catch (err) {
        alert(err.message);
      }
    }
  }
  
  function cancelReset() {
    setResetStep(0);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "Fecha inválida";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const tableStyles = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 5px',
  };

  const thStyles = {
    padding: '12px',
    borderBottom: '2px solid #6d28d9',
    textAlign: 'left',
    backgroundColor: '#f9f9f9',
    minWidth: '120px',
  };

  const tdStyles = {
    padding: '12px',
    borderBottom: '1px solid #ddd',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  return (
    <section className="admin-section">
      <div className="contenedor">
        <h2>Dashboard Admin</h2>
        <Tabs>
          <TabList>
            <Tab>Vehículos</Tab>
            <Tab>Usuarios</Tab>
            <Tab>Reservaciones</Tab>
          </TabList>

          <TabPanel>
            <h3>Vehículos</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input name="marca" placeholder="Marca" onChange={(e) => handleFilterChange(e, 'veh')} style={{ padding: '8px', borderRadius: '4px' }} />
              <input name="ano" placeholder="Año" onChange={(e) => handleFilterChange(e, 'veh')} style={{ padding: '8px', borderRadius: '4px' }} />
              <input name="capacidad" placeholder="Capacidad" onChange={(e) => handleFilterChange(e, 'veh')} style={{ padding: '8px', borderRadius: '4px' }} />
            </div>
            <div className="vehiculos-list" style={{ maxHeight: '600px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {loading ? (
                <p>Cargando vehículos...</p>
              ) : filteredVehiculos.length === 0 ? (
                <p>No se encontraron vehículos.</p>
              ) : (
                filteredVehiculos.map(v => (
                  <div key={v.ID_Vehiculo} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', background: '#fff' }}>
                    <img src={v.ImagenUrl || '/assets/placeholder.jpg'} alt={v.Modelo} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1, marginTop: '10px' }}>
                      <h4 style={{ margin: '0 0 5px 0' }}>{v.Marca} {v.Modelo}</h4>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>ID: {v.ID_Vehiculo}</div>
                      <p style={{ margin: 0, fontSize: '14px' }}><strong>Año:</strong> {v.Año}</p>
                      <p style={{ margin: 0, fontSize: '14px' }}><strong>Precio:</strong> ${v.Precio}/día</p>
                      <p style={{ margin: 0, fontSize: '14px' }}><strong>Cap:</strong> {v.CapacidadPasajeros} pers.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button onClick={() => handleEditVehicle(v)} style={{ flex: 1, background: '#ea580c', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                      <button onClick={() => handleDeleteVehicle(v.ID_Vehiculo)} style={{ flex: 1, background: '#b91c1c', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ margin: '20px 0', borderTop: '2px solid #eee', paddingTop: '20px' }}>
              <div style={{ border: '1px solid #b91c1c', padding: '20px', borderRadius: '8px', background: '#fee2e2' }}>
                <h4 style={{ color: '#b91c1c', marginTop: 0 }}>Zona de Peligro</h4>
                {resetStep === 0 && (
                  <button onClick={handleFullReset} style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Resetear Todos los Vehículos (Truncate)
                  </button>
                )}
                
                {resetStep === 1 && (
                    <div style={{ background: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #b91c1c' }}>
                      <p style={{ color: '#b91c1c', fontWeight: 'bold' }}>⚠️ ADVERTENCIA 1/3</p>
                      <p>¿Estás seguro de que deseas eliminar TODOS los vehículos de la base de datos?</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={handleFullReset} style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer' }}>Sí, continuar</button>
                        <button onClick={cancelReset} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer' }}>Cancelar</button>
                      </div>
                    </div>
                )}
                
                {resetStep === 2 && (
                    <div style={{ background: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #b91c1c' }}>
                      <p style={{ color: '#b91c1c', fontWeight: 'bold' }}>⚠️ ADVERTENCIA 2/3</p>
                      <p>¡Esta acción NO se puede deshacer! Se borrarán todas las imágenes y registros.</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={handleFullReset} style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer' }}>Sí, estoy seguro</button>
                        <button onClick={cancelReset} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer' }}>Cancelar</button>
                      </div>
                    </div>
                )}

                {resetStep === 3 && (
                    <div style={{ background: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #b91c1c' }}>
                      <p style={{ color: '#b91c1c', fontWeight: 'bold' }}>⚠️ ULTIMA ADVERTENCIA 3/3</p>
                      <p>¿Realizar esta acción sin autorización puede ocasionar tu despido o sanciones graves. ¿Aún así deseas proceder?</p>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button onClick={handleFullReset} style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer' }}>BORRAR TODO AHORA</button>
                        <button onClick={cancelReset} style={{ background: '#6b7280', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer' }}>Cancelar</button>
                      </div>
                    </div>
                )}
              </div>
            </div>
            
            <h4>{editMode ? `Editando Vehículo #${editId}` : "Añadir Vehículo"}</h4>
            <form onSubmit={handleAddVehicle} 
            style={{ 
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px', 
              background: editMode ? '#fff7ed' : 'linear-gradient(#f9f9f9, #e6eef6)', 
              border: editMode ? '2px solid #ea580c' : 'none',
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)' 
            }}>
              <input name="Marca" placeholder="Marca" value={formulario.Marca} onChange={handleChange} required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #6d28d9' }} />
              <input name="Modelo" placeholder="Modelo" value={formulario.Modelo} onChange={handleChange} required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #6d28d9' }} />
              <input name="Año" type="number" placeholder="Año" value={formulario.Año} onChange={handleChange} required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #6d28d9' }} />
              <input name="Tipo" placeholder="Tipo" value={formulario.Tipo} onChange={handleChange} required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #6d28d9' }} />
              <input name="Precio" type="number" placeholder="Precio" value={formulario.Precio} onChange={handleChange} required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #6d28d9' }} />
              <input name="Color" placeholder="Color" value={formulario.Color} onChange={handleChange} required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #6d28d9' }} />
              <input name="CapacidadPasajeros" type="number" placeholder="Capacidad" value={formulario.CapacidadPasajeros} onChange={handleChange} required 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #6d28d9' }} />
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Imagen (Dejar vacío para mantener la actual si editas)</label>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" required={!editMode} 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #6d28d9' }} />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                <button type="submit" 
                style={{ 
                  flex: 1,
                  padding: '12px', 
                  background: editMode ? '#ea580c' : 'linear-gradient(#6d28d9, #5b21b6)', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}>{editMode ? "Guardar Cambios" : "Añadir Vehículo"}</button>
                
                {editMode && (
                  <button type="button" onClick={cancelEdit}
                  style={{ 
                    padding: '12px 20px', 
                    background: '#6b7280', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                  }}>Cancelar</button>
                )}
              </div>
            </form>
          </TabPanel>

          <TabPanel>
            <h3>Usuarios</h3>
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="text" 
                placeholder="Buscar por ID, Nombre, Cédula, Correo..." 
                value={userFilter.query}
                onChange={(e) => setUserFilter({ query: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={{ ...thStyles, minWidth: '80px' }}>ID</th>
                    <th style={{ ...thStyles, minWidth: '150px' }}>Nombre Completo</th>
                    <th style={{ ...thStyles, minWidth: '120px' }}>Cédula</th>
                    <th style={{ ...thStyles, minWidth: '200px' }}>Correo</th>
                    <th style={{ ...thStyles, minWidth: '120px' }}>Teléfono</th>
                    <th style={{ ...thStyles, minWidth: '100px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Cargando usuarios...</td></tr>
                  ) : filteredUsuarios.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron usuarios.</td></tr>
                  ) : (
                    filteredUsuarios.map(u => (
                      <tr key={u.ID_Usuario}>
                        <td style={tdStyles}>{u.ID_Usuario}</td>
                        <td style={tdStyles}>{u.Nombre} {u.Apellido}</td>
                        <td style={tdStyles}>{u.Cedula}</td>
                        <td style={tdStyles}>{u.Correo_Electronico}</td>
                        <td style={tdStyles}>{u.Telefono}</td>
                        <td style={tdStyles}>
                          <button onClick={() => handleViewUserReservas(u.ID_Usuario)} style={{ padding: '6px 12px', cursor: 'pointer', background: '#6d28d9', color: '#fff', borderRadius: '4px' }}>
                            Ver Reservas
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedUserId !== null && (
              <div style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                <h4>Reservas del usuario (ID: {selectedUserId})</h4>
                {isUserReservasLoading ? (
                  <p>Cargando reservas del usuario...</p>
                ) : selectedUserReservas.length > 0 ? (
                  <table style={tableStyles}>
                    <thead>
                      <tr>
                        <th style={{ ...thStyles, minWidth: '80px' }}>ID</th>
                        <th style={{ ...thStyles, minWidth: '100px' }}>Vehículo</th>
                        <th style={{ ...thStyles, minWidth: '100px' }}>Monto</th>
                        <th style={{ ...thStyles, minWidth: '120px' }}>Fecha</th>
                        <th style={{ ...thStyles, minWidth: '100px' }}>PDF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserReservas.map(r => (
                        <tr key={r.ID_Reservacion}>
                          <td style={tdStyles}>{r.ID_Reservacion}</td>
                          <td style={tdStyles}>{r.ID_Vehiculo}</td>
                          <td style={tdStyles}>${r.Monto_Reservacion}</td>
                          <td style={tdStyles}>{formatDate(r.Fecha_Reservacion)}</td>
                          <td style={tdStyles}>
                            <button onClick={() => handleViewPdf(r.ID_Reservacion)} style={{ padding: '6px 12px', cursor: 'pointer', background: '#6d28d9', color: '#fff', borderRadius: '4px' }}>
                              Ver PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Este usuario no tiene reservaciones.</p>
                )}
              </div>
            )}
          </TabPanel>

          <TabPanel>
            <h3>Reservaciones Generales</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input name="min_monto" placeholder="Min Monto" onChange={(e) => handleFilterChange(e, 'res')} style={{ padding: '8px', borderRadius: '4px' }} />
              <input name="max_monto" placeholder="Max Monto" onChange={(e) => handleFilterChange(e, 'res')} style={{ padding: '8px', borderRadius: '4px' }} />
              <input name="idVehiculo" placeholder="ID Vehículo" onChange={(e) => handleFilterChange(e, 'res')} style={{ padding: '8px', borderRadius: '4px' }} />
              <input name="idUsuario" placeholder="ID Usuario" onChange={(e) => handleFilterChange(e, 'res')} style={{ padding: '8px', borderRadius: '4px' }} />
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={{ ...thStyles, minWidth: '80px' }}>ID</th>
                    <th style={{ ...thStyles, minWidth: '100px' }}>Vehículo</th>
                    <th style={{ ...thStyles, minWidth: '100px' }}>Usuario</th>
                    <th style={{ ...thStyles, minWidth: '100px' }}>Monto</th>
                    <th style={{ ...thStyles, minWidth: '120px' }}>Fecha</th>
                    <th style={{ ...thStyles, minWidth: '100px' }}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Cargando reservaciones...</td></tr>
                  ) : filteredReservaciones.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron reservaciones.</td></tr>
                  ) : (
                    filteredReservaciones.map(r => (
                      <tr key={r.ID_Reservacion}>
                        <td style={tdStyles}>{r.ID_Reservacion}</td>
                        <td style={tdStyles}>{r.ID_Vehiculo}</td>
                        <td style={tdStyles}>{r.ID_Usuario}</td>
                        <td style={tdStyles}>${r.Monto_Reservacion}</td>
                        <td style={tdStyles}>{formatDate(r.Fecha_Reservacion)}</td>
                        <td style={tdStyles}>
                          <button onClick={() => handleViewPdf(r.ID_Reservacion)} style={{ padding: '6px 12px', background: '#6d28d9', color: '#fff', borderRadius: '4px' }}>
                            Ver PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabPanel>
        </Tabs>
        {error && <p style={{ color: 'red', marginTop: '15px' }}>Error: {error}</p>}
      </div>
    </section>
  );
} 