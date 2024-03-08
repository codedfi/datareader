const Model = require('./model/index')

const getAllPrice = async () => {
    try {
        const priceList = await Model.find().exec()
        return priceList
    } catch(error) {
        console.log('cmcprice:getAllPrice', error)
        throw error
    }
}

module.exports = {
    getAllPrice
}