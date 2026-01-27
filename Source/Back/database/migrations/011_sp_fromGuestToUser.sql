DROP PROCEDURE IF EXISTS fromGuestToUser;

CREATE PROCEDURE fromGuestToUser(
    IN p_idUser INT,
    IN p_guestId VARCHAR(255)
)
BEGIN
    DECLARE v_userCartId INT;
    DECLARE v_guestCartId INT;

    -- 1. Obtener o crear carrito del Usuario
    SELECT idCart INTO v_userCartId FROM carts WHERE idUser = p_idUser LIMIT 1;
    
    IF v_userCartId IS NULL THEN
        INSERT INTO carts (idUser, createDate, updateDate) VALUES (p_idUser, NOW(), NOW());
        SET v_userCartId = LAST_INSERT_ID();
    END IF;

    -- 2. Obtener carrito del Invitado
    SELECT idCart INTO v_guestCartId FROM carts WHERE guest_id = p_guestId LIMIT 1;

    IF v_guestCartId IS NOT NULL THEN
        -- 3. Mover items del carrito invitado al usuario
        -- Usamos INSERT ... SELECT ... ON DUPLICATE KEY UPDATE para manejar duplicados
        INSERT INTO cart_items (idCart, idProducto, cantidad, createDate, updateDate)
        SELECT v_userCartId, src.idProducto, src.cantidad, NOW(), NOW()
        FROM cart_items src WHERE src.idCart = v_guestCartId
        ON DUPLICATE KEY UPDATE cantidad = cart_items.cantidad + VALUES(cantidad);

        -- Borrar los items viejos del carrito invitado
        DELETE FROM cart_items WHERE idCart = v_guestCartId;
        
        -- Opcional: Borrar el carrito vacío del invitado
        DELETE FROM carts WHERE idCart = v_guestCartId;
    END IF;

    -- 4. Mover Favoritos
    -- Actualizamos el idUser y quitamos el guest_id. 
    -- Si ya existe el favorito para ese usuario, se hace un "ignore" (o borramos el del guest para evitar error duplicate entry)
    -- Asumiendo UNIQUE(idUser, idProducto)
    
    -- Primero borramos duplicados que causarían conflicto (si el usuario ya lo tiene, borramos el del guest)
    DELETE gf FROM favorites gf
    INNER JOIN favorites uf ON gf.idProducto = uf.idProducto AND uf.idUser = p_idUser
    WHERE gf.guest_id = p_guestId;

    -- Ahora movemos los restantes
    UPDATE favorites 
    SET idUser = p_idUser, guest_id = NULL 
    WHERE guest_id = p_guestId;

    SELECT 'Data merging complete' AS result;
END;
