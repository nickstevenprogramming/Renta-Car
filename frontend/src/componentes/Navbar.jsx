import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import logo from '../assets/logo4.png';

const Navbar = ({ usuario, setUsuario }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-unido">
        <div className="logo" onClick={() => (window.location.href = "/")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="Renta Car Logo" style={{ height: "50px" }} />
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>


          {usuario ? (
            <div className="dropdown profile-container" style={{ position: 'relative' }}>
              <button className="btn-profile" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '8px 16px', 
                borderRadius: '30px', 
                border: '2px solid #ddd', 
                background: '#fff', 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6d28d9, #4f46e5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {usuario.Nombre.charAt(0)}
                </div>
                <span>{usuario.Nombre}</span>
                <span>▼</span>
              </button>
              
              <div className="dropdown-content profile-menu" style={{ 
                position: 'absolute', 
                top: '120%', 
                right: 0, 
                background: '#fff', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)', 
                borderRadius: '12px', 
                padding: '20px', 
                zIndex: 10, 
                minWidth: '250px',
                border: '1px solid #f3f4f6'
              }}>
                <div style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                  <p style={{ margin: '0 0 5px', fontWeight: 'bold', fontSize: '16px' }}>{usuario.Nombre} {usuario.Apellido}</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{usuario.Correo_Electronico}</p>
                </div>
                <div style={{ fontSize: '14px', color: '#444', marginBottom: '15px' }}>
                  <p style={{ marginBottom: '5px' }}><strong>Cédula:</strong> {usuario.Cedula}</p>
                  <p style={{ marginBottom: '5px' }}><strong>Tel:</strong> {usuario.Telefono}</p>
                </div>
                
                {usuario.esAdmin && (
                  <button onClick={() => window.location.href = "/admin"} style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#f3f4f6', color: '#1f2937', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>
                    Dashboard Admin
                  </button>
                )}
                
                <button onClick={handleLogout} style={{ width: '100%', padding: '10px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-contorno" onClick={() => navigate('/login')} style={{ padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold' }}>Iniciar Sesión</button>
              <button className="btn btn-primario" onClick={() => navigate('/register')} style={{ padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold' }}>Registrarse</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;