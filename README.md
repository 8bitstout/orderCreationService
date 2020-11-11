# OrderCreationService
OrderCreationService is a mock service to demonstrate how to use gRPC and protobufs
to create push messages from an order utilizing the push order delegation service.

## Compiling proto files
After installing protoc run the follwing command:
```
protoc --js_out=library=order,binary:build/gen order.proto
```
## REST API
OrderCreationService is exposed via a REST API
### Get Order
localhost:3001/api/stores/:storeId/orders/:orderId
### Get Orders
localhost:3001/api/stores/:storeId/orders
### Create Order
localhost:3001/api/stores/:storeId/orders/
```
{ "ppc": "492345" }
```