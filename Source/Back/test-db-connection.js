require('dotenv').config();
const { dbConnection } = require('./database/config');

console.log('Intentando conectar a la base de datos...');
console.log(`Host: ${process.env.SERVER}`);
console.log(`Port: ${process.env.PORT_SQL}`);
console.log(`Database: ${process.env.DATABASE}`);
console.log(`User: ${process.env.USERDB}`);

(async () => {
    try {
        await dbConnection.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente.');

        // Listar tablas para confirmar acceso
        const [results, metadata] = await dbConnection.query("SHOW TABLES");
        console.log('Tablas en la base de datos:');
        console.table(results.map(r => Object.values(r)[0]));

        process.exit(0);
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
        process.exit(1);
    }
})();
