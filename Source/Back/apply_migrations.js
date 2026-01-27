require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const runMigration = async (connection, filePath) => {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        console.log(`Executing ${path.basename(filePath)}...`);
        // Execute the entire file contents as one query (requires multipleStatements: true)
        await connection.query(sql);
        console.log(`✅ ${path.basename(filePath)} executed successfully.`);
    } catch (error) {
        console.error(`❌ Error executing ${path.basename(filePath)}:`, error.message);
        throw error;
    }
};

(async () => {
    let connection;
    try {
        // Create a direct connection with multipleStatements enabled
        connection = await mysql.createConnection({
            host: process.env.SERVER,
            user: process.env.USERDB,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            port: process.env.PORT_SQL,
            multipleStatements: true // This is key for running scripts with SPs and delimiters
        });

        console.log('Connected to database.');

        await runMigration(connection, path.join(__dirname, 'database/migrations/010_favorites_feature.sql'));
        await runMigration(connection, path.join(__dirname, 'database/migrations/011_sp_fromGuestToUser.sql'));

        console.log('All migrations applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
})();
