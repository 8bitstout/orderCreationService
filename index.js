const express = require('express');
const bodyParser = require('body-parser');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const app = express();
const port = 3001;

const SCHEDULE_ORDER_PUSH_ADDRESS = 'localhost:50051';

const PROTO_PATH = __dirname + '/order.proto';

let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

let { orderPushScheduler } = grpc.loadPackageDefinition(packageDefinition);
let client = new orderPushScheduler.ScheduleOrderPush(SCHEDULE_ORDER_PUSH_ADDRESS, grpc.credentials.createInsecure());

const Order = (storeNumber, orderNumber, fulfillmentDate, fulfillmentTime, ppc) => ({
    storeNumber,
    orderNumber,
    fulfillmentDate,
    fulfillmentTime,
    ppc
});

const stores = {};

for (let i = 1; i < 400; ++i) {
    stores[i] = { orders: {} };
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Server Running');
});

app.get('/api/stores/:storeId/orders', (req, res)  => {
    const store = stores[req.params.storeId];
    const ordersArray = Object.keys(store.orders).map(key => store.orders[key]);
    res.send(ordersArray);
});

app.get('/api/stores/:storeId/orders/:orderId', (req, res) => {
    const store = stores[req.params.storeId];
    res.send(store.orders[req.params.id]);
});

app.post('/api/stores/:storeId/orders', async (req, res) => {
    const storeId = req.params.storeId;
    const store = stores[storeId];
    const { ppc } = req.body;
    const orderNumber = Object.keys(store.orders).length + 1;
    console.log('Creating new order: ', orderNumber);
    const order = Order(req.params.storeId, orderNumber, new Date(), new Date(), ppc);
    client.schedulePushNotification({ id: orderNumber, isValid: true, createAt: new Date() }, (err, response) => {
        if (err) {
            console.log('error: ', err);
            res.send(err);
            return;
        }
        stores[storeId]['orders'][orderNumber] = Order;
        res.send({...response, order });
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
