const OrderModel = require('../order/model')
const axios = require('axios')
const { cacheAssets, cachePrice } = require('../../services/baseServices')
const redis = require('../../plugins/redis')
const { formatAmount, getTokenByIndex } = require('../../utils/utils')

const getTradmingVolumeByTime = async (ctx) => {
    try {
        await cacheAssets()
        await cachePrice()

        // type: 24_h 30_d
        const { timeType='24_h' } = ctx.request.query
        const [time, type] = timeType.split('_')

        let totoalSeconds = 0
        const endTime = parseInt((new Date().getTime() / 1000))
        if(type === 'h') {
            totoalSeconds = time * 3600
        } else {
            totoalSeconds = time * 24 * 3600
        }
        let startTime = endTime - totoalSeconds

        let options  = {
            channel: 'chaingeappv1',
            startTime: {
                '$gte': startTime,
                '$lt': endTime
            },
            "orderStatus.status": "Succeeded"
        }
        const orderList = await OrderModel.find(options).sort('startTime').exec()
        let totalUsdt = 0
        if(orderList.length) {
            const assetsMapStr = await redis.get('dappv2:activity:assetsMap')
            const priceMapStr = await redis.get('dappv2:activity:priceMap')

            const assetsMap = JSON.parse(assetsMapStr)
            const priceMap = JSON.parse(priceMapStr)

            for(let i=0, length = orderList.length; i < length; i++) {
                const item = orderList[i]
                const { sourceCerts } = item.commonOrder
                const { fromAmount, fromIndex, fromChain } = sourceCerts[0]
                const amount =  formatAmount(fromAmount, fromIndex, fromChain, assetsMap)
                const {symbol : fromSymbol, contractAddress: fromContractAddress} = getTokenByIndex(fromIndex, fromChain, assetsMap)

                let curPrice = priceMap[fromSymbol] || '0'
                const tempUsdt = (+curPrice) * (+amount)
                totalUsdt += tempUsdt
            }
        }

        ctx.success({
            volume: totalUsdt,
            timeType
        });
    } catch(error) {
        console.log('chainge:getTradmingVolumeByTime', error)
        throw error
    }
}

module.exports =  {
    'get /getTradmingVolumeByTime isWhite': getTradmingVolumeByTime
}