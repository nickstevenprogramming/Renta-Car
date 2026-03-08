-- ============================================
-- RENTA-CAR: Script SQL Consolidado
-- Generado: 2026-02-08
-- Compatible: SQL Server, Azure SQL, Railway
-- ============================================

-- ============================================
-- SECCIÓN 1: TABLAS BASE (sin dependencias)
-- ============================================

-- 1.1 Tabla USUARIOS (asumida pre-existente, aquí para referencia)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='USUARIOS' AND xtype='U')
BEGIN
    CREATE TABLE USUARIOS (
        ID_Usuario INT IDENTITY(1,1) PRIMARY KEY,
        Cedula NVARCHAR(20) NOT NULL UNIQUE,
        Nombre NVARCHAR(100) NOT NULL,
        Apellido NVARCHAR(100) NOT NULL,
        Direccion NVARCHAR(200) NULL,
        Telefono NVARCHAR(20) NOT NULL UNIQUE,
        Correo_Electronico NVARCHAR(150) NOT NULL UNIQUE,
        Licencia_Conducir NVARCHAR(50) NULL UNIQUE,
        Password NVARCHAR(256) NOT NULL,
        esAdmin BIT DEFAULT 0,
        Fecha_Creacion DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabla USUARIOS creada.';
END

-- 1.2 Tabla Marcas
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Marcas' AND xtype='U')
BEGIN
    CREATE TABLE Marcas (
        ID_Marca INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Marca NVARCHAR(100) NOT NULL UNIQUE,
        Fecha_Creacion DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabla Marcas creada.';
END

-- 1.3 Tabla Tipos
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Tipos' AND xtype='U')
BEGIN
    CREATE TABLE Tipos (
        ID_Tipo INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Tipo NVARCHAR(50) NOT NULL UNIQUE
    );
    PRINT 'Tabla Tipos creada.';
END

-- 1.4 Tabla Colores
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Colores' AND xtype='U')
BEGIN
    CREATE TABLE Colores (
        ID_Color INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Color NVARCHAR(50) NOT NULL UNIQUE
    );
    PRINT 'Tabla Colores creada.';
END

-- 1.5 Tabla RazonesInactivacion
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RazonesInactivacion' AND xtype='U')
BEGIN
    CREATE TABLE RazonesInactivacion (
        ID_Razon INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Razon NVARCHAR(100) NOT NULL UNIQUE
    );
    PRINT 'Tabla RazonesInactivacion creada.';
    
    INSERT INTO RazonesInactivacion (Nombre_Razon) VALUES 
        ('En mantenimiento'),
        ('Vendido'),
        (N'Dañado'),
        ('Fuera de servicio'),
        ('Reservado temporalmente');
END

-- 1.6 Tabla Roles
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Roles' AND xtype='U')
BEGIN
    CREATE TABLE Roles (
        ID_Rol INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Rol NVARCHAR(50) NOT NULL UNIQUE
    );
    INSERT INTO Roles (Nombre_Rol) VALUES ('Admin'), ('Cliente'), ('Empleado');
    PRINT 'Tabla Roles creada.';
END

-- 1.7 Tabla EstadosReserva
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstadosReserva' AND xtype='U')
BEGIN
    CREATE TABLE EstadosReserva (
        ID_Estado INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Estado NVARCHAR(50) NOT NULL UNIQUE
    );
    INSERT INTO EstadosReserva (Nombre_Estado) VALUES 
        ('Pendiente'), ('Confirmada'), ('En Curso'), ('Finalizada'), ('Cancelada');
    PRINT 'Tabla EstadosReserva creada.';
END

-- 1.8 Tabla Sucursales
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Sucursales' AND xtype='U')
BEGIN
    CREATE TABLE Sucursales (
        ID_Sucursal INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL UNIQUE,
        Direccion NVARCHAR(200) NULL,
        Activo BIT DEFAULT 1
    );
    PRINT 'Tabla Sucursales creada.';

    INSERT INTO Sucursales (Nombre) VALUES 
        (N'Aeropuerto Las Américas, Santo Domingo'),
        ('Aeropuerto Cibao, Santiago'),
        ('Punta Cana Centro'),
        ('Santo Domingo Centro'),
        ('Punta Cana Bavaro'),
        ('Santo Domingo Zona Colonial'),
        ('Punta Cana Uvero Alto');
END

-- 1.9 Tabla Extras
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Extras' AND xtype='U')
BEGIN
    CREATE TABLE Extras (
        ID_Extra INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL UNIQUE,
        Precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        Icono NVARCHAR(50) NULL,
        Activo BIT DEFAULT 1
    );
    PRINT 'Tabla Extras creada.';

    INSERT INTO Extras (Nombre, Precio, Icono) VALUES 
        (N'Asiento de Bebé', 15.00, N'🍼'),
        ('GPS Navegador', 10.00, N'📍'),
        ('Seguro Premium', 20.00, N'🛡️'),
        ('Conductor Adicional', 25.00, N'👤');
END
GO

-- ============================================
-- SECCIÓN 2: TABLAS CON DEPENDENCIAS NIVEL 1
-- ============================================

-- 2.1 Tabla Modelos (depende de Marcas)
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
    PRINT 'Tabla Modelos creada.';
END

-- 2.2 Tabla Usuario_Roles (depende de USUARIOS, Roles)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Usuario_Roles' AND xtype='U')
BEGIN
    CREATE TABLE Usuario_Roles (
        ID_Usuario INT NOT NULL,
        ID_Rol INT NOT NULL,
        PRIMARY KEY (ID_Usuario, ID_Rol),
        FOREIGN KEY (ID_Usuario) REFERENCES USUARIOS(ID_Usuario) ON DELETE CASCADE,
        FOREIGN KEY (ID_Rol) REFERENCES Roles(ID_Rol) ON DELETE CASCADE
    );
    PRINT 'Tabla Usuario_Roles creada.';
END
GO

-- ============================================
-- SECCIÓN 3: TABLA VEHICULOS
-- ============================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='VEHICULOS' AND xtype='U')
BEGIN
    CREATE TABLE VEHICULOS (
        ID_Vehiculo INT IDENTITY(1,1) PRIMARY KEY,
        Marca NVARCHAR(100) NOT NULL,
        Modelo NVARCHAR(100) NOT NULL,
        [Año] INT NOT NULL,
        Tipo NVARCHAR(50) NOT NULL,
        Precio DECIMAL(10,2) NOT NULL,
        Color NVARCHAR(50) NULL,
        CapacidadPasajeros INT NULL,
        ImagenUrl NVARCHAR(500) NULL,
        Estado NVARCHAR(20) DEFAULT 'activo' NOT NULL,
        ID_RazonInactivacion INT NULL,
        Fecha_Inactivacion DATETIME NULL,
        ID_Marca_FK INT NULL,
        ID_Modelo_FK INT NULL,
        ID_Tipo_FK INT NULL,
        ID_Color_FK INT NULL,
        CONSTRAINT FK_Vehiculos_Razones FOREIGN KEY (ID_RazonInactivacion) REFERENCES RazonesInactivacion(ID_Razon),
        CONSTRAINT FK_Vehiculos_Marcas FOREIGN KEY (ID_Marca_FK) REFERENCES Marcas(ID_Marca),
        CONSTRAINT FK_Vehiculos_Modelos FOREIGN KEY (ID_Modelo_FK) REFERENCES Modelos(ID_Modelo),
        CONSTRAINT FK_Vehiculos_Tipos FOREIGN KEY (ID_Tipo_FK) REFERENCES Tipos(ID_Tipo),
        CONSTRAINT FK_Vehiculos_Colores FOREIGN KEY (ID_Color_FK) REFERENCES Colores(ID_Color)
    );
    PRINT 'Tabla VEHICULOS creada.';
END
ELSE
BEGIN
    -- Agregar columnas si no existen (para bases existentes)
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'Estado')
        ALTER TABLE VEHICULOS ADD Estado NVARCHAR(20) DEFAULT 'activo' NOT NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_RazonInactivacion')
        ALTER TABLE VEHICULOS ADD ID_RazonInactivacion INT NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'Fecha_Inactivacion')
        ALTER TABLE VEHICULOS ADD Fecha_Inactivacion DATETIME NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_Marca_FK')
        ALTER TABLE VEHICULOS ADD ID_Marca_FK INT NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_Modelo_FK')
        ALTER TABLE VEHICULOS ADD ID_Modelo_FK INT NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_Tipo_FK')
        ALTER TABLE VEHICULOS ADD ID_Tipo_FK INT NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_Color_FK')
        ALTER TABLE VEHICULOS ADD ID_Color_FK INT NULL;
