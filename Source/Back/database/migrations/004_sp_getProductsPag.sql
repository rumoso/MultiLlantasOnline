DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_getProductsPag`$$

CREATE PROCEDURE `sp_getProductsPag`(
    IN p_search VARCHAR(500),
    IN p_start INT,
    IN p_limiter INT
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
        P.idProducto,
        P.nombre,
        P.descripcion,
        P.marca,
        P.modelo,
        P.ancho,
        P.perfil,
        P.rin,
        P.precio,
        P.stock,
        P.imagen_url,
        P.activo,
        P.createDate AS fecha_creacion,
        
        -- Contar cuántas palabras del search coinciden
        (
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
        ) AS iCountWords
        
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
        )
    ORDER BY iCountWords DESC, P.marca ASC, P.nombre ASC
    LIMIT p_start, p_limiter;

END$$

DELIMITER ;
