module.exports = (option = {}) => {
    return async (ctx, next) => {
        ctx.success = (data, msg, type) => {
            ctx.type = type || option.type || 'json'
            ctx.body = {
                code: option.successCode || 0,
                msg: msg || option.successMsg || 'success',
                data
            }
        }
        ctx.fail = (msg, code) => {
            ctx.type = option.type || 'json'
            ctx.body = {
                code: code || 3,
                msg: msg || option.failMsg || 'fail'
            }
        }
        await next()
    }
}