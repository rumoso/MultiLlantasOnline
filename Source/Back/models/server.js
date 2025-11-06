const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const { dbConnection } = require('../database/config');
// Importar las asociaciones
require('./asociaciones');

class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.authPath = '/api/auth';
        this.rolesPath = '/api/roles';
        this.usersPath = '/api/users';
        this.actions = '/api/actions',
        this.sucursales = '/api/sucursales',
        this.productos = '/api/productos',
        this.clientes = '/api/clientes',
        this.vendedores = '/api/vendedores',
        this.materiasprimas = '/api/materiasprimas',
        this.addresses = '/api/addresses',
        this.productosbase = '/api/productosbase',
        this.productosAgranel = '/api/productosagranel',
        this.proveedores = '/api/proveedores',
        this.ordenesCompra = '/api/ordenescompra',
        this.insumos = '/api/insumos',
        this.entradas_salidas = '/api/entradas_salidas',
        this.ventas = '/api/ventas',
        this.productosfinal = '/api/productosfinal',
        this.reportes = '/api/reportes',
        this.assets = '/api/assets',
        this.origenes = '/api/origenes',
        this.configuraciones = '/api/configuraciones',
        this.almacenes = '/api/almacenes',
        this.cajas = '/api/cajas',
        this.pedidos_clientes = '/api/pedidos_clientes',
        this.promociones = '/api/promociones';
        this.cobranza_credito = '/api/cobranza_credito',
        this.cortescaja = '/api/cortescaja',
        this.tickets = '/api/tickets',

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
            throw new Error( err );
        }
    }

    middlewares(){
        //CORS
        this.app.use( cors() );

        // LECTURA Y PARSEO DEL BODY
        this.app.use( express.json() );

        //DIRECTORIO PÚBLICO
        this.app.use( express.static('public') );

        this.app.use(fileUpload({
            createParentPath: true,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB max file size
            },
        }));
    }

    routes() {
        this.app.use(this.authPath, require('../routes/authRoute'));
        this.app.use(this.rolesPath, require('../routes/rolesRoute'));
        this.app.use(this.usersPath, require('../routes/usersRoute'));
        this.app.use(this.actions, require('../routes/actionsRoute'));
        this.app.use(this.sucursales, require('../routes/sucursalesRoute'));
        this.app.use(this.productos, require('../routes/productosRoute'));
        this.app.use(this.clientes, require('../routes/clientesRoute'));
        this.app.use(this.vendedores, require('../routes/vendedoresRoute'));
        this.app.use(this.materiasprimas, require('../routes/materiasprimasRoute'));
        this.app.use(this.addresses, require('../routes/addressRoute'));
        this.app.use(this.productosbase, require('../routes/productosBaseRoute'));
        this.app.use(this.productosAgranel, require('../routes/productosAgranelRoute'));
        this.app.use(this.proveedores, require('../routes/proveedoresRoute'));
        this.app.use(this.ordenesCompra, require('../routes/ordenesCompraRoute'));
        this.app.use(this.insumos, require('../routes/insumosRoute'));
        this.app.use(this.entradas_salidas, require('../routes/entradasSalidasRoute'));
        this.app.use(this.ventas, require('../routes/ventasRoute'));
        this.app.use(this.productosfinal, require('../routes/productosFinalRoute'));
        this.app.use(this.reportes, require('../routes/reportesRoute'));
        this.app.use(this.assets, require('../routes/assetsRoute'));
        this.app.use(this.origenes, require('../routes/origenesRoute'));
        this.app.use(this.configuraciones, require('../routes/configuracionesRoute'));
        this.app.use(this.almacenes, require('../routes/almacenesRoute'));
        this.app.use(this.cajas, require('../routes/cajasRoute'));
        this.app.use(this.pedidos_clientes, require('../routes/pedidosClientesRoute'));
        this.app.use(this.promociones, require('../routes/promocionesRoute'));
        this.app.use(this.cobranza_credito, require('../routes/cobranzaCreditoRoute'));
        this.app.use(this.cortescaja, require('../routes/cortesCajaRoute'));
        this.app.use(this.tickets, require('../routes/ticketsRoute'));
    }

    listen() {
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en el puerto:', this.port );
        } );
    }

}

module.exports = Server;