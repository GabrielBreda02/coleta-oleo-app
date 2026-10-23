import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { useTema } from '../tema.js';

// Garrafa PET que "enche" de óleo conforme o progresso da meta do mês.
const CORPO = 'M31 14H49V26C49 34 66 40 66 56V140Q66 152 54 152H26Q14 152 14 140V56C14 40 31 34 31 26Z';
const TOPO_OLEO = 30;
const FUNDO = 152;

export default function MedidorGarrafa({ percentual, largura = 76 }) {
  const tema = useTema();
  const nivel = Math.min(100, Math.max(0, percentual));
  const y = FUNDO - ((FUNDO - TOPO_OLEO) * nivel) / 100;

  return (
    <Svg
      width={largura}
      height={(largura * 160) / 80}
      viewBox="0 0 80 160"
      accessibilityRole="image"
      accessibilityLabel={`Garrafa ${Math.round(percentual)}% cheia`}
    >
      <Defs>
        <ClipPath id="garrafa-corpo">
          <Path d={CORPO} />
        </ClipPath>
      </Defs>
      <Rect x="29" y="3" width="22" height="11" rx="2.5" fill={tema.marca} />
      <Path d={CORPO} fill={tema.superficie} />
      <G clipPath="url(#garrafa-corpo)">
        <Rect x="0" y={y} width="80" height="160" fill={tema.oleo} />
        <Rect x="0" y={y} width="80" height="3" fill={tema.oleoSuperficie} />
        <Path d="M14 88H66M14 120H66" stroke={tema.oleoTinta} strokeOpacity={0.22} strokeWidth={1.5} />
      </G>
      <Path d={CORPO} fill="none" stroke={tema.oleoTinta} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}
