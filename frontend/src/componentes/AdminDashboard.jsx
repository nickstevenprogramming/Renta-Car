import React, { useState, useEffect, useRef, useMemo } from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useNavigate } from "react-router-dom";
import 'react-tabs/style/react-tabs.css';
import "../styles.css";
import { clearUserSession } from "../utils/session";

const API_URL = process.env.REACT_APP_API_URL || '';



// Estilos para modales centrados
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 3000,
  padding: "20px",
};

const modalContentStyle = {
  background: "#fff",
  borderRadius: "20px",
  boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
  maxHeight: "90vh",
  overflowY: "auto",
  animation: "modalSlideIn 0.3s ease-out",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [vehFilter, setVehFilter] = useState({ marca: "", ano: "", capacidad: "" });
  const [vehFilterStatus, setVehFilterStatus] = useState("todos");
  
  const [usuarios, setUsuarios] = useState([]);
  const [userFilters, setUserFilters] = useState({ id: "", nombre: "", correo: "", cedula: "", telefono: "" });
  
  const [reservaciones, setReservaciones] = useState([]);
  const [resFilter, setResFilter] = useState({ min_monto: "", max_monto: "", idVehiculo: "", idUsuario: "" });
  const [selectedUserReservas, setSelectedUserReservas] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isUserReservasLoading, setIsUserReservasLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Catalog States
  const [listaMarcas, setListaMarcas] = useState([]);
  const [listaModelos, setListaModelos] = useState([]);
  const [listaTipos, setListaTipos] = useState([]);
  const [listaColores, setListaColores] = useState([]);
  const [listaRazones, setListaRazones] = useState([]);

  // Formulario Vehículo
  const [formulario, setFormulario] = useState({
    Marca: "", Modelo: "", Año: "", Tipo: "", Precio: "", Color: "", CapacidadPasajeros: "", imagen: null
  });
  const [resetStep, setResetStep] = useState(0);

  // Formulario Usuario Nuevo
  const [newUserForm, setNewUserForm] = useState({
    Nombre: "", Apellido: "", Correo_Electronico: "", Telefono: "", Cedula: "", Licencia_Conducir: "", Direccion: "", Password: ""
  });
  
  // Estados de modales
  const [vehicleModal, setVehicleModal] = useState({ isOpen: false, mode: 'create', vehicle: null });
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, vehicle: null });
  const [userModal, setUserModal] = useState({ isOpen: false, type: null, userId: null });
  const [selectedReason, setSelectedReason] = useState("");

  const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Mapa de usuarios para mostrar nombres en reservaciones
  const userMap = useMemo(() => {
    const map = {};
    usuarios.forEach(u => {
      map[u.ID_Usuario] = `${u.Nombre} ${u.Apellido}`;
    });
    return map;
  }, [usuarios]);

  // Modelos filtrados por marca seleccionada en formulario
  const modelosFiltrados = useMemo(() => {
    if (!formulario.Marca) return [];
    const marcaObj = listaMarcas.find(m => m.Marca === formulario.Marca);
    if (!marcaObj) return [];
    return listaModelos.filter(m => m.ID_Marca === marcaObj.ID_Marca);
  }, [formulario.Marca, listaMarcas, listaModelos]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        clearUserSession();
        navigate("/login");
        return;
      }

      // Fetch Catalogs in parallel
      const [marcasRes, modelosRes, tiposRes, coloresRes, razonesRes] = await Promise.all([
        fetch(`${API_URL}/api/catalogos/marcas`),
        fetch(`${API_URL}/api/catalogos/modelos`),
        fetch(`${API_URL}/api/catalogos/tipos`),
        fetch(`${API_URL}/api/catalogos/colores`),
        fetch(`${API_URL}/api/catalogos/razones-inactivacion`)
      ]);

      if (marcasRes.ok) setListaMarcas(await marcasRes.json());
      if (modelosRes.ok) setListaModelos(await modelosRes.json());
      if (tiposRes.ok) setListaTipos(await tiposRes.json());
      if (coloresRes.ok) setListaColores(await coloresRes.json());
      if (razonesRes.ok) setListaRazones(await razonesRes.json());

      // Fetch Main Data
      const vehRes = await fetch(`${API_URL}/api/vehiculos`);
      if (!vehRes.ok) throw new Error("Error al cargar vehículos");
      setVehiculos(await vehRes.json() || []);

      const usrRes = await fetch(`${API_URL}/api/usuarios`, {
        headers: authHeaders()
      });
      if (usrRes.status === 401 || usrRes.status === 403) {
        clearUserSession();
        navigate("/login");
        return;
      }
      let usrData = await usrRes.json();
      
      let usersArray = [];
      if (Array.isArray(usrData)) {
        usersArray = usrData;
      } else if (usrData && typeof usrData === 'object' && usrData !== null) {
        if (usrData.error) throw new Error(usrData.error);
        if (Array.isArray(usrData.users)) usersArray = usrData.users;
        else if (Array.isArray(usrData.data)) usersArray = usrData.data;
        else usersArray = Object.values(usrData).filter(v => typeof v === 'object' && v !== null && !Array.isArray(v));
      }
      setUsuarios(usersArray);

      const resRes = await fetch(`${API_URL}/api/reservaciones`, {
        headers: authHeaders()
      });
      if (resRes.status === 401 || resRes.status === 403) {
        clearUserSession();
        navigate("/login");
        return;
      }
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

  // FILTROS
  function handleVehFilterChange(e) {
    const { name, value } = e.target;
    setVehFilter(prev => ({ ...prev, [name]: value }));
  }

  function handleUserFilterChange(e) {
    const { name, value } = e.target;
    setUserFilters(prev => ({ ...prev, [name]: value }));
  }

  function handleResFilterChange(e) {
    const { name, value } = e.target;
    setResFilter(prev => ({ ...prev, [name]: value }));
  }

  const filteredVehiculos = vehiculos.filter(v => 
    (vehFilterStatus === "todos" ? true : vehFilterStatus === "inactivo" ? v.Estado === "inactivo" : v.Estado !== "inactivo") &&
    (vehFilter.marca ? v.Marca.toLowerCase().includes(vehFilter.marca.toLowerCase()) : true) &&
    (vehFilter.ano ? v.Año.toString().includes(vehFilter.ano) : true) &&
    (vehFilter.capacidad ? v.CapacidadPasajeros.toString().includes(vehFilter.capacidad) : true)
  );

  const filteredUsuarios = usuarios.filter(u => 
    (userFilters.id ? u.ID_Usuario.toString().includes(userFilters.id) : true) &&
    (userFilters.nombre ? (u.Nombre + " " + u.Apellido).toLowerCase().includes(userFilters.nombre.toLowerCase()) : true) &&
    (userFilters.correo ? u.Correo_Electronico.toLowerCase().includes(userFilters.correo.toLowerCase()) : true) &&
    (userFilters.cedula ? (u.Cedula || "").includes(userFilters.cedula) : true) &&
    (userFilters.telefono ? (u.Telefono || "").includes(userFilters.telefono) : true)
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

  // HANDLERS FORMULARIOS
  function handleChange(e) {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
    // Si cambia la marca, resetear el modelo
    if (name === 'Marca') {
      setFormulario(prev => ({ ...prev, Modelo: "" }));
    }
  }

  function handleNewUserChange(e) {
    const { name, value } = e.target;
    setNewUserForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    setFormulario((prev) => ({ ...prev, imagen: e.target.files[0] }));
  }

  // --- VEHÍCULOS ---
  function openVehicleModal(mode = 'create', vehicle = null) {
    if (mode === 'edit' && vehicle) {
      setFormulario({
        Marca: vehicle.Marca || "",
        Modelo: vehicle.Modelo || "",
        Año: vehicle.Año || "",
        Tipo: vehicle.Tipo || "",
        Precio: vehicle.Precio || "",
        Color: vehicle.Color || "",
        CapacidadPasajeros: vehicle.CapacidadPasajeros || "",
        imagen: null
      });
    } else {
      setFormulario({ Marca: "", Modelo: "", Año: "", Tipo: "", Precio: "", Color: "", CapacidadPasajeros: "", imagen: null });
    }
    setVehicleModal({ isOpen: true, mode, vehicle });
  }

  function closeVehicleModal() {
    setVehicleModal({ isOpen: false, mode: 'create', vehicle: null });
    setFormulario({ Marca: "", Modelo: "", Año: "", Tipo: "", Precio: "", Color: "", CapacidadPasajeros: "", imagen: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSaveVehicle(e) {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(formulario).forEach(key => {
      if (key !== 'imagen') formData.append(key, formulario[key]);
    });
    if (formulario.imagen) formData.append('imagen', formulario.imagen);
    
    try {
      let url = `${API_URL}/api/vehiculos`;
      let method = 'POST';
      if (vehicleModal.mode === 'edit' && vehicleModal.vehicle) {
        url = `${API_URL}/api/vehiculos/${vehicleModal.vehicle.ID_Vehiculo}`;
        method = 'PUT';
      }
      const res = await fetch(url, {
        method: method,
        headers: authHeaders(),
        body: formData
      });
      if (!res.ok) throw new Error("Error al guardar vehículo");
      
      fetchData();
      closeVehicleModal();
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function handleToggleVehicleStatus(vehicle) {
    const isCurrentlyActive = vehicle.Estado !== 'inactivo';
    if (isCurrentlyActive) {
      setDeactivateModal({ isOpen: true, vehicle });
      setSelectedReason("");
    } else {
      // Activar vehículo
      try {
        const res = await fetch(`${API_URL}/api/vehiculos/${vehicle.ID_Vehiculo}/activate`, {
          method: 'PUT',
          headers: authHeaders()
        });
        if (!res.ok) {
          // Si el endpoint no existe, simular localmente
          console.log("Endpoint activate no existe, simulando localmente");
        }
        fetchData();
      } catch (err) {
        console.error("Error al activar:", err);
        fetchData();
      }
    }
  }

  async function confirmarDesactivacion() {
    if (!selectedReason || !deactivateModal.vehicle) return;
    try {
      const res = await fetch(`${API_URL}/api/vehiculos/${deactivateModal.vehicle.ID_Vehiculo}/deactivate`, {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_razon: selectedReason })
      });
      if (!res.ok) {
        console.log("Endpoint deactivate no existe, simulando localmente");
      }
      setDeactivateModal({ isOpen: false, vehicle: null });
      setSelectedReason("");
      fetchData();
    } catch (err) {
      console.error("Error al desactivar:", err);
      setDeactivateModal({ isOpen: false, vehicle: null });
      fetchData();
    }
  }


  
  // Helper de validación (igual a Register.jsx)
  const validarEmail = (email) => {
    const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com'];
    const partes = email.split('@');
    if (partes.length !== 2) return false;
    const dominio = partes[1]?.toLowerCase();
    return dominios.includes(dominio);
  };

  // --- USUARIOS ---
  async function handleCreateUser(e) {
    e.preventDefault();
    
    // Validaciones básicas (igual a Register.jsx)
    if (newUserForm.Cedula.length !== 11) {
      alert("La cédula debe tener 11 dígitos");
      return;
    }
    if (!validarEmail(newUserForm.Correo_Electronico)) {
      alert("Correo electrónico inválido. Usa un dominio común (gmail.com, hotmail.com, etc.)");
      return;
    }
    if (newUserForm.Password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      // Usando el endpoint correcto: POST /api/usuarios
      const res = await fetch(`${API_URL}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear usuario");
      
      alert("Usuario creado exitosamente");
      fetchData();
      setUserModal({ isOpen: false, type: null, userId: null });
      setNewUserForm({ Nombre: "", Apellido: "", Correo_Electronico: "", Telefono: "", Cedula: "", Licencia_Conducir: "", Direccion: "", Password: "" });
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function handleOpenUserReservas(id) {
    setUserModal({ isOpen: true, type: 'reservations', userId: id });
    setIsUserReservasLoading(true);
    setSelectedUserReservas([]);
    try {
      const res = await fetch(`${API_URL}/api/reservaciones?id_usuario=${id}`, {
        headers: authHeaders()
      });
      if (!res.ok) throw new Error(`Error al cargar reservas del usuario ${id}`);
      const data = await res.json();
      setSelectedUserReservas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSelectedUserReservas([]);
    } finally {
      setIsUserReservasLoading(false);
    }
  }

  // --- RESERVACIONES ---
  async function handleViewPdf(idReservacion) {
    try {
      const res = await fetch(`${API_URL}/api/reservaciones/${idReservacion}/pdf`, {
        method: 'GET',
        headers: { ...authHeaders(), 'Accept': 'application/pdf' }
      });
      if (!res.ok) throw new Error("Error obteniendo PDF");
      const blob = await res.blob();
      if (blob.size === 0) throw new Error("PDF vacío");
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      alert("Error visualizando PDF: " + err.message);
    }
  }

  // --- UTILIDADES ---
  async function handleFullReset() {
    if (resetStep < 3) {
      setResetStep(prev => prev + 1);
    } else {
      try {
        await fetch(`${API_URL}/api/vehiculos/reset-all`, {
          method: 'DELETE',
          headers: authHeaders()
        });
        alert("Base de datos reseteada");
        fetchData();
        setResetStep(0);
      } catch (err) {
        alert("Error reset: " + err.message);
      }
    }
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

  // STYLES
  const tableStyles = { width: '100%', borderCollapse: 'separate', borderSpacing: '0 5px' };
  const thStyles = { padding: '12px', borderBottom: '2px solid #6d28d9', textAlign: 'left', backgroundColor: '#f9f9f9', minWidth: '100px' };
  const tdStyles = { padding: '12px', borderBottom: '1px solid #ddd', maxWidth: '200px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' };
  const inputFilterStyle = { width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' };
  const formInputStyle = { padding: '12px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '0.95rem', width: '100%' };

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

          {/* --- TAB VEHÍCULOS --- */}
          <TabPanel>
            <h3>Gestión de Vehículos</h3>
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => openVehicleModal('create')} 
                style={{ 
                  background: 'linear-gradient(135deg, #6d28d9, #5b21b6)', color: '#fff', border: 'none', 
                  padding: '14px 28px', fontSize: '16px', fontWeight: '600', borderRadius: '12px', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.4)', display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                <span style={{ fontSize: '20px' }}>+</span> Agregar Nuevo Vehículo
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select 
                value={vehFilterStatus} 
                onChange={(e) => setVehFilterStatus(e.target.value)}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '2px solid #6d28d9', fontWeight: 'bold', background: '#f8f4ff' }}
              >
                <option value="todos">Todos los Estados</option>
                <option value="activo">Solo Activos</option>
                <option value="inactivo">Solo Inactivos</option>
              </select>
              <input name="marca" placeholder="Filtrar Marca" onChange={handleVehFilterChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input name="ano" placeholder="Filtrar Año" onChange={handleVehFilterChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100px' }} />
              <input name="capacidad" placeholder="Cap" onChange={handleVehFilterChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '80px' }} />
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {loading ? <p>Cargando vehículos...</p> : filteredVehiculos.length === 0 ? <p>No se encontraron vehículos.</p> : 
                filteredVehiculos.map(v => {
                  const isInactive = v.Estado === 'inactivo';
                  return (
                    <div key={v.ID_Vehiculo} style={{ 
                      border: isInactive ? '2px solid #f59e0b' : '1px solid #e5e7eb', 
                      padding: '16px', borderRadius: '16px', 
                      display: 'flex', flexDirection: 'column', 
                      background: isInactive ? '#fffbeb' : '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img src={v.ImagenUrl || '/assets/placeholder.jpg'} alt={v.Modelo} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '12px' }} />
                        {isInactive && (
                          <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#f59e0b', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>INACTIVO</div>
                        )}
                      </div>
                      <div style={{ flex: 1, marginTop: '12px' }}>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>{v.Marca} {v.Modelo}</h4>
                        {isInactive && v.RazonInactivacion && (
                           <div style={{ fontSize: '12px', color: '#b45309', marginBottom: '6px', fontWeight: 'bold', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                             ⚠️ {v.RazonInactivacion}
                           </div>
                        )}
                        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{v.Año} • {v.Tipo} • {v.CapacidadPasajeros} asientos</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '1.2rem', fontWeight: '700', color: '#6d28d9' }}>${v.Precio}<span style={{ fontSize: '0.9rem', fontWeight: '400' }}>/día</span></p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button onClick={() => openVehicleModal('edit', v)} style={{ flex: 1, background: '#ea580c', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Editar</button>
                        <button onClick={() => handleToggleVehicleStatus(v)} style={{ flex: 1, background: isInactive ? '#16a34a' : '#dc2626', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>{isInactive ? 'Activar' : 'Desactivar'}</button>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            
            <div style={{ marginTop: '40px', padding: '20px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #ef4444' }}>
              <h4 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Zona de Peligro</h4>
              <p style={{ fontSize: '14px', color: '#b91c1c' }}>Opciones avanzadas. Ten cuidado.</p>
              {resetStep === 0 && <button onClick={handleFullReset} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Resetear Base de Datos</button>}
              {resetStep > 0 && <div>
                <p style={{ fontWeight: 'bold', color: '#dc2626' }}>Confirmación {resetStep}/3 requerida. ¿Seguro?</p>
                <button onClick={handleFullReset} style={{ background: '#dc2626', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', marginRight: '10px', cursor: 'pointer' }}>SI, CONTINUAR</button>
                <button onClick={() => setResetStep(0)} style={{ background: '#64748b', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              </div>}
            </div>
          </TabPanel>

          {/* --- TAB USUARIOS --- */}
          <TabPanel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Gestión de Usuarios</h3>
              <button 
                onClick={() => setUserModal({ isOpen: true, type: 'create', userId: null })}
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}
              >
                <span style={{ fontSize: '18px' }}>+</span> Crear Usuario
              </button>
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles}>ID</th>
                    <th style={thStyles}>Nombre Completo</th>
                    <th style={thStyles}>Correo</th>
                    <th style={thStyles}>Cédula</th>
                    <th style={thStyles}>Teléfono</th>
                    <th style={thStyles}>Acciones</th>
                  </tr>
                  <tr style={{ background: '#f8f4ff' }}>
                    <td style={{ padding: '8px' }}><input name="id" placeholder="Buscar..." value={userFilters.id} onChange={handleUserFilterChange} style={inputFilterStyle} /></td>
                    <td style={{ padding: '8px' }}><input name="nombre" placeholder="Buscar..." value={userFilters.nombre} onChange={handleUserFilterChange} style={inputFilterStyle} /></td>
                    <td style={{ padding: '8px' }}><input name="correo" placeholder="Buscar..." value={userFilters.correo} onChange={handleUserFilterChange} style={inputFilterStyle} /></td>
                    <td style={{ padding: '8px' }}><input name="cedula" placeholder="Buscar..." value={userFilters.cedula} onChange={handleUserFilterChange} style={inputFilterStyle} /></td>
                    <td style={{ padding: '8px' }}><input name="telefono" placeholder="Buscar..." value={userFilters.telefono} onChange={handleUserFilterChange} style={inputFilterStyle} /></td>
                    <td style={{ padding: '8px' }}></td>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map(u => (
                    <tr key={u.ID_Usuario} style={{ transition: 'background 0.2s' }}>
                      <td style={tdStyles}>{u.ID_Usuario}</td>
                      <td style={tdStyles}>{u.Nombre} {u.Apellido}</td>
                      <td style={tdStyles}>{u.Correo_Electronico}</td>
                      <td style={tdStyles}>{u.Cedula ? u.Cedula : 'N/A'}</td>
                      <td style={tdStyles}>{u.Telefono}</td>
                      <td style={tdStyles}>
                        <button onClick={() => handleOpenUserReservas(u.ID_Usuario)} style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #6d28d9, #5b21b6)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                          Ver Reservas
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsuarios.length === 0 && <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>No se encontraron usuarios</td></tr>}
                </tbody>
              </table>
            </div>
          </TabPanel>
          
          {/* --- TAB RESERVACIONES --- */}
          <TabPanel>
            <h3>Reservaciones Generales</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <input name="idVehiculo" placeholder="ID Vehículo" onChange={handleResFilterChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <input name="idUsuario" placeholder="ID Usuario" onChange={handleResFilterChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <table style={tableStyles}>
                <thead>
                  <tr>
                    <th style={thStyles}>ID</th>
                    <th style={thStyles}>Vehículo</th>
                    <th style={thStyles}>Usuario</th>
                    <th style={thStyles}>Monto</th>
                    <th style={thStyles}>Fecha</th>
                    <th style={thStyles}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservaciones.map(r => (
                    <tr key={r.ID_Reservacion}>
                      <td style={tdStyles}>{r.ID_Reservacion}</td>
                      <td style={tdStyles}>{r.ID_Vehiculo}</td>
                      <td style={tdStyles}>{userMap[r.ID_Usuario] || `ID: ${r.ID_Usuario}`}</td>
                      <td style={{ ...tdStyles, fontWeight: '600', color: '#16a34a' }}>${r.Monto_Reservacion}</td>
                      <td style={tdStyles}>{formatDate(r.Fecha_Reservacion)}</td>
                      <td style={tdStyles}>
                        <button onClick={() => handleViewPdf(r.ID_Reservacion)} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>📄 PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>
        </Tabs>
      </div>

      {/* --- MODALES CENTRADOS --- */}

      {/* Modal Agregar/Editar Vehículo */}
      {vehicleModal.isOpen && (
        <div style={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && closeVehicleModal()}>
          <div style={{ ...modalContentStyle, maxWidth: '600px', width: '100%' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{vehicleModal.mode === 'edit' ? `Editar Vehículo #${vehicleModal.vehicle?.ID_Vehiculo}` : "Agregar Nuevo Vehículo"}</h3>
              <button onClick={closeVehicleModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>
            <form onSubmit={handleSaveVehicle} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Marca - Dropdown dinámico o input */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Marca *</label>
                  <select 
                    name="Marca" 
                    value={formulario.Marca} 
                    onChange={handleChange} 
                    required 
                    style={formInputStyle} 
                  >
                    <option value="">Seleccionar Marca</option>
                    {listaMarcas.map(m => <option key={m.ID_Marca} value={m.Marca}>{m.Marca}</option>)}
                  </select>
                </div>
                
                {/* Modelo - Dropdown dinámico basado en marca */}
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Modelo *</label>
                  <select 
                    name="Modelo" 
                    value={formulario.Modelo} 
                    onChange={handleChange} 
                    required 
                    style={formInputStyle} 
                    disabled={!formulario.Marca}
                  >
                    <option value="">Seleccionar Modelo</option>
                    {modelosFiltrados.map(m => <option key={m.ID_Modelo} value={m.Modelo}>{m.Modelo}</option>)}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Año *</label>
                  <input name="Año" type="number" placeholder="Ej: 2024" value={formulario.Año} onChange={handleChange} required style={formInputStyle} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Tipo *</label>
                  <select name="Tipo" value={formulario.Tipo} onChange={handleChange} required style={formInputStyle}>
                    <option value="">Seleccionar...</option>
                    {listaTipos.map(t => <option key={t.ID_Tipo} value={t.Tipo}>{t.Tipo}</option>)}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Precio/día ($) *</label>
                  <input name="Precio" type="number" placeholder="Ej: 50" value={formulario.Precio} onChange={handleChange} required style={formInputStyle} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Color</label>
                  <input name="Color" list="colors-list" placeholder="Ej: Rojo" value={formulario.Color} onChange={handleChange} style={formInputStyle} />
                  <datalist id="colors-list">
                    {listaColores.map(c => <option key={c.ID_Color} value={c.Color} />)}
                  </datalist>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Capacidad (pasajeros) *</label>
                  <input name="CapacidadPasajeros" type="number" placeholder="Ej: 5" value={formulario.CapacidadPasajeros} onChange={handleChange} required style={formInputStyle} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Imagen del Vehículo {vehicleModal.mode === 'create' ? '*' : '(opcional)'}</label>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" required={vehicleModal.mode === 'create'} style={{ ...formInputStyle, padding: '10px' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={closeVehicleModal} style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 2, padding: '14px', background: vehicleModal.mode === 'edit' ? '#ea580c' : 'linear-gradient(135deg, #6d28d9, #5b21b6)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)' }}>
                  {vehicleModal.mode === 'edit' ? "Guardar Cambios" : "Agregar Vehículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Desactivar Vehículo */}
      {deactivateModal.isOpen && (
        <div style={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && setDeactivateModal({ isOpen: false, vehicle: null })}>
          <div style={{ ...modalContentStyle, maxWidth: '450px', width: '100%', padding: '28px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
              <h3 style={{ color: '#dc2626', margin: 0 }}>Desactivar Vehículo</h3>
            </div>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '20px' }}>
              ¿Por qué deseas desactivar el <strong>{deactivateModal.vehicle?.Marca} {deactivateModal.vehicle?.Modelo}</strong>?
            </p>
            <select 
              value={selectedReason} 
              onChange={e => setSelectedReason(e.target.value)} 
              style={{ width: '100%', padding: '14px', margin: '0 0 20px 0', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '1rem' }}
            >
              <option value="">-- Seleccionar Razón --</option>
              {listaRazones.map(r => <option key={r.ID_Razon} value={r.ID_Razon}>{r.Nombre_Razon}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeactivateModal({ isOpen: false, vehicle: null })} style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={confirmarDesactivacion} disabled={!selectedReason} style={{ flex: 1, padding: '14px', background: selectedReason ? '#dc2626' : '#ccc', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: selectedReason ? 'pointer' : 'not-allowed' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Usuario (Crear / Ver Reservas) */}
      {userModal.isOpen && (
        <div style={modalOverlayStyle} onClick={(e) => e.target === e.currentTarget && setUserModal({ isOpen: false, type: null, userId: null })}>
          <div style={{ ...modalContentStyle, maxWidth: userModal.type === 'create' ? '550px' : '750px', width: '100%' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>
                {userModal.type === 'create' ? '👤 Crear Nuevo Usuario' : `📋 Reservas del Usuario #${userModal.userId}`}
              </h3>
              <button onClick={() => setUserModal({ isOpen: false, type: null, userId: null })} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              {userModal.type === 'create' && (
                <form onSubmit={handleCreateUser}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Nombre *</label>
                      <input name="Nombre" placeholder="Juan" value={newUserForm.Nombre} onChange={handleNewUserChange} required style={formInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Apellido *</label>
                      <input name="Apellido" placeholder="Pérez" value={newUserForm.Apellido} onChange={handleNewUserChange} required style={formInputStyle} />
                    </div>
                    {/* Nueva Fila: Dirección y Cédula */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Dirección *</label>
                      <input name="Direccion" placeholder="Calle Principal #123" value={newUserForm.Direccion} onChange={handleNewUserChange} required style={formInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Cédula (11 dígitos) *</label>
                      <input name="Cedula" placeholder="00100000000" value={newUserForm.Cedula} onChange={handleNewUserChange} required style={formInputStyle} />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Correo Electrónico *</label>
                      <input name="Correo_Electronico" type="email" placeholder="juan@email.com" value={newUserForm.Correo_Electronico} onChange={handleNewUserChange} required style={formInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Teléfono *</label>
                      <input name="Telefono" placeholder="809-555-1234" value={newUserForm.Telefono} onChange={handleNewUserChange} required style={formInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Licencia *</label>
                      <input name="Licencia_Conducir" placeholder="LIC-123456" value={newUserForm.Licencia_Conducir} onChange={handleNewUserChange} required style={formInputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Contraseña (min 6) *</label>
                      <input name="Password" type="password" placeholder="••••••••" value={newUserForm.Password} onChange={handleNewUserChange} required style={formInputStyle} />
                    </div>
                  </div>
                  <button type="submit" style={{ width: '100%', marginTop: '24px', padding: '14px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)' }}>
                    Crear Usuario
                  </button>
                </form>
              )}

              {userModal.type === 'reservations' && (
                <div>
                  {isUserReservasLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
                      <p>Cargando reservas...</p>
                    </div>
                  ) : selectedUserReservas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
                      <p>Este usuario no tiene reservaciones.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8f4ff' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Vehículo</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Monto</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Fecha</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUserReservas.map(r => (
                          <tr key={r.ID_Reservacion} style={{ borderTop: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px' }}>{r.ID_Reservacion}</td>
                            <td style={{ padding: '12px' }}>{r.ID_Vehiculo}</td>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#16a34a' }}>${r.Monto_Reservacion}</td>
                            <td style={{ padding: '12px' }}>{formatDate(r.Fecha_Reservacion)}</td>
                            <td style={{ padding: '12px' }}>
                              <button onClick={() => handleViewPdf(r.ID_Reservacion)} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>📄 PDF</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </section>
  );
}
