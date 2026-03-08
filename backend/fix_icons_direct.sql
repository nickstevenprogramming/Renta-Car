-- Script para corregir los iconos en la tabla Extras
-- Ejecútalo directamente en SQL Server Management Studio

USE RENTA_DE_VEHICULOS1;
GO

-- 1. Asegurarnos que la columna soporta Unicode (NVARCHAR)
ALTER TABLE Extras ALTER COLUMN Icono NVARCHAR(50);
GO

-- 2. Actualizar los iconos usando el prefijo N'' para Unicode
UPDATE Extras SET Icono = N'🍼' WHERE Nombre = 'Asiento de Bebé';
UPDATE Extras SET Icono = N'📍' WHERE Nombre = 'GPS Navegador';
UPDATE Extras SET Icono = N'🛡️' WHERE Nombre = 'Seguro Premium';
UPDATE Extras SET Icono = N'👤' WHERE Nombre = 'Conductor Adicional';
GO

-- 3. Verificar los cambios
SELECT * FROM Extras;
GO
