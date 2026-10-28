import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTema } from '../tema.js';

// Ícones desenhados em SVG (os mesmos do protótipo web), sem biblioteca externa.
const DESENHOS = {
  inicio: [['path', 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z']],
  pontos: [
    ['path', 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z'],
    ['circle', { cx: 12, cy: 9.5, r: 2.5 }],
  ],
  gota: [['path', 'M12 3c-3.5 4.6-6.5 8.2-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 11.2 15.5 7.6 12 3z']],
  mais: [['path', 'M12 5v14M5 12h14']],
  historico: [['path', 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01']],
  dicas: [['path', 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z']],
  ajustes: [
    ['path', 'M4 7h9M17 7h3M4 17h3M11 17h9'],
    ['circle', { cx: 15, cy: 7, r: 2 }],
    ['circle', { cx: 9, cy: 17, r: 2 }],
  ],
  voltar: [['path', 'M15 18l-6-6 6-6']],
  seta: [['path', 'M9 18l6-6-6-6']],
  lixo: [['path', 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3']],
  editar: [['path', 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4']],
  rota: [['path', 'M3 11l18-8-8 18-2-8-8-2z']],
  busca: [
    ['circle', { cx: 11, cy: 11, r: 7 }],
    ['path', 'M20 20l-3.5-3.5'],
  ],
  check: [['path', 'M5 12.5l4.5 4.5L19 7']],
  fechar: [['path', 'M6 6l12 12M18 6L6 18']],
  relogio: [
    ['circle', { cx: 12, cy: 12, r: 9 }],
    ['path', 'M12 7v5l3 2'],
  ],
  calendario: [
    ['rect', { x: 3, y: 5, width: 18, height: 16, rx: 2 }],
    ['path', 'M3 10h18M8 3v4M16 3v4'],
  ],
  garrafa: [['path', 'M10 3h4v3l2 3v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z M8 13h8']],
  info: [
    ['circle', { cx: 12, cy: 12, r: 9 }],
    ['path', 'M12 11v5M12 8h.01'],
  ],
  subiu: [['path', 'M12 19V5M6 11l6-6 6 6']],
  desceu: [['path', 'M12 5v14M6 13l6 6 6-6']],
  tabela: [['path', 'M4 5h16v14H4zM4 10h16M4 15h16M10 5v14']],
  grafico: [['path', 'M5 20V10M12 20V4M19 20v-7']],
  usuario: [
    ['circle', { cx: 12, cy: 8, r: 4 }],
    ['path', 'M4 21a8 8 0 0 1 16 0'],
  ],
  sair: [['path', 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11']],
};

export default function Icone({ nome, tamanho = 22, cor }) {
  const tema = useTema();
  const traco = cor ?? tema.tinta2;
  const partes = DESENHOS[nome] ?? [];

  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      {partes.map(([tipo, valor], i) => {
        const comuns = { stroke: traco, strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };
        if (tipo === 'path') return <Path key={i} d={valor} {...comuns} />;
        if (tipo === 'circle') return <Circle key={i} {...valor} {...comuns} />;
        return <Rect key={i} {...valor} {...comuns} />;
      })}
    </Svg>
  );
}
