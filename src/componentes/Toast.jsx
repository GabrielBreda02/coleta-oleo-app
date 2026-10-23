import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useEstilos, useTema } from '../tema.js';
import Icone from './Icone.jsx';
import Texto from './Texto.jsx';

// Mensagem rápida no rodapé (ex.: "2 L registrados" com o botão "Desfazer").
const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const temporizador = useRef(null);
  const opacidade = useRef(new Animated.Value(0)).current;
  const tema = useTema();
  const estilos = useEstilos(criarEstilos);

  const esconder = useCallback(() => {
    Animated.timing(opacidade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => setToast(null));
  }, [opacidade]);

  const mostrar = useCallback(
    (mensagem, opcoes = {}) => {
      clearTimeout(temporizador.current);
      setToast({ mensagem, ...opcoes });
      opacidade.setValue(0);
      Animated.timing(opacidade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      temporizador.current = setTimeout(esconder, opcoes.duracao ?? 5000);
    },
    [opacidade, esconder],
  );

  useEffect(() => () => clearTimeout(temporizador.current), []);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      {toast && (
        <Animated.View style={[estilos.area, { opacity: opacidade }]} pointerEvents="box-none">
          <View style={estilos.toast} accessibilityLiveRegion="polite">
            <Icone nome="check" tamanho={18} cor={tema.toastDestaque} />
            <Texto variante="medio" cor={tema.toastTexto} style={estilos.texto}>
              {toast.mensagem}
            </Texto>
            {toast.acao && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  clearTimeout(temporizador.current);
                  toast.acao.aoPressionar();
                  esconder();
                }}
                style={({ pressed }) => [estilos.acao, pressed && { opacity: 0.7 }]}
              >
                <Texto variante="pequenoForte" cor={tema.toastDestaque}>{toast.acao.rotulo}</Texto>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const criarEstilos = (t) => ({
  area: { position: 'absolute', left: 0, right: 0, bottom: 96, paddingHorizontal: 16, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 520,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
    borderRadius: 14,
    backgroundColor: t.toastFundo,
    shadowColor: t.sombra,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  texto: { flex: 1 },
  acao: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
});