END
GO

-- ============================================
-- SECCIÓN 4: TABLA RESERVACIONES
-- ============================================

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RESERVACIONES' AND xtype='U')
BEGIN
    CREATE TABLE RESERVACIONES (
        ID_Reservacion INT IDENTITY(1,1) PRIMARY KEY,
        ID_Vehiculo INT NOT NULL,
        ID_Usuario INT NOT NULL,
        Monto_Reservacion DECIMAL(10,2) NOT NULL,
        Fecha_Reservacion DATETIME DEFAULT GETDATE(),
        Ubicacion_Entrega NVARCHAR(200) NULL,
        Ubicacion_Devolucion NVARCHAR(200) NULL,
        Fecha_Recogida DATETIME NULL,
        Fecha_Devolucion DATETIME NULL,
        ID_Estado INT DEFAULT 1,
        FOREIGN KEY (ID_Vehiculo) REFERENCES VEHICULOS(ID_Vehiculo),
        FOREIGN KEY (ID_Usuario) REFERENCES USUARIOS(ID_Usuario),
        FOREIGN KEY (ID_Estado) REFERENCES EstadosReserva(ID_Estado)
    );
    PRINT 'Tabla RESERVACIONES creada.';
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('RESERVACIONES') AND name = 'ID_Estado')
    BEGIN
        ALTER TABLE RESERVACIONES ADD ID_Estado INT DEFAULT 1;
        ALTER TABLE RESERVACIONES ADD CONSTRAINT FK_Reservas_Estados FOREIGN KEY (ID_Estado) REFERENCES EstadosReserva(ID_Estado);
    END
