DROP PROCEDURE IF EXISTS `getOrderDetails`;

CREATE PROCEDURE `getOrderDetails`(
    IN p_idOrder INT
)
BEGIN
    SELECT 
        od.idOrderDetail,
        od.idProducto,
        od.cantidad,
        od.precio,
        od.subtotal,
        p.nombre,
        p.imagen_url as imagen
    FROM `order_details` od
    INNER JOIN `productos` p ON od.idProducto = p.idProducto
    WHERE od.idOrder = p_idOrder;
END;
