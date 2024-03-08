const axios = require('axios')
const redis = require('../plugins/redis')
const { getAllPrice } = require('../controllers/cmcprice')

const cacheAssets = async () => {
    try {
        const redisResult = await redis.get('dappv2:activity:assetsMap')
        if(!redisResult) {
            const result = await axios.get(`https://api2.chainge.finance/v1/getAssets`)
            if(result.status === 200) {
                const response = result.data
                if(response.code === 0) {
                    const assetList = response.data.list
                    const assetsMap = {}
                    assetList.forEach(item => {
                        assetsMap[item.index] = item
                    });
                    await redis.set('dappv2:activity:assetsMap', JSON.stringify(assetsMap), "EX", 3600 * 24)
                }
            }
        }
    } catch(error) {
        console.log('services:baseServices:cacheAssets', error)
        throw error
    }
}


const cachePrice = async () => {
    try {
        const redisResult = await redis.get('dappv2:activity:priceMap')
        if(!redisResult) {
            const priceList = await getAllPrice()
            const priceMap = {}
            priceList.forEach(item => {
                priceMap[item.symbol] = item.price
            })
            await redis.set('dappv2:activity:priceMap', JSON.stringify(priceMap), "EX", 60)
        }
    } catch(error) {
        console.log('services:baseServices:cachePrice', error)
        throw error
    }
}

module.exports = {
    cacheAssets,
    cachePrice
}