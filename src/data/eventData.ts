export interface ArchetypeOption {
  value: string;
  title: string;
  subtitle: string;
  description: string;
  accent: 'cobalt' | 'violet';
}

export interface DressCodeStyle {
  id: 'elegante' | 'urbano' | 'fusion';
  label: string;
  title: string;
  summary: string;
  pieces: string[];
  avoid: string;
}

export const EVENT_CONFIG = {
  brandName: 'Órbita-X',
  subtitle: 'Año 3027 · Crucero Aristocrático Nebulosa Real',
  eventDateISO: '2027-01-03T17:00:00+01:00',
  dateLabel: '3 de enero',
  weekdayYearLabel: 'Domingo 2027',
  timeLabel: '17:00h',
  durationLabel: 'Duración estimada del Cluedo en Vivo: 90 – 120 minutos.',
  venueName: 'Crucero Nebulosa Real',
  venueAddress: 'Nuestra casa · Molins de Rei',
  coordinates: '41.4139° N · 2.0163° E',
  web3FormsKey: '30ff5d7e-c034-41c5-9fe6-2d233bf95a21',
} as const;

export const GUESTS = [
  'Sergio Romera',
  'Miriam Gómez',
  'Marc Vallès (Viri)',
  'Sara García',
  'Mike',
  'Bob',
  'JM (Javi Morillas)',
  'Irene',
  'Adri',
  'Sara (pareja de Adri)',
  'Raúl',
] as const;

export const RUMOR_TARGETS = [
  ...GUESTS,
  'Varios / Todo el grupo',
] as const;

export const ARCHETYPES: ArchetypeOption[] = [
  {
    value: 'Estratega / Manipulador',
    title: 'Estratega',
    subtitle: 'Pactos en la sombra',
    description: 'Me encanta mentir, cerrar alianzas secretas y liar al personal sin levantar sospechas.',
    accent: 'cobalt',
  },
  {
    value: 'Estrella Dramática',
    title: 'Estrella Dramática',
    subtitle: 'Foco y escándalo',
    description: 'Quiero protagonismo, entradas triunfales, giros teatrales y drama sin freno.',
    accent: 'violet',
  },
  {
    value: 'Espía / Cotilla',
    title: 'Espía de la Corte',
    subtitle: 'Información es poder',
    description: 'Prefiero observar, recopilar secretos ajenos y negociar información en el momento justo.',
    accent: 'cobalt',
  },
  {
    value: 'Caótico / Improvisador',
    title: 'Caótico / Improvisador',
    subtitle: 'Factor impredecible',
    description: 'Me adapto a lo que me toque y vengo a improvisar, descolocar teorías y reírme.',
    accent: 'violet',
  },
];

export const DRESS_CODE_STYLES: DressCodeStyle[] = [
  {
    id: 'elegante',
    label: 'Base elegante',
    title: 'Alta sociedad galáctica',
    summary: 'La silueta parte de la gala clásica con tejidos nobles y presencia impecable, como la aristocracia de Los Bridgerton.',
    pieces: [
      'Traje estructurado, americana entallada o vestido de noche',
      'Camisa satinada, cuello alto o pajarita llamativa',
      'Terciopelo, seda oscura, brocados o joyería protagonista',
    ],
    avoid: 'Ropa puramente deportiva de diario sin ningún elemento de gala.',
  },
  {
    id: 'urbano',
    label: 'Toque urbano y espacial',
    title: 'Pulso de club futurista',
    summary: 'Rompe el protocolo clásico con guiños de Blade Runner: calle, energía nocturna y destellos orbitales.',
    pieces: [
      'Zapatillas o bambas limpias combinadas con traje o vestido',
      'Gafas de sol futuristas, cadenas finas o detalles metalizados',
      'Acentos en azul eléctrico, cromo, plata o morado profundo',
    ],
    avoid: 'Disfraces literales de astronauta de plástico o estética de carnaval.',
  },
  {
    id: 'fusion',
    label: 'Fórmula ganadora',
    title: 'Aristocracia en órbita',
    summary: 'La combinación ideal mezcla una prenda formal impecable con dos accesorios urbanos o metalizados.',
    pieces: [
      'Traje negro o azul noche + bambas blancas o plateadas + gafas oscuras',
      'Vestido de terciopelo o satén + botas urbanas + pendientes geométricos',
      'Camisa elegante + chaqueta con brillo sutil + joyería plateada',
    ],
    avoid: 'Ir 100% rígido sin ningún contraste urbano o futurista.',
  },
];
