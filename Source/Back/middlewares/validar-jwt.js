const { response, request } = require('express');
const jwt = require('jsonwebtoken');

const validarJWT = (req = request, res = response, next) => {

    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            status: 2,
            message: 'No hay token en la petición'
        });
    }

    try {

        const { uid } = jwt.verify(token, process.env.SECRETPRIVATEKEY);
        req.uid = uid;

        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({
            status: 2,
            message: 'Token no válido'
        });
    }

}

const validarJWTOptional = (req = request, res = response, next) => {

    const token = req.header('x-token');

    if (!token) {
        // No hay token, permitimos el paso (modos invitado)
        return next();
    }

    try {

        const { uid } = jwt.verify(token, process.env.SECRETPRIVATEKEY);
        req.uid = uid;

        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({
            status: 2,
            message: 'Token no válido'
        });
    }

}

module.exports = {
    validarJWT,
    validarJWTOptional
}
