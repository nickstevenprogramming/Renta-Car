-- ============================================
-- MIGRACIONES DE BASE DE DATOS: RENTA-CAR
-- Archivo: 003_modificar_tabla_vehiculos.sql
-- ============================================

-- ============================================
-- PASO 3: Agregar columnas FK y Estado a VEHICULOS
-- ============================================

-- Agregar columna Estado si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'Estado')
BEGIN
    ALTER TABLE VEHICULOS ADD Estado NVARCHAR(20) DEFAULT 'activo' NOT NULL;
    PRINT 'Columna Estado agregada.';
END
ELSE
    PRINT 'Columna Estado ya existe.';

-- Agregar columna ID_RazonInactivacion si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_RazonInactivacion')
BEGIN
    ALTER TABLE VEHICULOS ADD ID_RazonInactivacion INT NULL;
    PRINT 'Columna ID_RazonInactivacion agregada.';
END
ELSE
    PRINT 'Columna ID_RazonInactivacion ya existe.';

-- Agregar columna Fecha_Inactivacion si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'Fecha_Inactivacion')
BEGIN
    ALTER TABLE VEHICULOS ADD Fecha_Inactivacion DATETIME NULL;
    PRINT 'Columna Fecha_Inactivacion agregada.';
END
ELSE
    PRINT 'Columna Fecha_Inactivacion ya existe.';

-- Agregar columna ID_Marca_FK si no existe (para FK, mantener Marca texto por ahora)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_Marca_FK')
BEGIN
    ALTER TABLE VEHICULOS ADD ID_Marca_FK INT NULL;
    PRINT 'Columna ID_Marca_FK agregada.';
END
ELSE
    PRINT 'Columna ID_Marca_FK ya existe.';

-- Agregar columna ID_Modelo_FK si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_Modelo_FK')
BEGIN
    ALTER TABLE VEHICULOS ADD ID_Modelo_FK INT NULL;
    PRINT 'Columna ID_Modelo_FK agregada.';
END
ELSE
    PRINT 'Columna ID_Modelo_FK ya existe.';

-- Agregar columna ID_Tipo_FK si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_Tipo_FK')
BEGIN
    ALTER TABLE VEHICULOS ADD ID_Tipo_FK INT NULL;
    PRINT 'Columna ID_Tipo_FK agregada.';
END
ELSE
    PRINT 'Columna ID_Tipo_FK ya existe.';

-- Agregar columna ID_Color_FK si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('VEHICULOS') AND name = 'ID_Color_FK')
BEGIN
    ALTER TABLE VEHICULOS ADD ID_Color_FK INT NULL;
    PRINT 'Columna ID_Color_FK agregada.';
END
ELSE
    PRINT 'Columna ID_Color_FK ya existe.';

GO

-- ============================================
-- PASO 4: Crear Foreign Keys
-- ============================================

-- FK para RazonesInactivacion
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Vehiculos_Razones')
BEGIN
    ALTER TABLE VEHICULOS ADD CONSTRAINT FK_Vehiculos_Razones 
        FOREIGN KEY (ID_RazonInactivacion) REFERENCES RazonesInactivacion(ID_Razon);
    PRINT 'FK_Vehiculos_Razones creada.';
END

-- FK para Marcas
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Vehiculos_Marcas')
BEGIN
    ALTER TABLE VEHICULOS ADD CONSTRAINT FK_Vehiculos_Marcas 
        FOREIGN KEY (ID_Marca_FK) REFERENCES Marcas(ID_Marca);
    PRINT 'FK_Vehiculos_Marcas creada.';
END

-- FK para Modelos
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Vehiculos_Modelos')
BEGIN
    ALTER TABLE VEHICULOS ADD CONSTRAINT FK_Vehiculos_Modelos 
        FOREIGN KEY (ID_Modelo_FK) REFERENCES Modelos(ID_Modelo);
    PRINT 'FK_Vehiculos_Modelos creada.';
END

-- FK para Tipos
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Vehiculos_Tipos')
BEGIN
    ALTER TABLE VEHICULOS ADD CONSTRAINT FK_Vehiculos_Tipos 
        FOREIGN KEY (ID_Tipo_FK) REFERENCES Tipos(ID_Tipo);
    PRINT 'FK_Vehiculos_Tipos creada.';
END

-- FK para Colores
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Vehiculos_Colores')
BEGIN
    ALTER TABLE VEHICULOS ADD CONSTRAINT FK_Vehiculos_Colores 
        FOREIGN KEY (ID_Color_FK) REFERENCES Colores(ID_Color);
    PRINT 'FK_Vehiculos_Colores creada.';
END

GO

-- ============================================
-- PASO 5: Poblar las nuevas columnas FK
-- ============================================

-- Actualizar ID_Marca_FK basado en texto Marca
PRINT 'Actualizando IDs de marcas en vehiculos...';
UPDATE v
SET v.ID_Marca_FK = m.ID_Marca
FROM VEHICULOS v
JOIN Marcas m ON LTRIM(RTRIM(v.Marca)) = m.Nombre_Marca
WHERE v.ID_Marca_FK IS NULL;

PRINT CONCAT('Marcas actualizadas: ', @@ROWCOUNT);

-- Actualizar ID_Modelo_FK basado en texto Modelo y Marca
PRINT 'Actualizando IDs de modelos en vehiculos...';
UPDATE v
SET v.ID_Modelo_FK = mo.ID_Modelo
FROM VEHICULOS v
JOIN Marcas ma ON LTRIM(RTRIM(v.Marca)) = ma.Nombre_Marca
JOIN Modelos mo ON LTRIM(RTRIM(v.Modelo)) = mo.Nombre_Modelo AND mo.ID_Marca = ma.ID_Marca
WHERE v.ID_Modelo_FK IS NULL;

PRINT CONCAT('Modelos actualizados: ', @@ROWCOUNT);

-- Actualizar ID_Tipo_FK basado en texto Tipo
PRINT 'Actualizando IDs de tipos en vehiculos...';
UPDATE v
SET v.ID_Tipo_FK = t.ID_Tipo
FROM VEHICULOS v
JOIN Tipos t ON LTRIM(RTRIM(v.Tipo)) = t.Nombre_Tipo
WHERE v.ID_Tipo_FK IS NULL;

PRINT CONCAT('Tipos actualizados: ', @@ROWCOUNT);

-- Actualizar ID_Color_FK basado en texto Color
PRINT 'Actualizando IDs de colores en vehiculos...';
UPDATE v
SET v.ID_Color_FK = c.ID_Color
FROM VEHICULOS v
JOIN Colores c ON LTRIM(RTRIM(v.Color)) = c.Nombre_Color
WHERE v.ID_Color_FK IS NULL;

PRINT CONCAT('Colores actualizados: ', @@ROWCOUNT);

PRINT 'Migración de VEHICULOS completada.';
GO
