const bcryptjs = require('bcryptjs');
const { encrypt } = require('../utils/crypto');
const { response } = require('express');
const { json } = require('express/lib/response');

const { generarJWT } = require('../helpers/generar-jwt');

const { dbConnection, dbSPConnection } = require('../database/config');

const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        maxAge: 12 * 60 * 60 * 1000, // 12h, igual que expiresIn del JWT
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
    });
};

const logout = async (req, res = response) => {
    res.clearCookie('token', { path: '/' });
    res.json({
        status: 0,
        message: 'Sesión cerrada correctamente.'
    });
};

const login = async (req, res = response) => {

    const {
        username
        , pwd
    } = req.body;

    var OSQL = null;

    try {

        OSQL = await dbConnection.query('call getUserByUserName(?)', {
            replacements: [username]
        });

        console.log(OSQL);

        if (OSQL.length == 0) {
            return res.json({
                status: 1,
                message: "Usuario / Password no son correctos",
                data: null
            })
        }

        var user = OSQL[0];
        console.log("Usuario encontrado:", user); // DEBUG: Ver estructura exacta
        const salt = bcryptjs.genSaltSync();
        user.sIdU = encrypt((user.idUser || user.iduser));

        //Si el usuario está activo
        if (!user.active) {
            return res.json({
                status: 1,
                message: "Usuario / Password no son correctos",
                data: null
            })
        }

        //Verificar contraseña
        const validPassword = bcryptjs.compareSync(pwd, user.pwd);

        if (!validPassword) {
            return res.json({
                status: 1,
                message: "Usuario / Password no son correctos",
                data: null
            })
        }

        //Generar el JWT
        const token = await generarJWT(user.idUser || user.iduser);

        // ASOCIACIÓN DE DATOS (CARRITO Y FAVORITOS): Vincular datos del guest al usuario
        try {
            // guestId middleware should populate this, or we check body/headers if not
            const currentGuestId = req.guestId || req.headers['x-guest-id'] || req.body.guest_id;

            if (currentGuestId) {
                console.log(`Fusionando datos de guest ${currentGuestId} al usuario ${user.idUser || user.iduser}`);
                try {
                    await dbConnection.query('CALL fromGuestToUser(?, ?)', {
                        replacements: [user.idUser || user.iduser, currentGuestId]
                    });
                    console.log('Fusionado correcto.');
                } catch (e) {
                    console.error('Error ejecutando SP fromGuestToUser:', e);
                    throw e;
                }
            } else {
                console.warn('Login exitoso pero SIN guest-id para fusionar.');
            }
        } catch (mergeError) {
            console.error('Error al fusionar datos de invitado:', mergeError);
            // No bloqueamos el login si falla esto
        }

        setTokenCookie(res, token);

        res.json({
            status: 0,
            message: "Conectado correctamente.",
            data: {
                user,
                token
            }
        });
    }
    catch (error) {

        res.status(500).json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: OSQL
        });
    }
}

