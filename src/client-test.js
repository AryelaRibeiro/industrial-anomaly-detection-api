
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('./proto/sensor.proto');
const proto = grpc.loadPackageDefinition(packageDef).sentinela;
const client = new proto.SensorService('localhost:50051', grpc.credentials.createInsecure());

// Simula dados normais
client.enviarDados({
  device_id: 'plc-001',
  token: 'token-plc-001',
  temperatura: 76,
  pressao: 105,
  frequencia: 51,
  timestamp: Date.now()
}, (err, res) => {
  console.log('Normal:', res);
});

// Simula anomalia
client.enviarDados({
  device_id: 'plc-001',
  token: 'token-plc-001',
  temperatura: 200,  // valor absurdo
  pressao: 300,
  frequencia: 5,
  timestamp: Date.now()
}, (err, res) => {
  console.log('Anomalia:', res);
});