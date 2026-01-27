const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const dbConnection = new Sequelize(process.env.DATABASE, process.env.USERDB, process.env.PASSWORD, {
  host: process.env.SERVER,
  dialect: process.env.DATABASE_TYPE,
  port: process.env.PORT_SQL,
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
    connectTimeout: 60000
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: { freezeTableName: true },
  timezone: '+00:00',
});

const dbSPConnection = mysql.createPool({
  host: process.env.SERVER,
  user: process.env.USERDB,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT_SQL,
  waitForConnections: true,
  connectionLimit: 30,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

module.exports = {
  dbConnection,
  dbSPConnection
}