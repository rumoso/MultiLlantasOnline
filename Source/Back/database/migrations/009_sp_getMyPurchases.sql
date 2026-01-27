DROP PROCEDURE IF EXISTS `getMyPurchases`;

CREATE PROCEDURE `getMyPurchases`(
    IN p_idUser INT
)
BEGIN
    SELECT 
        o.idOrder,
        o.total,
        o.createDate,
        s.nombre AS statusOrden,
        s.color AS colorOrden,
        p.nombre AS statusPago,
        p.color AS colorPago,
        (SELECT COUNT(*) FROM order_details od WHERE od.idOrder = o.idOrder) as itemsCount
    FROM `orders` o
    INNER JOIN `cat_status_ordenes` s ON o.idStatusOrden = s.idStatusOrden
    INNER JOIN `cat_status_pagos` p ON o.idStatusPago = p.idStatusPago
    WHERE o.idUser = p_idUser
    ORDER BY o.createDate DESC;
END;
