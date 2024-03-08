const schedule = require('node-schedule');
const { WebSocketServer } = require('ws')
const { checkTransactions } = require('../controllers/syscoin')

const setSyscoinWs = () => {
    const wss = new WebSocketServer({ port: 8080, path: '/syscoin_rollux' });
    wss.on('connection', async (ws) => {
        ws.on('close', () => {
            console.log('client closed')
        })
        ws.on('error', console.error);

        ws.on('message', (data) => {
            console.log('received: %s', data);
        });
        // Push it regularly, once per minute
        schedule.scheduleJob('* * * * *', async () => {
            const result = await checkTransactions()
            ws.send(JSON.stringify(result));
        });
    });
}

setSyscoinWs()
