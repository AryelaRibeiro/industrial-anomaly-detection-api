// Valida apenas os primeiros bytes do buffer — conforme a arquitetura
const TOKENS_VALIDOS = new Set(['token-plc-001', 'token-plc-002']);

export function autenticar(deviceId, token) {
  if (!TOKENS_VALIDOS.has(token)) {
    return { valido: false, motivo: 'Token inválido' };
  }
  if (!deviceId || deviceId.length === 0) {
    return { valido: false, motivo: 'Device ID ausente' };
  }
  return { valido: true };
}
