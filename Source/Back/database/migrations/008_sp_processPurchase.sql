DROP PROCEDURE IF EXISTS `processPurchase`;

CREATE PROCEDURE `processPurchase`(
    IN p_idUser INT
)
BEGIN
    DECLARE v_idCart INT;
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_idOrder INT;
    DECLARE v_idStatusOrden INT;
    DECLARE v_idStatusPago INT;

    -- 1. Obtener ID del carrito para el usuario
    SELECT idCart INTO v_idCart 
    FROM carts 
    WHERE idUser = p_idUser 
    LIMIT 1;

    -- Validar si existe el carrito con items
    IF v_idCart IS NOT NULL THEN
        -- Calcular el total
        SELECT SUM(cantidad * precio) INTO v_total
        FROM cart_items
        WHERE idCart = v_idCart;

        IF v_total IS NULL THEN
            SET v_total = 0;
        END IF;

        -- Obtener IDs de status "PAGADA" y "APROBADO" para simular compra
        -- Asumimos que existen, sino fallback a 1
        SELECT idStatusOrden INTO v_idStatusOrden FROM cat_status_ordenes WHERE codigo = 'PAGADA' LIMIT 1;
        IF v_idStatusOrden IS NULL THEN SET v_idStatusOrden = 2; END IF;

        SELECT idStatusPago INTO v_idStatusPago FROM cat_status_pagos WHERE codigo = 'APROBADO' LIMIT 1;
        IF v_idStatusPago IS NULL THEN SET v_idStatusPago = 2; END IF;

        -- 2. Crear la Orden (Header)
        INSERT INTO `orders` (idUser, total, idStatusOrden, idStatusPago, createDate, updateDate)
        VALUES (p_idUser, v_total, v_idStatusOrden, v_idStatusPago, NOW(), NOW());

        SET v_idOrder = LAST_INSERT_ID();

        -- 3. Mover items del carrito a order_details (Detail)
        INSERT INTO `order_details` (idOrder, idProducto, cantidad, precio, subtotal)
        SELECT 
            v_idOrder, 
            idProducto, 
            cantidad, 
            precio, 
            (cantidad * precio)
        FROM cart_items
        WHERE idCart = v_idCart;

        -- 4. Limpiar el carrito
        DELETE FROM cart_items WHERE idCart = v_idCart;
        -- Opcional: Eliminar la entrada de carts o actualizarla
        UPDATE carts SET updateDate = NOW() WHERE idCart = v_idCart;

        -- Retornar éxito
        SELECT 'Compra procesada exitosamente' AS message, v_idOrder AS idOrder;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se encontró un carrito activo para este usuario';
    END IF;

END;
