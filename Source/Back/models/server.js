const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        // Rutas del E-Commerce de Llantas
        this.authPath = '/api/auth';
        this.usersPath = '/api/users';
        this.rolesPath = '/api/roles';
        this.productosPath = '/api/productos';
        this.cartPath = '/api/cart';

        //CONEXION A LA BASE DE DATOS
        this.dbConnection();

        this.middlewares();

        this.routes();
    }

    async dbConnection() {
        try {

            await dbConnection.authenticate();
            console.log('Database online');

        } catch (err) {
            throw new Error(err);
        }
    }

    middlewares() {
        //CORS
        this.app.use(cors({
            origin: ['http://localhost:4200', 'http://127.0.0.1:4200'], // Permitir origen específico para credenciales
            credentials: true // Permitir envío de cookies
        }));

        // COOKIE PARSER - Para manejar cookies (guest_id)
        this.app.use(cookieParser());

        // Middleware para asignar guest_id a todos los usuarios
        const guestIdMiddleware = require('../middlewares/guestId');
        this.app.use(guestIdMiddleware);

        // LECTURA Y PARSEO DEL BODY
        this.app.use(express.json());

        //DIRECTORIO PÚBLICO
        this.app.use(express.static('public'));

        this.app.use(fileUpload({
            createParentPath: true,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB max file size
            },
        }));
    }

    routes() {
        // Rutas del E-Commerce
        this.app.use(this.authPath, require('../routes/authRoute'));
        this.app.use(this.usersPath, require('../routes/usersRoute'));
        this.app.use(this.rolesPath, require('../routes/rolesRoute'));
        this.app.use(this.productosPath, require('../routes/productosRoute'));
        this.app.use(this.cartPath, require('../routes/cartRoute'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto:', this.port);
        });
    }

}

module.exports = Server;