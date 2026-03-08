# Renta-Car

Aplicación web completa para la gestión y renta de vehículos, construida con una arquitectura moderna de Frontend y Backend separados.

## 🚀 Tecnologías Utilizadas

### Frontend

- **React**: Biblioteca principal para la interfaz de usuario.
- **Tailwind CSS**: Framework de utilidad para el diseño y estilos.
- **React Router**: Para el manejo de rutas y navegación.
- **React Icons**: Colección de íconos populares.

### Backend

- **Python**: Lenguaje principal del servidor.
- **Flask**: Framework web ligero para crear la API.
- **SQL Server**: Base de datos relacional.

## 🗄️ Esquema de Base de Datos

El sistema utiliza una base de datos relacional normalizada. A continuación se describen las tablas principales:

### Tablas Principales

- **VEHICULOS**: Tabla central que almacena la flota de vehículos.
  - Se relaciona con catálogos para Marca, Modelo, Tipo y Color.
  - Maneja el estado del vehículo (`activo`, `inactivo`, etc.) y razones de baja.

### Catálogos (Tablas Normalizadas)

- **Marcas**: Listado de fabricantes de vehículos.
- **Modelos**: Modelos específicos asociados a una marca.
- **Tipos**: Categorías de vehículos (e.g., Sedán, SUV).
- **Colores**: Catálogo de colores disponibles.
- **RazonesInactivacion**: Motivos estandarizados para dar de baja o suspender un vehículo (e.g., Mantenimiento, Vendido).

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js** (v14 o superior) y **npm**
- **Python** (v3.8 o superior)
- **Git**

## 🛠️ Instalación y Configuración

Sigue estos pasos para configurar el proyecto localmente.

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd renta-car
```

### 2. Configurar el Backend

Navega al directorio del backend:

```bash
cd backend
```

Se recomienda usar un entorno virtual:

```bash
# Crear entorno virtual (Windows)
python -m venv .venv

# Activar entorno virtual (Windows)
.venv\Scripts\activate
```

Instala las dependencias (si existe `requirements.txt`):

```bash
pip install -r requirements.txt
```

_Si no existe un archivo de requerimientos, asegúrate de tener instalados Flask y otras librerías necesarias._

### 3. Configurar el Frontend

Navega al directorio del frontend:

```bash
cd ../frontend
```

Instala las dependencias de Node.js:

```bash
npm install
```

## ▶️ Ejecución de la Aplicación

Debes correr el backend y el frontend simultáneamente en terminales separadas.

### Iniciar el Backend

Desde la carpeta `backend` (con el entorno virtual activado):

```bash
python arranque.py
```

El servidor usualmente correrá en `http://127.0.0.1:5000`.

### Iniciar el Frontend

Desde la carpeta `frontend`:

```bash
npm start
```

La aplicación se abrirá en tu navegador, generalmente en `http://localhost:3000`.

## 📂 Estructura del Proyecto

```
renta-car/
├── backend/            # Lógica del servidor y API (Flask)
│   ├── app/            # Aplicación principal
│   ├── arranque.py     # Punto de entrada del servidor
│   └── ...
├── frontend/           # Interfaz de usuario (React)
│   ├── src/            # Código fuente de React
│   ├── public/         # Archivos estáticos
│   └── package.json    # Configuración de dependencias JS
└── README.md           # Documentación del proyecto
```

## ✨ Características Principales

- Catálogo de vehículos con filtrado.
- Sistema de reservas.
- Panel de administración (Dashboard).
- Gestión de usuarios y vehículos.

## 🚢 Deploy Producción

Para despliegue estable con **Frontend en Vercel + Backend externo**, sigue:

- `DEPLOY_VERCEL_BACKEND_EXTERNAL.md`

Incluye:

- Variables obligatorias por entorno.
- Configuración de Vercel.
- CORS backend para dominio Vercel.
- Smoke test post-deploy.
