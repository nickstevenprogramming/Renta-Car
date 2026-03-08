-- ============================================
-- MIGRACIONES DE BASE DE DATOS: RENTA-CAR
-- Archivo: 004_crear_tablas_faltantes.sql
-- ============================================

-- ============================================
-- PASO 1: Tabla SUCURSALES (Ubicaciones)
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Sucursales' AND xtype='U')
BEGIN
    CREATE TABLE Sucursales (
        ID_Sucursal INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL UNIQUE,
        Direccion NVARCHAR(200) NULL,
        Activo BIT DEFAULT 1
    );
    PRINT 'Tabla Sucursales creada.';

    -- Seed Data (from hardcoded values)
    INSERT INTO Sucursales (Nombre) VALUES 
    ('Aeropuerto Las Américas, Santo Domingo'),
    ('Aeropuerto Cibao, Santiago'),
    ('Punta Cana Centro'),
    ('Santo Domingo Centro'),
    ('Punta Cana Bavaro'),
    ('Santo Domingo Zona Colonial'),
    ('Punta Cana Uvero Alto');
    PRINT 'Datos de Sucursales insertados.';
END

-- ============================================
-- PASO 2: Tabla EXTRAS
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Extras' AND xtype='U')
BEGIN
    CREATE TABLE Extras (
        ID_Extra INT IDENTITY(1,1) PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL UNIQUE,
        Precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        Icono NVARCHAR(50) NULL, -- Emoji or icon class
        Activo BIT DEFAULT 1
    );
    PRINT 'Tabla Extras creada.';

    -- Seed Data (from hardcoded values)
    INSERT INTO Extras (Nombre, Precio, Icono) VALUES 
    ('Asiento de Bebé', 15.00, '🍼'),
    ('GPS Navegador', 10.00, '📍'),
    ('Seguro Premium', 20.00, '🛡️'),
    ('Conductor Adicional', 25.00, '👤');
    PRINT 'Datos de Extras insertados.';
END

-- ============================================
-- PASO 3: Tabla ROLES y USUARIOS_ROLES
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Roles' AND xtype='U')
BEGIN
    CREATE TABLE Roles (
        ID_Rol INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Rol NVARCHAR(50) NOT NULL UNIQUE
    );
    INSERT INTO Roles (Nombre_Rol) VALUES ('Admin'), ('Cliente'), ('Empleado');
    PRINT 'Tabla Roles creada.';
END

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

-- ============================================
-- PASO 4: Tabla ESTADOS_RESERVA y PAGOS
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstadosReserva' AND xtype='U')
BEGIN
    CREATE TABLE EstadosReserva (
        ID_Estado INT IDENTITY(1,1) PRIMARY KEY,
        Nombre_Estado NVARCHAR(50) NOT NULL UNIQUE
    );
    INSERT INTO EstadosReserva (Nombre_Estado) VALUES ('Pendiente'), ('Confirmada'), ('En Curso'), ('Finalizada'), ('Cancelada');
    PRINT 'Tabla EstadosReserva creada.';
END

-- Agregar columna ID_Estado a RESERVACIONES si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('RESERVACIONES') AND name = 'ID_Estado')
BEGIN
    ALTER TABLE RESERVACIONES ADD ID_Estado INT DEFAULT 1; 
    -- 1 = Pendiente
    ALTER TABLE RESERVACIONES ADD CONSTRAINT FK_Reservas_Estados FOREIGN KEY (ID_Estado) REFERENCES EstadosReserva(ID_Estado);
    PRINT 'Columna ID_Estado agregada a RESERVACIONES.';
END

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Pagos' AND xtype='U')
BEGIN
    CREATE TABLE Pagos (
        ID_Pago INT IDENTITY(1,1) PRIMARY KEY,
        ID_Reservacion INT NOT NULL,
        Monto DECIMAL(10,2) NOT NULL,
        Metodo_Pago NVARCHAR(50) NULL, -- Tarjeta, Efectivo, Transferencia
        Estado_Pago NVARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, Pagado, Reembolsado
        Fecha_Pago DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (ID_Reservacion) REFERENCES RESERVACIONES(ID_Reservacion) ON DELETE CASCADE
    );
    PRINT 'Tabla Pagos creada.';
END

-- ============================================
-- PASO 5: Tabla MANTENIMIENTOS
-- ============================================
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
