const { response } = require('express');
const bcryptjs = require('bcryptjs');
const { dbConnection } = require('../database/config');

const getMyAccount = async (req, res = response) => {
    const idUser = req.uid;

    try {
        const [rows] = await dbConnection.query(
            'SELECT idUser, name, userName, email, telefono FROM users WHERE idUser = ? LIMIT 1',
            { replacements: [idUser] }
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: 2,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            status: 0,
            message: 'Cuenta obtenida correctamente',
            data: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener la cuenta',
            data: error.message
        });
    }
};

const updateMyAccount = async (req, res = response) => {
    const idUser = req.uid;
    const { name, email, telefono } = req.body;

    try {
        await dbConnection.query(
            'UPDATE users SET name = ?, email = ?, telefono = ?, updateDate = NOW() WHERE idUser = ?',
            { replacements: [name, email || null, telefono || null, idUser] }
        );

        res.json({
            status: 0,
            message: 'Datos actualizados correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al actualizar la cuenta',
            data: error.message
        });
    }
};

const changePassword = async (req, res = response) => {
    const idUser = req.uid;
    const { pwdActual, pwdNueva, pwdNueva2 } = req.body;

    if (!pwdActual || !pwdNueva || !pwdNueva2) {
        return res.status(400).json({
            status: 2,
            message: 'Todos los campos son obligatorios'
        });
    }

    if (pwdNueva !== pwdNueva2) {
        return res.status(400).json({
            status: 2,
            message: 'Las contraseñas nuevas no coinciden'
        });
    }

    try {
        const [rows] = await dbConnection.query(
            'SELECT pwd FROM users WHERE idUser = ? LIMIT 1',
            { replacements: [idUser] }
        );

        if (rows.length === 0) {
            return res.status(404).json({
                status: 2,
                message: 'Usuario no encontrado'
            });
        }

        const validPassword = bcryptjs.compareSync(pwdActual, rows[0].pwd);

        if (!validPassword) {
            return res.json({
                status: 1,
                message: 'La contraseña actual no es correcta'
            });
        }

        const salt = bcryptjs.genSaltSync();
        const hashedPwd = bcryptjs.hashSync(pwdNueva, salt);

        await dbConnection.query(
            'UPDATE users SET pwd = ?, updateDate = NOW() WHERE idUser = ?',
            { replacements: [hashedPwd, idUser] }
        );

        res.json({
            status: 0,
            message: 'Contraseña actualizada correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al cambiar la contraseña',
            data: error.message
        });
    }
};

const getMyAddresses = async (req, res = response) => {
    const idUser = req.uid;

    try {
        const [rows] = await dbConnection.query(
            `SELECT idAddress, codigoPostal, calle, numExt, numInt, entreCalles,
                    colonia, ciudad, municipio, estado, bPrincipal
             FROM addresses
             WHERE idUser = ?
             ORDER BY bPrincipal DESC, createDate DESC`,
            { replacements: [idUser] }
        );

        res.json({
            status: 0,
            message: 'Direcciones obtenidas correctamente',
            data: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al obtener las direcciones',
            data: error.message
        });
    }
};

