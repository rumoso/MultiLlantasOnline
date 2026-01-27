const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Adjust path to .env
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runSpecificMigration(fileName) {
    let connection;
    try {
        console.log('Attempting to connect with env:', {
            host: process.env.SERVER,
            user: process.env.USERDB,
            database: process.env.DATABASE,
            port: process.env.PORT_SQL
        });

        connection = await mysql.createConnection({
            host: process.env.SERVER || 'localhost',
            user: process.env.USERDB,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            port: process.env.PORT_SQL || 3306,
            multipleStatements: true
        });

        console.log('✅ Connection successful');

        const filePath = path.join(__dirname, fileName);
        if (fs.existsSync(filePath)) {
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`Executing ${fileName}...`);
            await connection.query(sql);
            console.log('✅ Success!');
        } else {
            console.log(`❌ File not found: ${filePath}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

// Run the specific file for order details
runSpecificMigration('011_sp_getOrderDetails.sql');
