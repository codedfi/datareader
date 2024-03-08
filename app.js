const Koa = require("koa");
const logger = require('koa-logger')
const bodyParser = require("koa-bodyparser");
// const cors = require("@koa/cors")

const config = require('./src/config')
const registerRouter = require('./src/router')
const registerSession = require('./src/plugins/session')
const checkLogin = require('./src/plugins/checkLogin')
const checkApiAuth = require('./src/plugins/checkApiAuth')
const formatResponse = require('./src/plugins/formatResponse')
const catchError = require('./src/plugins/catcherror')
const redis = require('./src/plugins/redis')
const schedule = require('./src/plugins/schedule')
const webSocket = require('./src/plugins/websockets')

// init
const app = new Koa();

// port default 3010
const port = config.port || 3020;

app.use(logger())
app.use(bodyParser());
// app.use(cors())

// register session
registerSession(app)

// error catch global
app.use(catchError())

// format response
app.use(formatResponse({}))

// check login
app.use(checkLogin(app))
// check api auth
app.use(checkApiAuth(app))

// register Routers
registerRouter(app)

// schedule
schedule(app)

// listen
app.listen(port, () => {
  console.log(`Starting at port ${port}`);
});
