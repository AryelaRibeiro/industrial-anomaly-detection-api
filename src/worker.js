const { workerData, parentPort } = require('worker_threads');

// Isolation Forest simplificado
function calcularScore(dados) {
  const { temperatura, pressao, frequencia } = dados;

  
  // TODO: inplementar ML
  // Limites normais (ajuste com dados reais do TCC)
  const desvios = [
    Math.abs(temperatura - 75) / 20,
    Math.abs(pressao - 100) / 30,
    Math.abs(frequencia - 50) / 10,
  ];

  const score = desvios.reduce((a, b) => a + b, 0) / desvios.length;
  return score; // > 1.0 = anomalia
}

const score = calcularScore(workerData);
parentPort.postMessage(score);