END
GO

-- ============================================
-- SECCIÓN 5: TABLAS DEPENDIENTES
-- ============================================

-- 5.1 Tabla Pagos (depende de RESERVACIONES)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Pagos' AND xtype='U')
BEGIN
    CREATE TABLE Pagos (
        ID_Pago INT IDENTITY(1,1) PRIMARY KEY,
        ID_Reservacion INT NOT NULL,
        Monto DECIMAL(10,2) NOT NULL,
        Metodo_Pago NVARCHAR(50) NULL,
        Estado_Pago NVARCHAR(50) DEFAULT 'Pendiente',
        Fecha_Pago DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (ID_Reservacion) REFERENCES RESERVACIONES(ID_Reservacion) ON DELETE CASCADE
    );
    PRINT 'Tabla Pagos creada.';
END

-- 5.2 Tabla Mantenimientos (depende de VEHICULOS)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Mantenimientos' AND xtype='U')
BEGIN
    CREATE TABLE Mantenimientos (
        ID_Mantenimiento INT IDENTITY(1,1) PRIMARY KEY,
        ID_Vehiculo INT NOT NULL,
        Descripcion NVARCHAR(MAX) NULL,
        Costo DECIMAL(10,2) DEFAULT 0,
        Fecha_Inicio DATETIME DEFAULT GETDATE(),
        Fecha_Fin DATETIME NULL,
        Estado NVARCHAR(50) DEFAULT 'En Progreso',
        FOREIGN KEY (ID_Vehiculo) REFERENCES VEHICULOS(ID_Vehiculo)
    );
    PRINT 'Tabla Mantenimientos creada.';
END
GO

-- ============================================
-- FIN DEL SCRIPT CONSOLIDADO
-- ============================================
PRINT '========================================';
PRINT 'Script de migración completado.';
PRINT 'Tablas creadas: USUARIOS, Marcas, Modelos, Tipos, Colores,';
PRINT 'RazonesInactivacion, VEHICULOS, RESERVACIONES, Sucursales,';
PRINT 'Extras, Roles, Usuario_Roles, EstadosReserva, Pagos, Mantenimientos';
PRINT '========================================';
