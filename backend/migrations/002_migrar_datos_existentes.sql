-- ============================================
-- MIGRACIONES DE BASE DE DATOS: RENTA-CAR
-- Archivo: 002_migrar_datos_existentes.sql
-- ============================================

-- ============================================
-- PASO 2: Migrar datos existentes a tablas normalizadas
-- ============================================

-- Extraer marcas únicas de la tabla actual
PRINT 'Migrando marcas...';
INSERT INTO Marcas (Nombre_Marca)
SELECT DISTINCT LTRIM(RTRIM(Marca))
FROM VEHICULOS
WHERE Marca IS NOT NULL 
  AND LTRIM(RTRIM(Marca)) != ''
  AND LTRIM(RTRIM(Marca)) NOT IN (SELECT Nombre_Marca FROM Marcas);

PRINT CONCAT('Marcas migradas: ', @@ROWCOUNT);

-- Extraer modelos únicos con su marca
PRINT 'Migrando modelos...';
INSERT INTO Modelos (Nombre_Modelo, ID_Marca)
SELECT DISTINCT 
    LTRIM(RTRIM(v.Modelo)),
    m.ID_Marca
FROM VEHICULOS v
JOIN Marcas m ON LTRIM(RTRIM(v.Marca)) = m.Nombre_Marca
WHERE v.Modelo IS NOT NULL 
  AND LTRIM(RTRIM(v.Modelo)) != ''
  AND NOT EXISTS (
      SELECT 1 FROM Modelos mo 
      WHERE mo.Nombre_Modelo = LTRIM(RTRIM(v.Modelo)) 
        AND mo.ID_Marca = m.ID_Marca
  );

PRINT CONCAT('Modelos migrados: ', @@ROWCOUNT);

-- Extraer tipos únicos
PRINT 'Migrando tipos...';
INSERT INTO Tipos (Nombre_Tipo)
SELECT DISTINCT LTRIM(RTRIM(Tipo))
FROM VEHICULOS
WHERE Tipo IS NOT NULL 
  AND LTRIM(RTRIM(Tipo)) != ''
  AND LTRIM(RTRIM(Tipo)) NOT IN (SELECT Nombre_Tipo FROM Tipos);

PRINT CONCAT('Tipos migrados: ', @@ROWCOUNT);

-- Extraer colores únicos
PRINT 'Migrando colores...';
INSERT INTO Colores (Nombre_Color)
SELECT DISTINCT LTRIM(RTRIM(Color))
FROM VEHICULOS
WHERE Color IS NOT NULL 
  AND LTRIM(RTRIM(Color)) != ''
  AND LTRIM(RTRIM(Color)) NOT IN (SELECT Nombre_Color FROM Colores);

PRINT CONCAT('Colores migrados: ', @@ROWCOUNT);

PRINT 'Migración de datos completada.';
GO
