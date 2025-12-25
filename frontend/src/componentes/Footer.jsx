import React from "react";
import { FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";
import "../styles.css";

const Footer = () => {
    return (
        <footer className="footer" style={{ background: '#1f2937', color: '#fff', padding: '60px 0 20px' }}>
            <div className="contenedor" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px', textAlign: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '24px', marginBottom: '20px', color: '#818cf8' }}>RentaCar</h3>
                    <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                        La mejor experiencia de alquiler de vehículos. 
                        Viaja seguro, cómodo y con estilo.
                    </p>
                </div>
                
                <div>
                    <h4 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #4b5563', paddingBottom: '10px', display: 'inline-block' }}>Contacto</h4>
                    <ul style={{ listStyle: 'none', padding: 0, color: '#d1d5db', lineHeight: '2' }}>
                        <li>📍 Av. Venezuela, Santo Domingo Este</li>
                        <li>📞 +1 (829) 835-4979</li>
                        <li>💬 WhatsApp: +1 (829) 835-4979</li>
                        <li>✉️ contacto@rentacar.do</li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #4b5563', paddingBottom: '10px', display: 'inline-block' }}>Síguenos</h4>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <a href="#!" style={{ color: '#fff', fontSize: '24px', textDecoration: 'none' }}><FaInstagram /></a>
                        <a href="#!" style={{ color: '#fff', fontSize: '24px', textDecoration: 'none' }}><FaFacebook /></a>
                        <a href="#!" style={{ color: '#fff', fontSize: '24px', textDecoration: 'none' }}><FaTwitter /></a>
                    </div>
                </div>
            </div>
            
            <div style={{ borderTop: '1px solid #374151', paddingTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                <p>&copy; 2025 Renta Car. Todos los derechos reservados.</p>
                <div className="footer-links" style={{ justifyContent: 'center', fontSize: '14px' }}>
                    <a href="#!" style={{ color: '#9ca3af' }}>Política de privacidad</a>
                    <span style={{ margin: '0 10px' }}>|</span>
                    <a href="#!" style={{ color: '#9ca3af' }}>Términos de servicio</a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;