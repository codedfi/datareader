const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

const config = require("../config")
var DB_URL=`mongodb://${config.mongodb.host}:${config.mongodb.port}`

const options = {
    user: config.mongodb.user,
    pass: config.mongodb.password, 
    dbName: config.mongodb.dbName,
    authSource: config.mongodb.dbName,
    tlsCAFile: config.mongodb.tlsCAFile,
    tls: config.mongodb.tls,
    retryWrites: config.mongodb.retryWrites,
}

mongoose.connect(DB_URL, options);

const connection = mongoose.connection

connection.on('error', (err) => {
    console.log('Mongodb: Mongoose connection error: ' + err);
})

connection.on('disconnected', () => {
    console.log('Mongodb: Mongoose connection disconnected');
})

connection.once('open', () => {
    console.log('Mongodb: Mongodb are connected!')
})

module.exports = mongoose