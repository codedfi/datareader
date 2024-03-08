const OrderModel = require('../order/model')
const { formatUnits } = require('viem')
const axios = require('axios')
const { cacheAssets, cachePrice } = require('../../services/baseServices')
const redis = require('../../plugins/redis')

const getTransactions = async (ctx) => {
    try {
        await cacheAssets()
        const { startTime = 0, endTime = 0, user=''} = ctx.request.query
        if(!startTime || !endTime) {
            return ctx.fail('startTime and endTime is required')
        }
        let options  = {
            channel: 'chainge',
            startTime: {
                '$gte': startTime,
                '$lt': endTime
            },
            "commonOrder.toChain": 'ROLLUX',
            "orderStatus.status": "Succeeded"
        }
        if(user) {
            const regex = new RegExp(user, 'i')
            options['sender'] = { $regex: regex }
        }
        const orderList = await OrderModel.find(options).sort('startTime').exec()
        const formatResult = []
        const length = orderList.length

        const assetsMapStr = await redis.get('dappv2:activity:assetsMap')

        if(assetsMapStr && length > 0) {
            const assetsMap = JSON.parse(assetsMapStr)

            orderList.forEach((item) => {
                const { sourceCerts, toChain, toIndex, toAddr } = item.commonOrder
                const { fromChain, fromIndex, fromAmount, fromAddr, certHash } = sourceCerts[0]
                const { timeStamp = 0, amountOut = '', execHash = '' } = item.orderStatus
                

                const fromSymbolObj = assetsMap[fromIndex]
                const fromSymbol = fromSymbolObj.symbol
                const fromDecimals = fromSymbolObj.contracts[fromChain].decimals
                const fromAmountReadable = formatUnits(fromAmount, fromDecimals)

                const toSymbolObj = assetsMap[toIndex]
                const toSymbol = toSymbolObj.symbol
                const toDecimals = toSymbolObj.contracts[toChain].decimals
                const toAmountReadable = formatUnits(amountOut, toDecimals)

                formatResult.push({
                    timeStamp: timeStamp,
                    fromChain: fromChain,
                    fromSymbol: fromSymbol,
                    fromAmount: fromAmountReadable,
                    fromAddress: fromAddr,
                    fromHash: certHash,
                    toChain: toChain,
                    toSymbol: toSymbol,
                    toAmount: toAmountReadable,
                    toAddress: toAddr,
                    toHash: execHash
                })
            })
        }

        ctx.success({
            total: length,
            list: formatResult
        });
    } catch(error) {
        console.log('order:getTransactions', error)
        throw error
    }
}

const checkTransactions = async () => {
    try {
        await cacheAssets()
        await cachePrice()

        // Those who have checked the order will not check it again
        let checkedOrderId = []
        const checkedOrderIdStr =  await redis.get(`dappv2:activity:checkedOrderIds`)
        if(checkedOrderIdStr) {
            checkedOrderId = JSON.parse(checkedOrderIdStr)
        }

        let options  = {
            id: {
                $not: {
                    $in: checkedOrderId
                }
            },
            channel: 'chainge',
            startTime: {
                '$gte': 1707252760
            },
            "commonOrder.toChain": 'ROLLUX',
            "orderStatus.status": "Succeeded"
        }
        const orderList = await OrderModel.find(options).exec()
        const formatResult = []
        const pushedOrderId = [...checkedOrderId]
        const length = orderList.length

        const assetsMapStr = await redis.get('dappv2:activity:assetsMap')
        const priceMapStr = await redis.get('dappv2:activity:priceMap')

        if(assetsMapStr && length > 0) {
            const assetsMap = JSON.parse(assetsMapStr)
            const priceMap = JSON.parse(priceMapStr)

            for(let i=0; i< length; i++) {
                const item = orderList[i]
                const { sourceCerts, toChain, toIndex, toAddr } = item.commonOrder
                const { fromChain, fromIndex, fromAmount, fromAddr, certHash } = sourceCerts[0]
                const { timeStamp = 0, amountOut = '', execHash = '' } = item.orderStatus
                
                const fromSymbolObj = assetsMap[fromIndex]
                const fromSymbol = fromSymbolObj.symbol
                const fromDecimals = fromSymbolObj.contracts[fromChain].decimals
                const fromContractAddress = fromSymbolObj.contracts[fromChain].address
                const fromAmountReadable = formatUnits(fromAmount, fromDecimals)

                const toSymbolObj = assetsMap[toIndex]
                const toSymbol = toSymbolObj.symbol
                const toDecimals = toSymbolObj.contracts[toChain].decimals
                const toContractAddress = toSymbolObj.contracts[toChain].address
                const toAmountReadable = formatUnits(amountOut, toDecimals)

                let curPrice = priceMap[fromSymbol] || '0'
                const amountUsdt = fromAmountReadable * curPrice
                // If the information exceeds the threshold, push the information
                if(amountUsdt > 1000) {
                    formatResult.push({
                        fromHash: certHash,
                        fromAddress: fromAddr,
                        fromAmount: fromAmountReadable,
                        fromChain: fromChain,
                        fromSymbol: fromSymbol
                    })
                }
                // Caching the order id indicates that the order has already been pushed
                pushedOrderId.push(item.id)
            }
        }
        await redis.set(`dappv2:activity:checkedOrderIds`, JSON.stringify(pushedOrderId))
        return formatResult
    } catch(error) {
        console.log('order:checkTransactions', error)
        throw error
    }
}

module.exports =  {
    checkTransactions,
    'get /getTransactions isWhite': getTransactions
}