const baseConfig = {
    default: {
        port: process.env.PORT,
    },
    development: {
        redis: {
            port: 6379,
            host: "127.0.0.1",
            password: ''
        },
        mongodb: {
            port: 27017,
            dbName: '',
            host: '127.0.0.1',
            user: '',
            password: '',
            tlsCAFile: '',
            tls: false,
            retryWrites: false
        },
        mysql: {
            username: '',
            password: '',
            host: '',
            port: 3306,
            database: '',
        }
    },
    production: {
        redis: {
            port: 6379,
            host: "127.0.0.1",
            password: ''
        },
        mongodb: {
            port: 27017,
            dbName: '',
            host: '',
            user: '',
            password: '',
            tlsCAFile: '',
            tls: true,
            retryWrites: false
        },
        mysql: {
            username: '',
            password: '',
            host: '',
            port: 3306,
            database: '',
        }
    }
}

const nodeEnv = process.env.NODE_ENV || 'development'
let config = Object.assign({}, baseConfig.default, baseConfig[nodeEnv])

module.exports = config