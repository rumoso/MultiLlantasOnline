-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS `favorites` (
  `idFavorite` INT NOT NULL AUTO_INCREMENT,
  `idUser` INT NULL,
  `guest_id` VARCHAR(255) NULL,
  `idProducto` INT NOT NULL,
  `createDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idFavorite`),
  UNIQUE KEY `unique_user_product` (`idUser`, `idProducto`),
  UNIQUE KEY `unique_guest_product` (`guest_id`, `idProducto`)
);

-- SP getMyFavorites
DROP PROCEDURE IF EXISTS `getMyFavorites`;
CREATE PROCEDURE `getMyFavorites`(
    IN p_idUser INT,
    IN p_guestId VARCHAR(255)
)
BEGIN
    SELECT 
        f.idFavorite,
        f.idProducto,
        f.createDate,
        p.nombre,
        p.marca,
        p.modelo,
        p.precio,
        p.stock,
        p.imagen_url
    FROM `favorites` f
    INNER JOIN `productos` p ON f.idProducto = p.idProducto
    WHERE (p_idUser IS NOT NULL AND f.idUser = p_idUser)
       OR (p_idUser IS NULL AND p_guestId IS NOT NULL AND f.guest_id = p_guestId)
    ORDER BY f.createDate DESC;
END;

-- SP toggleFavorite
DROP PROCEDURE IF EXISTS `toggleFavorite`;
CREATE PROCEDURE `toggleFavorite`(
    IN p_idUser INT,
    IN p_guestId VARCHAR(255),
    IN p_idProducto INT
)
BEGIN
    DECLARE v_exists INT;
    
    SELECT COUNT(*) INTO v_exists 
    FROM favorites 
    WHERE (p_idUser IS NOT NULL AND idUser = p_idUser AND idProducto = p_idProducto)
       OR (p_idUser IS NULL AND p_guestId IS NOT NULL AND guest_id = p_guestId AND idProducto = p_idProducto);
    
    IF v_exists > 0 THEN
        -- Si existe, borrar (Remove)
        DELETE FROM favorites 
        WHERE (p_idUser IS NOT NULL AND idUser = p_idUser AND idProducto = p_idProducto)
           OR (p_idUser IS NULL AND guest_id = p_guestId AND idProducto = p_idProducto);
           
        SELECT 'Eliminado de favoritos' AS message, 0 AS isFavorite;
    ELSE
        -- Si no existe, insertar (Add)
        INSERT INTO favorites (idUser, guest_id, idProducto) VALUES (p_idUser, p_guestId, p_idProducto);
        SELECT 'Agregado a favoritos' AS message, 1 AS isFavorite;
    END IF;
END;
