import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function Register({ onRegister }) {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    Cedula: "", Nombre: "", Apellido: "", Direccion: "", Telefono: "",
    Correo_Electronico: "", Licencia_Conducir: "", Password: "", confirmPassword: ""
  });
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ejemplos = {
    Cedula: "Ej: 00112345678 (11 dígitos)",
    Nombre: "Ej: Nick Steven",
    Apellido: "Ej: Maria Jerez",
    Direccion: "Ej: Calle Principal #123, Santo Domingo",
    Telefono: "Ej: +18095551234",
    Correo_Electronico: "Ej: nick.maria@gmail.com",
    Licencia_Conducir: "Ej: D123456789",
    Password: "Mínimo 6 caracteres"
  };

  const validarEmail = (email) => {
    const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com'];
    const partes = email.split('@');
    if (partes.length !== 2) return false;
    const dominio = partes[1]?.toLowerCase();
    return dominios.includes(dominio);
  };

  const validarCedula = (cedula) => {
    const limpia = cedula.replace(/\D/g, '');
    return limpia.length === 11;
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

    if (!validarCedula(formulario.Cedula)) {
      setError("❌ Cédula inválida. Debe tener 11 dígitos");
      setLoading(false);
      return;
    }

    if (!validarEmail(formulario.Correo_Electronico)) {
      setError("❌ Correo electrónico inválido. Usa un dominio común (gmail.com, hotmail.com, etc.)");
      setLoading(false);
      return;
    }

    if (formulario.Password.length < 6) {
      setError("❌ La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (formulario.Password !== formulario.confirmPassword) {
      setError("❌ Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    const payload = { ...formulario, esAdmin: 0 };
    delete payload.confirmPassword;

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onRegister(data);
      setExito("✅ Cuenta creada con éxito. Redirigiendo al inicio...");
      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: '500px', margin: '40px auto', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#6d28d9', fontSize: '1.8rem' }}>Crear Cuenta</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
        {/* Primera fila: Cédula y Nombre */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
              Nombre <span style={{ color: '#6d28d9' }}>*</span>
            </label>
            <input 
              name="Nombre" 
              value={formulario.Nombre}
              onChange={handleChange}
              placeholder={ejemplos.Nombre} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
            />
          </div>
        </div>

        {/* Segunda fila: Apellido y Teléfono */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
              Apellido <span style={{ color: '#6d28d9' }}>*</span>
            </label>
            <input 
              name="Apellido" 
              value={formulario.Apellido}
              onChange={handleChange}
              placeholder={ejemplos.Apellido} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
              Teléfono <span style={{ color: '#6d28d9' }}>*</span>
            </label>
            <input 
              name="Telefono" 
              value={formulario.Telefono}
              onChange={handleChange}
              placeholder={ejemplos.Telefono} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
            />
          </div>
        </div>

        {/* Tercera fila: Dirección (ocupa todo el ancho) */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
            Dirección <span style={{ color: '#6d28d9' }}>*</span>
          </label>
          <input 
            name="Direccion" 
            value={formulario.Direccion}
            onChange={handleChange}
            placeholder={ejemplos.Direccion} 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
          />
        </div>

        {/* Cuarta fila: Correo (ocupa todo el ancho) */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
            Correo Electrónico <span style={{ color: '#6d28d9' }}>*</span>
          </label>
          <input 
            name="Correo_Electronico" 
            type="email"
            value={formulario.Correo_Electronico}
            onChange={handleChange}
            placeholder={ejemplos.Correo_Electronico} 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
          />
        </div>

        {/* Quinta fila: Licencia (ocupa todo el ancho) */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
            Licencia de Conducir <span style={{ color: '#6d28d9' }}>*</span>
          </label>
          <input 
            name="Licencia_Conducir" 
            value={formulario.Licencia_Conducir}
            onChange={handleChange}
            placeholder={ejemplos.Licencia_Conducir} 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
          />
        </div>

        {/* Sexta fila: Contraseña y Confirmar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#0f172a' }}>
              Confirmar Contraseña <span style={{ color: '#6d28d9' }}>*</span>
            </label>
            <input 
              name="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"}
              value={formulario.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #e6eef6', fontSize: '14px' }} 
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
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
              {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
            </button>
          </div>
        </div>

        {/* Mensajes de error/éxito */}
        {error && <div style={{ color: '#b91c1c', padding: '12px', background: '#fee', borderRadius: '6px', fontWeight: '500' }}>❌ {error}</div>}
        {exito && <div style={{ color: '#2d5a2d', padding: '12px', background: '#e8f5e8', borderRadius: '6px', fontWeight: '500' }}>✅ {exito}</div>}

        {/* Botón submit */}
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
          {loading ? "⏳ Creando cuenta..." : "🚀 Crear Cuenta"}
        </button>

        <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
          ¿Ya tienes cuenta? <a href="/login" style={{ color: '#6d28d9', fontWeight: '600' }}>Inicia sesión</a>
        </p>
      </form>
    </section>
  );
}