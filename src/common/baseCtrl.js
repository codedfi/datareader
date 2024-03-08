const { checkType } = require("../utils/utils")

const formatWhereForGet = (query, schemaKeyObj) => {
    const where = []
    const keys = Object.keys(query)
    keys.forEach(item => {
        if(schemaKeyObj.includes(item)) {
            where.push(item)
        }
    });
    const whereObj = {}
    where.forEach(item => {
        whereObj[item] = query[item]
    })
    return whereObj
} 

const generateBaseMethod = (Model) => {
    const get = async (ctx) => {
        try {
            let { pageSize, page = 1} = ctx.request.query

            const schemaValObj = Object.values(Model.schema.obj)
            const schemaKeyObj = Object.keys(Model.schema.obj)

            let options = formatWhereForGet(ctx.request.query, schemaKeyObj)

            const total = await Model.countDocuments()
            pageSize = pageSize || total
    
            let populateStr = ''
            schemaValObj.forEach((item, index) => {
                if(checkType(item) === 'object') {
                    if(item.ref) {
                        populateStr += `${schemaKeyObj[index]} `
                        
                    }
                }
                if(checkType(item) === 'array') {
                    if(item[0].ref) {
                        populateStr += `${schemaKeyObj[index]} `
                    }
                }
            })
            populateStr = populateStr.trim()
    
            const dataList = await Model.find(options).skip((page - 1) * pageSize).limit(pageSize).populate(populateStr).exec()
            const resultObj = {
                total: total,
                pageSize: pageSize,
                page: page,
                list: dataList
            }
            ctx.success(resultObj)
        } catch(error) {
            console.log('get Model List error: ', error)
            throw error
        }
    }
    
    const modify = async (ctx) => {
        try {
            const params = ctx.request.body
            let options = {}
            let curModel = null
    
            const tempParams = {...params}
            delete tempParams._id
            const tempParamKey = Object.keys(tempParams)
            const schemaObj = Object.keys(Model.schema.obj)
    
            if(params._id) {
                options = Object.assign({}, options, {_id: params._id})
                curModel = await Model.findOne(options).exec()
                if(curModel) {
                    tempParamKey.forEach(key => {
                        if(schemaObj.includes(key)) {
                            curModel[key] = tempParams[key]
                        }
                    });
                } else {
                    ctx.fail('The record does not exist')
                }          
            } else {
                let tempModelObj = {}
                tempParamKey.forEach(key => {
                    if(schemaObj.includes(key)) {
                        tempModelObj[key] = tempParams[key]
                    }
                });
                curModel = new Model(tempModelObj)
            }
            const result = await curModel.save()
            ctx.success(result)
        } catch(error) {
            console.log('modify Model error: ', error)
            throw error
        }
    } 
    
    const remove = async (ctx) => {
        try {
            const { id } = ctx.params
            const options = { _id: id}
            const curModel = await Model.findOne(options).exec()
            if(curModel) {
                await curModel.remove()
                ctx.success(true, 'Remove successful')
            } else {
                ctx.fail('The record does not exist')
            }
        } catch(error) {
            console.log('remove Model error: ', error)
            throw error
        }
    }
    
    const detail = async (ctx) => {
        try {
            const { id } = ctx.params
            const options = { _id: id}
            const curModel = await Model.findOne(options).exec()
            if(curModel) {
                ctx.success(curModel)
            } else {
                ctx.fail('The record does not exist')
            }
        } catch(error) {
            console.log('get Model detail error: ', error)
            throw error
        }
    }

    return {
        get,
        modify,
        remove,
        detail
    }
}

module.exports = generateBaseMethod