const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        // Rutas del E-Commerce de Llantas
        this.authPath = '/api/auth';
        this.productosPath = '/api/productos';
        this.productosPath = '/api/productos';
        this.cartPath = '/api/cart';
        this.ordersPath = '/api/orders';
        this.favoritesPath = '/api/favorites';

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
        // Cabeceras de seguridad (API pura, sin CSP porque no sirve HTML renderizado)
        this.app.use(helmet({
            contentSecurityPolicy: false,
            crossOriginResourcePolicy: { policy: 'cross-origin' }
        }));

        //CORS
        const isProd = process.env.NODE_ENV === 'production';
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
            : null;

        const corsOrigin = isProd
            ? (allowedOrigins || []) // producción: exige ALLOWED_ORIGINS explícito, nunca '*'
            : (origin, callback) => {
                // desarrollo: cualquier puerto de localhost/127.0.0.1 (ng serve cambia de puerto seguido),
                // o lo que diga ALLOWED_ORIGINS si está definido
                if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || (allowedOrigins && allowedOrigins.includes(origin))) {
                    return callback(null, true);
                }
                callback(new Error('Origen no permitido por CORS'));
            };

        this.app.use(cors({
            origin: corsOrigin, // Lista explícita (nunca '*'): credentials:true lo exige
            credentials: true, // Permitir envío de cookies
            allowedHeaders: ['Content-Type', 'Authorization', 'x-token', 'x-guest-id'] // Permitir headers personalizados
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
        this.app.use(this.productosPath, require('../routes/productosRoute'));
        this.app.use(this.cartPath, require('../routes/cartRoute'));
        this.app.use(this.ordersPath, require('../routes/ordersRoute'));
        this.app.use(this.favoritesPath, require('../routes/favoritesRoute'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto:', this.port);
        });
    }

}

module.exports = Server;