const { formatUnits } = require("viem")

const requestIp = require('request-ip');

const getClientIp = (req) => {
    let ip = '0.0.0.0';
    ip = requestIp.getClientIp(req);
    if(ip) {
        ip = ip.replace('::ffff:', '')
    }
    return ip;
}

const checkType = (params) => {
    if(params === null) {
        return (params + '').toLowerCase()
    }
    if(typeof(params) !== 'object') {
        return typeof(params)
    }
    const toString = Object.prototype.toString
    let tempType = toString.call(params).toLowerCase()
    return tempType.split(' ')[1].replace(']', '')
}


const formatAmount = (amount, tokenIndex, chain, assetsMap) => {
    const curTokenInfo = assetsMap[tokenIndex]
    const contracts = curTokenInfo['contracts']
    const {decimals} = contracts[chain]
  
    const amountBI = BigInt(amount);
    return formatUnits(amountBI, decimals)
}

const getTokenByIndex = (tokenIndex, chain, assetsMap) => {
    const curTokenInfo = assetsMap[tokenIndex]
    const contracts = curTokenInfo['contracts']
    const { address, decimals } = contracts[chain]
    return {
        ...curTokenInfo,
        contractAddress: address,
        contractDecimals: decimals
    }
}

module.exports = {
    getClientIp,
    checkType,
    formatAmount,
    getTokenByIndex
}