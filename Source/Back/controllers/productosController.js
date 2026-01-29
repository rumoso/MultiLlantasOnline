const response_express = require('express');
const Op_sequelize = require('sequelize');

const { dbConnection, dbSPConnection } = require('../database/config');
const { encrypt, decrypt } = require('../utils/crypto');
const moment = require('moment');

const getProductsPag = async (req, res) => {
    var {
        search = ''
        , limiter = 10
        , start = 0
        , idUserLogON
    } = req.body;
    console.log(req.body);
    try {

        var result = await dbConnection.query(`CALL getProductsPag(
            '${search}'
            , ${start}
            , ${limiter}
            )`);
        console.log(result);
        const iRows = result.length > 0 ? result[0].iRows : 0;

        //encript pwd
        if (iRows > 0) {
            for (let i = 0; i < result.length; i++) {
                var sIdEcript = encrypt(result[i].idProducto);
                result[i].sIdP = sIdEcript;
                delete result[i].idProducto;
            }
        }

        console.log('RESUUUU', result);

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
        let { idProducto } = req.body;

        let finalIdProducto = idProducto;
        if (isNaN(idProducto) && typeof idProducto === 'string') {
            try {
                finalIdProducto = decrypt(idProducto);
            } catch (e) { console.error('Error decrypting getProductById', e); }
        }

        const query = `
            SELECT
                idProducto,
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
                createDate
            FROM productos
            WHERE idProducto = ? AND activo = 1
        `;

        const [rows] = await dbSPConnection.query(query, [finalIdProducto]);

        // Encrypt ID in single product response too
        if (rows.length > 0) {
            rows[0].sIdP = encrypt(rows[0].idProducto);
            delete rows[0].idProducto;
        }

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
                idProducto,
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
                createDate
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

        // Encrypt IDs
        rows.forEach(row => {
            row.sIdP = encrypt(row.idProducto);
            delete row.idProducto;
        });

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

const agregarAlCarrito = async (req, res) => {

    // si no funciona cambialo a Var
    let {
        sIdP,
        cantidad,
        idUsuario,
        guest_id

    } = req.body;

    let idCart = 0;
    let idItem = 0;

    //console.log(req.body)
    console.log('DEBUG agregarAlCarrito BODY:', req.body);

    const oGetDateNow = moment().format('YYYY-MM-DD HH:mm:ss');

    try {

        var idProducto = decrypt(sIdP);

        if (!idProducto) {
            return res.json({
                status: 2,
                message: "El ID del producto es obligatorio y no fue recibido (decryption failed)",
                data: null
            });
        }

        // Decrypt sIdU if present
        let finalIdUser = idUsuario;
        if (isNaN(idUsuario)) {
            try {
                finalIdUser = decrypt(idUsuario);
            } catch (e) { console.error('Error decrypting cart idUser', e); }
        }

        var OSQL = await dbConnection.query(`call agregarAlCarrito(
            '${oGetDateNow}'
            ,${idCart}
            ,${idItem}
            ,${idProducto}
            , ${cantidad}
            , ${finalIdUser}
            ,'${guest_id}'
            
        )`)
        //	SELECT p_idCart AS idCart, @out_id AS idItem, @message AS message;

        res.json({
            status: OSQL[0].idItem > 0 ? 0 : 1,
            message: OSQL[0].message,
            idItem: OSQL[0].idItem,
            idCart: OSQL[0].idCart
        });

    } catch (error) {

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });

    }
}


module.exports = {
    getProductsPag,
    getProductById,
    getProductsByMarca,
    getMarcas,
    agregarAlCarrito
};
