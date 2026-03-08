-- ============================================
-- MIGRACIONES DE BASE DE DATOS: RENTA-CAR
-- Archivo: 001_crear_tablas_normalizadas.sql
-- ============================================

-- ============================================
-- PASO 1: Crear tablas normalizadas de catálogos
-- ============================================

-- Tabla de Marcas
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Marcas' AND xtype='U')
BEGIN
    CREATE TABLE Marcas (
        ID_Marca INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Marca NVARCHAR(100) NOT NULL UNIQUE,
        Fecha_Creacion DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabla Marcas creada exitosamente.';
END
ELSE
    PRINT 'Tabla Marcas ya existe.';

-- Tabla de Modelos (relacionada con Marcas)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Modelos' AND xtype='U')
BEGIN
    CREATE TABLE Modelos (
        ID_Modelo INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Modelo NVARCHAR(100) NOT NULL,
        ID_Marca INT NOT NULL,
        Fecha_Creacion DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (ID_Marca) REFERENCES Marcas(ID_Marca),
        CONSTRAINT UQ_Modelo_Marca UNIQUE (Nombre_Modelo, ID_Marca)
    );
    PRINT 'Tabla Modelos creada exitosamente.';
END
ELSE
    PRINT 'Tabla Modelos ya existe.';

-- Tabla de Tipos de Vehículo
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tipos' AND xtype='U')
BEGIN
    CREATE TABLE Tipos (
        ID_Tipo INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Tipo NVARCHAR(50) NOT NULL UNIQUE
    );
    PRINT 'Tabla Tipos creada exitosamente.';
END
ELSE
    PRINT 'Tabla Tipos ya existe.';

-- Tabla de Colores
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Colores' AND xtype='U')
BEGIN
    CREATE TABLE Colores (
        ID_Color INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Color NVARCHAR(50) NOT NULL UNIQUE
    );
    PRINT 'Tabla Colores creada exitosamente.';
END
ELSE
    PRINT 'Tabla Colores ya existe.';

-- Tabla de Razones de Inactivación
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RazonesInactivacion' AND xtype='U')
BEGIN
    CREATE TABLE RazonesInactivacion (
        ID_Razon INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Razon NVARCHAR(100) NOT NULL UNIQUE
    );
    PRINT 'Tabla RazonesInactivacion creada exitosamente.';
    
    -- Insertar razones predefinidas
    INSERT INTO RazonesInactivacion (Nombre_Razon) VALUES 
        ('En mantenimiento'),
        ('Vendido'),
        ('Dañado'),
        ('Fuera de servicio'),
        ('Reservado temporalmente');
    PRINT 'Razones de inactivación insertadas.';
END
ELSE
    PRINT 'Tabla RazonesInactivacion ya existe.';

GO
