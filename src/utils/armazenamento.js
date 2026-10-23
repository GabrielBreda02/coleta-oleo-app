// Guarda os dados no aparelho com AsyncStorage (o "localStorage" do React Native).
// Se por algum motivo o AsyncStorage falhar, os dados ficam só na memória
// e o app continua funcionando.
import AsyncStorage from '@react-native-async-storage/async-storage';

export function criarArmazenamento(storage = AsyncStorage) {
  const memoria = new Map();

  return {
    async ler(chave, padrao = null) {
      let bruto = null;
      try {
        bruto = await storage.getItem(chave);
      } catch {
        bruto = null;
      }
      if (bruto == null) bruto = memoria.get(chave) ?? null;
      if (bruto == null) return padrao;
      try {
        return JSON.parse(bruto);
      } catch {
        return padrao;
      }
    },

    async salvar(chave, valor) {
      const bruto = JSON.stringify(valor);
      memoria.set(chave, bruto);
      try {
        await storage.setItem(chave, bruto);
        return true;
      } catch {
        return false;
      }
    },

    async remover(chave) {
      memoria.delete(chave);
      try {
        await storage.removeItem(chave);
      } catch {
        /* ignora */
      }
    },
  };
}

export const armazenamentoPadrao = criarArmazenamento();
