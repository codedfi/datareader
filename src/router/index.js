const Router = require("koa-router");
const router = new Router({
    prefix: '/thirdparty'
});

const fs = require("fs")
const path = require("path");

const registerWhite = (app, method, path) => {
    if(!app.context.state) {
       app.context.state = Object.assign({}, app.context.state, { white: []})
    }
    let whiteList = app.context.state['white'] || []
    let whitePath = `${method.toLowerCase()}|${path.toLowerCase()}`
    whiteList = [...whiteList, whitePath]
    app.context.state['white'] = whiteList
}

const registerRouter = (app) => {
    const packagePath = path.resolve(__dirname, '../controllers')
    const baseRouter = fs.readdirSync(packagePath)
    baseRouter.forEach(dirName => {
        const controllerPath = path.resolve(packagePath, dirName, 'index.js')
        const routerInfo = require(controllerPath)
        const keys = Object.keys(routerInfo)
        keys.forEach(item => {
            if(item.indexOf(' ') > -1) {
                let [method, pathStr = '', isWhite=''] = item.split(' ')
                pathStr = `/${dirName}${pathStr === '/' ? '' : pathStr}`
                if(isWhite) {
                    registerWhite(app, method, pathStr)
                }
                router[method](pathStr, async (ctx) => routerInfo[item](ctx));
            }
        })
        app.use(router.routes()).use(router.allowedMethods());
    })
}

module.exports = registerRouter