const addAddress = async (req, res = response) => {
    const idUser = req.uid;
    const {
        codigoPostal, calle, numExt, numInt, entreCalles,
        colonia, ciudad, municipio, estado, bPrincipal
    } = req.body;

    const tran = await dbConnection.transaction();

    try {
        if (bPrincipal) {
            await dbConnection.query(
                'UPDATE addresses SET bPrincipal = 0 WHERE idUser = ?',
                { replacements: [idUser], transaction: tran }
            );
        }

        await dbConnection.query(
            `INSERT INTO addresses
                (idUser, codigoPostal, calle, numExt, numInt, entreCalles,
                 colonia, ciudad, municipio, estado, bPrincipal, createDate, updateDate)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            {
                replacements: [
                    idUser, codigoPostal || null, calle || null, numExt || null, numInt || null,
                    entreCalles || null, colonia || null, ciudad || null, municipio || null,
                    estado || null, bPrincipal ? 1 : 0
                ],
                transaction: tran
            }
        );

        await tran.commit();

        res.json({
            status: 0,
            message: 'Dirección agregada correctamente'
        });
    } catch (error) {
        await tran.rollback();
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al agregar la dirección',
            data: error.message
        });
    }
};

const updateAddress = async (req, res = response) => {
    const idUser = req.uid;
    const {
        idAddress, codigoPostal, calle, numExt, numInt, entreCalles,
        colonia, ciudad, municipio, estado, bPrincipal
    } = req.body;

    if (!idAddress) {
        return res.status(400).json({
            status: 2,
            message: 'El ID de la dirección es obligatorio'
        });
    }

    const tran = await dbConnection.transaction();

    try {
        const [ownerRows] = await dbConnection.query(
            'SELECT idUser FROM addresses WHERE idAddress = ? LIMIT 1',
            { replacements: [idAddress], transaction: tran }
        );

        if (ownerRows.length === 0 || ownerRows[0].idUser != idUser) {
            await tran.rollback();
            return res.status(404).json({
                status: 2,
                message: 'Dirección no encontrada'
            });
        }

        if (bPrincipal) {
            await dbConnection.query(
                'UPDATE addresses SET bPrincipal = 0 WHERE idUser = ?',
                { replacements: [idUser], transaction: tran }
            );
        }

        await dbConnection.query(
            `UPDATE addresses
             SET codigoPostal = ?, calle = ?, numExt = ?, numInt = ?, entreCalles = ?,
                 colonia = ?, ciudad = ?, municipio = ?, estado = ?, bPrincipal = ?,
                 updateDate = NOW()
             WHERE idAddress = ?`,
            {
                replacements: [
                    codigoPostal || null, calle || null, numExt || null, numInt || null,
                    entreCalles || null, colonia || null, ciudad || null, municipio || null,
                    estado || null, bPrincipal ? 1 : 0, idAddress
                ],
                transaction: tran
            }
        );

        await tran.commit();

        res.json({
            status: 0,
            message: 'Dirección actualizada correctamente'
        });
    } catch (error) {
        await tran.rollback();
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al actualizar la dirección',
            data: error.message
        });
    }
};

const deleteAddress = async (req, res = response) => {
    const idUser = req.uid;
    const { idAddress } = req.body;

    if (!idAddress) {
        return res.status(400).json({
            status: 2,
            message: 'El ID de la dirección es obligatorio'
        });
    }

    try {
        const [ownerRows] = await dbConnection.query(
            'SELECT idUser FROM addresses WHERE idAddress = ? LIMIT 1',
            { replacements: [idAddress] }
        );

        if (ownerRows.length === 0 || ownerRows[0].idUser != idUser) {
            return res.status(404).json({
                status: 2,
                message: 'Dirección no encontrada'
            });
        }

        await dbConnection.query(
            'DELETE FROM addresses WHERE idAddress = ?',
            { replacements: [idAddress] }
        );

        res.json({
            status: 0,
            message: 'Dirección eliminada correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al eliminar la dirección',
            data: error.message
        });
    }
};

const setAddressPrincipal = async (req, res = response) => {
    const idUser = req.uid;
    const { idAddress } = req.body;

    if (!idAddress) {
        return res.status(400).json({
            status: 2,
            message: 'El ID de la dirección es obligatorio'
        });
    }

    const tran = await dbConnection.transaction();

    try {
        const [ownerRows] = await dbConnection.query(
            'SELECT idUser FROM addresses WHERE idAddress = ? LIMIT 1',
            { replacements: [idAddress], transaction: tran }
        );

        if (ownerRows.length === 0 || ownerRows[0].idUser != idUser) {
            await tran.rollback();
            return res.status(404).json({
                status: 2,
                message: 'Dirección no encontrada'
            });
        }

        await dbConnection.query(
            'UPDATE addresses SET bPrincipal = 0 WHERE idUser = ?',
            { replacements: [idUser], transaction: tran }
        );

        await dbConnection.query(
            'UPDATE addresses SET bPrincipal = 1, updateDate = NOW() WHERE idAddress = ?',
            { replacements: [idAddress], transaction: tran }
        );

        await tran.commit();

        res.json({
            status: 0,
            message: 'Dirección marcada como principal'
        });
    } catch (error) {
        await tran.rollback();
        console.error(error);
        res.status(500).json({
            status: 2,
            message: 'Error al marcar la dirección como principal',
            data: error.message
        });
    }
};

module.exports = {
    getMyAccount,
    updateMyAccount,
    changePassword,
    getMyAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setAddressPrincipal
};
