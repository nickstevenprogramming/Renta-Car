import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

// API URL from environment or default to relative path for development
const API_URL = process.env.REACT_APP_API_URL || '';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ Cedula: "", Password: "" });
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ejemplos = {
    Cedula: "Ej: 00112345678 (11 dígitos)",
    Password: "Mínimo 6 caracteres"
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formulario.Cedula.length !== 11 || formulario.Password.length < 6) {
      setError("❌ Cédula debe tener 11 dígitos y contraseña mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formulario),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Store JWT token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Pass user data to parent component
      const userData = data.user || data;
      onLogin(userData);
      
      setExito("✅ Inicio de sesión exitoso. Redirigiendo...");
      setTimeout(() => navigate(userData.esAdmin ? '/admin' : '/'), 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: '500px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#6d28d9', fontSize: '1.8rem' }}>Iniciar Sesión</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
            Cédula <span style={{ color: '#6d28d9' }}>*</span>
          </label>
          <input 
            name="Cedula" 
            value={formulario.Cedula}
            onChange={handleChange}
            placeholder={ejemplos.Cedula}
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
          />
        </div>

        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
            Contraseña <span style={{ color: '#6d28d9' }}>*</span>
          </label>
          <input 
            name="Password" 
            type={showPassword ? "text" : "password"}
            value={formulario.Password}
            onChange={handleChange}
            placeholder={ejemplos.Password}
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '38px', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {showPassword ? "👁️‍🗨️" : "👁️"}
          </button>
        </div>

        {error && <div style={{ color: '#b91c1c', padding: '12px', background: '#fee', borderRadius: '6px', fontWeight: '500' }}>❌ {error}</div>}
        {exito && <div style={{ color: '#2d5a2d', padding: '12px', background: '#e8f5e8', borderRadius: '6px', fontWeight: '500' }}>✅ {exito}</div>}

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            padding: '14px', 
            background: loading ? '#9b7bc9' : '#6d28d9', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: '700',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s'
          }}
        >
          {loading ? "⏳ Ingresando..." : "🔐 Iniciar Sesión"}
        </button>

        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
          ¿No tienes cuenta? <a href="/register" style={{ color: '#6d28d9', fontWeight: '600' }}>Regístrate</a>
        </p>
      </form>
    </section>
  );
}