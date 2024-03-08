const { Sequelize, DataTypes } = require('sequelize')
const config = require("../config")

const { username, password, host, port, database } = config.mysql

const sequelize = new Sequelize({
    dialect: 'mysql',
    username: username,
    password: password,
    host: host,
    port: port,
    database: database,

    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
        freezeTableName: true, 
        timestamps: false
    }
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Mysql: Connection has been established successfully.');
    } catch (error) {
        console.error('Mysql: Unable to connect to the database:', error);
    }
}

testConnection()

module.exports = sequelize