const register = async (req, res = response) => {

    const {
        name
        , userName
        , email
        , telefono
        , pwd
    } = req.body;

    try {

        const [existing] = await dbSPConnection.query(
            'SELECT idUser FROM users WHERE userName = ? OR email = ? LIMIT 1',
            [userName, email]
        );

        if (existing.length > 0) {
            return res.json({
                status: 1,
                message: "El usuario o el correo ya están registrados",
                data: null
            });
        }

        const salt = bcryptjs.genSaltSync();
        const hashedPwd = bcryptjs.hashSync(pwd, salt);

        const [insertResult] = await dbSPConnection.query(
            `INSERT INTO users (createDate, updateDate, name, userName, pwd, email, telefono, active)
             VALUES (NOW(), NOW(), ?, ?, ?, ?, ?, 1)`,
            [name, userName, hashedPwd, email, telefono]
        );

        const idUser = insertResult.insertId;

        const user = {
            idUser
            , name
            , userName
            , email
            , telefono
            , active: 1
            , sIdU: encrypt(idUser)
        };

        const token = await generarJWT(idUser);

        // ASOCIACIÓN DE DATOS (CARRITO Y FAVORITOS): Vincular datos del guest al usuario nuevo
        try {
            const currentGuestId = req.guestId || req.headers['x-guest-id'] || req.body.guest_id;

            if (currentGuestId) {
                console.log(`Fusionando datos de guest ${currentGuestId} al usuario nuevo ${idUser}`);
                try {
                    await dbConnection.query('CALL fromGuestToUser(?, ?)', {
                        replacements: [idUser, currentGuestId]
                    });
                    console.log('Fusionado correcto.');
                } catch (e) {
                    console.error('Error ejecutando SP fromGuestToUser:', e);
                    throw e;
                }
            } else {
                console.warn('Registro exitoso pero SIN guest-id para fusionar.');
            }
        } catch (mergeError) {
            console.error('Error al fusionar datos de invitado:', mergeError);
            // No bloqueamos el registro si falla esto
        }

        setTokenCookie(res, token);

        res.json({
            status: 0,
            message: "Cuenta creada correctamente.",
            data: {
                user,
                token
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }
}

const getMenuByPermissions = async (req, res = response) => {

    const finalIdUser = req.uid;

    var OSQL = null;

    try {

        var OMenuList = [];

        OGetMenuFatherList = await dbConnection.query(`call getMenuFathersByPermission(${finalIdUser})`);

        console.log(OGetMenuFatherList);

        if (OGetMenuFatherList.length == 0) {
            return res.json({
                status: 1,
                message: "No tiene permisos",
                data: null
            })
        } else {

            for (var i = 0; i < OGetMenuFatherList.length; i++) {

                var oMenuFather = OGetMenuFatherList[i];

                var OMenu = {
                    'idMenu': oMenuFather.idMenu,
                    'lugar': oMenuFather.lugar,
                    'name': oMenuFather.name,
                    'icon': oMenuFather.icon,
                    'subMenus': []
                }

                OGetMenuDetailFatherList = await dbConnection.query(`call getMenuDetailsByPermission( ${finalIdUser}, ${oMenuFather.idMenu} )`);

                var OSubMenus = [];
                for (var n = 0; n < OGetMenuDetailFatherList.length; n++) {
                    //console.log(OGetMenuDetailFatherList[n])

                    var oGetMenuDetail = OGetMenuDetailFatherList[n];

                    var OMenuDetail = {
                        'idMenu': oGetMenuDetail.idMenu,
                        'idMenuPadre': oGetMenuDetail.idMenuPadre,
                        'lugar': oGetMenuDetail.lugar,
                        'name': oGetMenuDetail.name,
                        'description': oGetMenuDetail.description,
                        'icon': oGetMenuDetail.icon,
                        'linkCat': oGetMenuDetail.linkCat,
                        'linkList': oGetMenuDetail.linkList,
                        'imgDash': oGetMenuDetail.imgDash,
                        'imgDashSize': oGetMenuDetail.imgDashSize
                    };

                    OMenu.subMenus.push(OMenuDetail);
                }

                OMenuList.push(OMenu);
            }

            console.log(OMenuList)

            res.json({
                status: 0,
                message: "Conectado correctamente.",
                data: OMenuList
            });

        }

    }
    catch (error) {

        res.status(500).json({
            status: 2,
            message: "Sucedió un error inesperado",
            error: error.message,
            data: OSQL
        });
    }
}

const getActionsPermissionByUser = async (req, res = response) => {

    const finalIdUser = req.uid;

    try {

        var OSQL = await dbConnection.query(`call getActionsPermissionByUser(${finalIdUser})`)

        if (OSQL.length == 0) {

            res.json({
                status: 1,
                message: "No se encontraron registros.",
                data: null
            });

        }
        else {

            res.json({
                status: 0,
                message: "Ejecutado correctamente.",
                data: OSQL
            });

        }

        //await dbConnectionNEW.close();

    } catch (error) {

        //await dbConnectionNEW.close();

        res.json({
            status: 2,
            message: "Sucedió un error inesperado",
            data: error.message
        });
    }

};

module.exports = {
    login
    , register
    , logout
    , getMenuByPermissions
    , getActionsPermissionByUser
}