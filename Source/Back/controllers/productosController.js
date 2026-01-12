const response_express = require('express');
const Op_sequelize = require('sequelize');
const { dbConnection, dbSPConnection } = require('../database/config');

const getProductsPag = async (req, res) => {
    var {
        search = ''
        , limiter = 10
        , start = 0
        , idUserLogON
    } = req.body;
console.log(req.body);
    try {

        const result = await dbConnection.query(`CALL getProductsPag(
            '${ search }'
            , ${ start }
            , ${ limiter }
            )`);
        console.log(result);
        const iRows = result.length > 0 ? result[0].iRows: 0;

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: {
                count: iRows,
                rows: result
            }
        });
    } catch (error) {
        res.json({
            status: 2,
            message: 'Sucedió un error inesperado',
            data: error.message
        });
    }
};

/**
 * Obtiene un producto por ID
 */
const getProductById = async (req, res = response_express.response) => {
    try {
        const { idProducto } = req.body;

        const query = `
            SELECT
                id_producto,
                nombre,
                descripcion,
                marca,
                modelo,
                ancho,
                perfil,
                rin,
                precio,
                stock,
                imagen_url,
                activo,
                fecha_creacion
            FROM productos
            WHERE id_producto = ? AND activo = 1
        `;

        const [rows] = await dbSPConnection.query(query, [idProducto]);

        if (rows.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Producto no encontrado'
            });
        }

        return res.status(200).json({
            ok: true,
            msg: 'Producto obtenido correctamente',
            data: rows[0]
        });

    } catch (error) {
        console.error('Error en getProductById:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener producto',
            error: error.message
        });
    }
};

/**
 * Obtiene productos por marca con paginación
 */
const getProductsByMarca = async (req, res = response_express.response) => {
    try {
        const { marca, search = '', start = 0, limiter = 10 } = req.body;

        const query = `
            SELECT
                id_producto,
                nombre,
                descripcion,
                marca,
                modelo,
                ancho,
                perfil,
                rin,
                precio,
                stock,
                imagen_url,
                activo,
                fecha_creacion
            FROM productos
            WHERE activo = 1
                AND marca = ?
                AND (
                    nombre LIKE ?
                    OR modelo LIKE ?
                    OR descripcion LIKE ?
                )
            ORDER BY nombre ASC
            LIMIT ?, ?
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM productos
            WHERE activo = 1
                AND marca = ?
                AND (
                    nombre LIKE ?
                    OR modelo LIKE ?
                    OR descripcion LIKE ?
                )
        `;

        const searchPattern = `%${search}%`;
        const searchParams = [marca, searchPattern, searchPattern, searchPattern];

        const [rows] = await dbSPConnection.query(query, [...searchParams, parseInt(start), parseInt(limiter)]);
        const [countResult] = await dbSPConnection.query(countQuery, searchParams);

        const total = countResult[0].total;

        return res.status(200).json({
            ok: true,
            msg: 'Productos obtenidos correctamente',
            data: rows,
            total: total
        });

    } catch (error) {
        console.error('Error en getProductsByMarca:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener productos por marca',
            error: error.message
        });
    }
};

/**
 * Obtiene lista de marcas disponibles
 */
const getMarcas = async (req, res = response_express.response) => {
    try {
        const query = `
            SELECT DISTINCT marca
            FROM productos
            WHERE activo = 1
            ORDER BY marca ASC
        `;

        const [rows] = await dbSPConnection.query(query);

        return res.status(200).json({
            ok: true,
            msg: 'Marcas obtenidas correctamente',
            data: rows
        });

    } catch (error) {
        console.error('Error en getMarcas:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener marcas',
            error: error.message
        });
    }
};


module.exports = {
    getProductsPag,
    getProductById,
    getProductsByMarca,
    getMarcas
};
