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

        var result = await dbConnection.query('CALL getProductsPag(?, ?, ?)', {
            replacements: [search, start, limiter]
        });
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

/**
 * Catalogo con filtros MULTISELECCION. Recibe arreglos de marcas/anchos/
 * perfiles/rines (ademas del texto libre del buscador) y arma la consulta con
 * `col IN (...)` por dimension: OR dentro de cada grupo, AND entre grupos.
 * Ej: (ancho IN 195,205) AND (marca IN Michelin,Pirelli).
 * Todo parametrizado (sin interpolacion). Devuelve el mismo shape que
 * getProductsPag: { count, rows } con el id encriptado en sIdP.
 */
const getProductsFiltered = async (req, res = response_express.response) => {
    let {
        search = ''
        , marcas = []
        , anchos = []
        , perfiles = []
        , rines = []
        , start = 0
        , limiter = 12
    } = req.body;

    // Normaliza a arreglo de strings no vacios
    const toArr = (v) => {
        if (!Array.isArray(v)) v = (v === null || v === undefined || v === '') ? [] : [v];
        return v.map(x => String(x).trim()).filter(x => x.length > 0);
    };
    marcas = toArr(marcas);
    anchos = toArr(anchos);
    perfiles = toArr(perfiles);
    rines = toArr(rines);

    const nStart = Number.isInteger(Number(start)) && Number(start) >= 0 ? Number(start) : 0;
    let nLimiter = parseInt(limiter, 10);
    if (!Number.isInteger(nLimiter) || nLimiter <= 0 || nLimiter > 100) nLimiter = 12;

    try {
        const where = ['p.activo = 1'];
        const params = [];

        // Texto libre del buscador (cada palabra debe aparecer en el texto
        // concatenado, igual que getProductsPag).
        const words = String(search || '').trim().split(/\s+/).filter(Boolean);
        for (const w of words) {
            where.push(
                `CONCAT_WS(' ', IFNULL(p.nombre,''), IFNULL(p.marca,''), IFNULL(p.modelo,''), ` +
                `IFNULL(p.descripcion,''), IFNULL(p.ancho,''), IFNULL(p.perfil,''), IFNULL(p.rin,'')) LIKE ?`
            );
            params.push(`%${w}%`);
        }

        const addIn = (col, arr) => {
            if (arr.length > 0) {
                where.push(`p.${col} IN (${arr.map(() => '?').join(',')})`);
                params.push(...arr);
            }
        };
        addIn('marca', marcas);
        addIn('ancho', anchos);
        addIn('perfil', perfiles);
        addIn('rin', rines);

        const whereSql = where.join(' AND ');

        const [countRows] = await dbSPConnection.query(
            `SELECT COUNT(*) AS iRows FROM productos p WHERE ${whereSql}`,
            params
        );
        const iRows = countRows[0].iRows;

        const [rows] = await dbSPConnection.query(
            `SELECT p.idProducto, p.nombre, p.descripcion, p.marca, p.modelo,
                    p.ancho, p.perfil, p.rin, p.precio, p.imagen_url, p.activo
             FROM productos p
             WHERE ${whereSql}
             ORDER BY p.nombre ASC
             LIMIT ?, ?`,
            [...params, nStart, nLimiter]
        );

        rows.forEach(r => {
            r.sIdP = encrypt(r.idProducto);
            delete r.idProducto;
        });

        res.json({
            status: 0,
            message: 'Ejecutado correctamente.',
            data: { count: iRows, rows }
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
 * Obtiene las medidas distintas disponibles (ancho / perfil / rin) para
 * poblar el buscador por medida del catalogo. Solo lectura, sin parametros.
 */
const getMedidas = async (req, res = response_express.response) => {
    try {
        const [anchos] = await dbSPConnection.query(
            `SELECT DISTINCT ancho FROM productos
             WHERE activo = 1 AND ancho IS NOT NULL AND ancho <> ''
             ORDER BY CAST(ancho AS UNSIGNED) ASC`
        );
        const [perfiles] = await dbSPConnection.query(
            `SELECT DISTINCT perfil FROM productos
             WHERE activo = 1 AND perfil IS NOT NULL AND perfil <> ''
             ORDER BY CAST(perfil AS UNSIGNED) ASC`
        );
        const [rines] = await dbSPConnection.query(
            `SELECT DISTINCT rin FROM productos
             WHERE activo = 1 AND rin IS NOT NULL AND rin <> ''
             ORDER BY CAST(rin AS UNSIGNED) ASC`
        );

        return res.status(200).json({
            ok: true,
            msg: 'Medidas obtenidas correctamente',
            data: {
                anchos: anchos.map(r => r.ancho),
                perfiles: perfiles.map(r => r.perfil),
                rines: rines.map(r => r.rin)
            }
        });
    } catch (error) {
        console.error('Error en getMedidas:', error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener medidas',
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
    getMedidas,
    getProductsFiltered,
    agregarAlCarrito
};
