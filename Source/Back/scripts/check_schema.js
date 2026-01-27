require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { dbConnection } = require('../database/config');

const checkSchema = async () => {
    try {
        await dbConnection.authenticate();
        const [results] = await dbConnection.query('DESCRIBE productos');
        console.log(results);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSchema();
