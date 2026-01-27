DROP PROCEDURE IF EXISTS getCart;

CREATE PROCEDURE `getCart`(
    IN p_idUsuario INT,
    IN p_guest_id VARCHAR(255)
)
BEGIN
    SELECT 
        ci.keyx AS idItem,
        ci.idCart,
        ci.idProducto,
        p.nombre AS descripcion,
        p.imagen_url,
        ci.cantidad,
        ci.precio,
        (ci.cantidad * ci.precio) AS subtotal
    FROM cart_items ci
    INNER JOIN carts c ON ci.idCart = c.idCart
    INNER JOIN productos p ON ci.idProducto = p.idProducto
    WHERE 
        -- Busca por ID de Usuario
        (p_idUsuario IS NOT NULL AND p_idUsuario <> 0 AND c.idUser = p_idUsuario)
        OR 
        -- O busca por Guest ID (incluso si está logueado, queremos ver lo que agregó como invitado)
        (c.guest_id = p_guest_id AND p_guest_id <> '')
    ORDER BY ci.keyx DESC;
END;
