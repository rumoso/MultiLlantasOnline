DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_getProductsCount`$$

CREATE PROCEDURE `sp_getProductsCount`(
    IN p_search VARCHAR(500)
)
BEGIN
    
    -- Tabla temporal para dividir el search en palabras individuales
    WITH RECURSIVE words AS (
        SELECT
            SUBSTRING_INDEX(p_search, ' ', 1) AS palabra,
            SUBSTRING(p_search, LOCATE(' ', p_search) + 1) AS rest
        UNION ALL
        SELECT
            SUBSTRING_INDEX(rest, ' ', 1) AS palabra,
            SUBSTRING(rest, LOCATE(' ', rest) + 1) AS rest
        FROM words
        WHERE rest <> '' AND LOCATE(' ', rest) > 0
        UNION ALL
        SELECT
            rest AS palabra,
            '' AS rest
        FROM words
        WHERE rest <> '' AND LOCATE(' ', rest) = 0
    )
    SELECT
        COUNT(*) AS total
    FROM productos AS P
    WHERE
        P.activo = 1
        AND (
            p_search = ''
            OR (
                SELECT COUNT(*) 
                FROM words w
                WHERE CONCAT(
                    IFNULL(P.nombre, ''),
                    ' ', IFNULL(P.marca, ''),
                    ' ', IFNULL(P.modelo, ''),
                    ' ', IFNULL(P.descripcion, ''),
                    ' ', IFNULL(P.ancho, ''),
                    '/', IFNULL(P.perfil, ''),
                    ' R', IFNULL(P.rin, '')
                ) LIKE CONCAT('%', w.palabra, '%')
            ) > 0
        );

END$$

DELIMITER ;
