import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Aplicativo from './src/Aplicativo.jsx';
import { ToastProvider } from './src/componentes/Toast.jsx';
import { AutenticacaoProvider } from './src/context/AutenticacaoContext.jsx';
import { DadosProvider } from './src/context/DadosContext.jsx';
import { NavegacaoProvider } from './src/navegacao/NavegacaoContext.jsx';

// Mantém a tela de abertura enquanto as fontes e os dados carregam
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontesProntas] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    BricolageGrotesque_700Bold,
  });

  if (!fontesProntas) return null;

  return (
    <SafeAreaProvider>
      <AutenticacaoProvider>
        <DadosProvider>
          <ToastProvider>
            <NavegacaoProvider>
              <Aplicativo />
            </NavegacaoProvider>
          </ToastProvider>
        </DadosProvider>
      </AutenticacaoProvider>
    </SafeAreaProvider>
  );
}
