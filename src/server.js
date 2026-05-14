import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { Worker } from 'worker_threads';
import { autenticar } from './authenticator.js';

const packageDef = protoLoader.loadSync('./proto/sensor.proto');
const proto = grpc.loadPackageDefinition(packageDef).sentinela;

const THRESHOLD = 1.0; // Limite do score de anomalia

function enviarDados(call, callback) {
  const { device_id, token, temperatura, pressao, frequencia } = call.request;

  // CAMADA 1 — Autenticação
  const auth = autenticar(device_id, token);
  if (!auth.valido) {
    return callback({ code: grpc.status.UNAUTHENTICATED, message: auth.motivo });
  }

  // CAMADA 2 — ML via Worker Thread (não bloqueia o loop)
  const worker = new Worker('./src/worker.js', {
    workerData: { temperatura, pressao, frequencia }
  });

  worker.on('message', (score) => {
    const anomalia = score > THRESHOLD;
    const acao = anomalia
      ? (score > 2.0 ? 'isolamento' : 'alerta')
      : 'normal';

    console.log(`[${device_id}] Score: ${score.toFixed(2)} → ${acao}`);

    callback(null, { anomalia, score, acao });
  });

  worker.on('error', (err) => {
    callback({ code: grpc.status.INTERNAL, message: err.message });
  });
}

function statusSistema(call, callback) {
  callback(null, { authenticator_ok: true, ml_engine_ok: true });
}

const server = new grpc.Server();
server.addService(proto.SensorService.service, { enviarDados, statusSistema });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Sentinela Industrial rodando na porta 50051');
  server.start();
});