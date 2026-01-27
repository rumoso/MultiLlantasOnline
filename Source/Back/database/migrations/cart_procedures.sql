DELIMITER ;;

DROP PROCEDURE IF EXISTS `agregarAlCarrito`;;
CREATE PROCEDURE `agregarAlCarrito`(
    IN p_createDate DATETIME,
    IN p_idProducto INT,
    IN p_cantidad INT,
    IN p_idUser INT,
    IN p_guest_id VARCHAR(255)
)
BEGIN
    DECLARE v_idCart INT;
    DECLARE v_count INT;
    
    -- 1. Buscar si ya existe un carrito activo para este usuario o invitado
    SET v_idCart = NULL;

    -- Prioridad: Usuario registrado
    IF p_idUser IS NOT NULL AND p_idUser > 0 THEN
        SELECT idCart INTO v_idCart FROM carts WHERE idUser = p_idUser LIMIT 1;
    -- Si no, usamos el guest_id
    ELSEIF p_guest_id IS NOT NULL AND p_guest_id != '' THEN
        SELECT idCart INTO v_idCart FROM carts WHERE guest_id = p_guest_id LIMIT 1;
    END IF;

    -- 2. Si no existe carrito, crearlo
    IF v_idCart IS NULL THEN
        INSERT INTO carts (createDate, updateDate, idUser, guest_id)
        VALUES (p_createDate, p_createDate, p_idUser, p_guest_id);
        
        SET v_idCart = LAST_INSERT_ID();
    ELSE
        -- Actualizar fecha de actualización
        UPDATE carts SET updateDate = p_createDate WHERE idCart = v_idCart;
    END IF;

    -- 3. Agregar o actualizar producto en cart_items
    SELECT COUNT(*) INTO v_count FROM cart_items WHERE idCart = v_idCart AND idProducto = p_idProducto;

    IF v_count > 0 THEN
        UPDATE cart_items 
        SET cantidad = cantidad + p_cantidad, updateDate = p_createDate
        WHERE idCart = v_idCart AND idProducto = p_idProducto;
    ELSE
        INSERT INTO cart_items (createDate, updateDate, idCart, idProducto, cantidad, precio)
        SELECT p_createDate, p_createDate, v_idCart, p_idProducto, p_cantidad, precio
        FROM productos WHERE idProducto = p_idProducto;
    END IF;

    SELECT 'Producto agregado al carrito' as message, v_idCart as idCart;
END;;

DROP PROCEDURE IF EXISTS `getCart`;;
CREATE PROCEDURE `getCart`(
    IN p_idUser INT,
    IN p_guest_id VARCHAR(255)
)
BEGIN
    DECLARE v_idCart INT;
    
    SET v_idCart = NULL;

    -- Buscar el carrito
    IF p_idUser IS NOT NULL AND p_idUser > 0 THEN
        SELECT idCart INTO v_idCart FROM carts WHERE idUser = p_idUser LIMIT 1;
    ELSEIF p_guest_id IS NOT NULL AND p_guest_id != '' THEN
        SELECT idCart INTO v_idCart FROM carts WHERE guest_id = p_guest_id ORDER BY idCart DESC LIMIT 1;
    END IF;

    -- Retornar items si existe carrito
    IF v_idCart IS NOT NULL THEN
        SELECT 
            ci.keyx AS idItem,
            ci.idCart,
            ci.idProducto,
            p.nombre,
            p.imagen_url,
            p.precio,
            ci.cantidad,
            (p.precio * ci.cantidad) as subtotal
        FROM cart_items ci
        INNER JOIN productos p ON ci.idProducto = p.idProducto
        WHERE ci.idCart = v_idCart;
    ELSE
        -- Retornar result set vacío
        SELECT * FROM cart_items WHERE 1=0;
    END IF;
END;;

DELIMITER ;
