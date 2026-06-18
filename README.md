# IronWall API

> Real-time anomaly detection API for Operational Technology (OT) networks, built with Node.js and gRPC.

---

## Sobre o Projeto

O **IronWall** é um sistema de detecção de anomalias em tempo real para redes de Tecnologia Operacional (OT). Desenvolvido como TCC, o sistema monitora fluxos de dados de automação industrial (sensores, PLCs, gateways IIoT) para identificar padrões de ataque como **Man-in-the-Middle**, injeção de falsos comandos e **Replay attacks** que possam comprometer linhas de produção.

---

## Arquitetura

O sistema é composto por duas camadas de processamento:

**Camada 1 — Authenticator**
Valida a origem e integridade dos pacotes recebidos. Lê apenas os headers do buffer para autenticar o dispositivo. Pacotes inválidos são descartados imediatamente, protegendo contra ataques DoS.

**Camada 2 — Isolation Forest (Motor de ML)**
Algoritmo de Machine Learning que isola anomalias nos dados dos sensores. Ideal para ambientes industriais onde ataques são raros e desconhecidos (Zero-day). Executa em Worker Threads para não bloquear o loop principal da API.

```
Dispositivo Industrial (PLC/Gateway)
        ↓
  Node.js Backend (Buffer binário)
        ↓
  Camada 1 — Authenticator
        ↓
  Camada 2 — Isolation Forest (Worker Thread)
        ↓
  ┌─────────────┬──────────────────┐
  │   Normal    │    Anomalia      │
  │  Log + Dashboard  │  Alerta + Contenção  │
  └─────────────┴──────────────────┘
```

---

## Tech Stack

- **Runtime:** Node.js
- **Protocolo:** gRPC (`@grpc/grpc-js`)
- **Processamento:** Binary Buffers + Worker Threads
- **Algoritmo ML:** Isolation Forest
- **Definição de contrato:** Protocol Buffers (`.proto`)

---

## 📁 Estrutura do Projeto

```
sentinela-industrial/
├── proto/
│   └── sensor.proto          # Contrato gRPC
├── src/
│   ├── server.js             # Servidor gRPC principal
│   ├── authenticator.js      # Camada 1 — Validação
│   └── worker.js             # Camada 2 — ML (Worker Thread)
├── package.json
└── .env
```

---

## Como Rodar

### Pré-requisitos

- Node.js v18+
- Docker
- npm

### Instalação

```bash
# Clone o repositório
git clone https://github.com/AryelaRibeiro/sentinela-industrial-api.git
cd sentinela-industrial-api

# Instale as dependências
npm install
```

### Rodando o servidor

```bash
node src/server.js
```

Saída esperada:
```
Sentinela Industrial rodando na porta 50051
```

### Testando com o cliente

```bash
node client-teste.js
```

---

## API gRPC

### Serviços disponíveis

| Método | Descrição |
|---|---
| `EnviarDados` | Recebe métricas do sensor e retorna score de anomalia |
| `StatusSistema` | Verifica saúde do Authenticator e do motor de ML |

### Exemplo de request (`EnviarDados`)

```json
{
  "device_id": "plc-001",
  "token": "token-plc-001",
  "temperatura": 76.5,
  "pressao": 102.3,
  "frequencia": 50.1,
  "timestamp": 1715700000000
}
```

### Exemplo de response

```json
{
  "anomalia": false,
  "score": 0.07,
  "acao": "normal"
}
```

### Ações possíveis

| Ação | Condição |
|---|---|
| `normal` | Score abaixo do threshold |
| `alerta` | Score acima do threshold |
| `isolamento` | Score muito elevado (ataque grave) |

---

## Segurança

- Autenticação por token por dispositivo
- Descarte imediato de buffers inválidos (proteção DoS)
- Heartbeat entre camadas para garantir disponibilidade
- Em produção: utilizar TLS (`grpc.ServerCredentials.createSsl()`)

---

## Autor

Aryela Ribeiro Marques
Desenvolvido como Trabalho de Conclusão de Curso (TCC).

---

## 📄 Licença

MIT
