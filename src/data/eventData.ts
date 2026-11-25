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

export interface GalaFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const GALA_FAQ_ITEMS: GalaFaqItem[] = [
  {
    id: 'experiencia',
    question: '¿Hace falta saber actuar o haber jugado antes a un Cluedo en Vivo?',
    answer:
      'Para nada. Tu ficha privada incluirá pistas claras, objetivos concretos y pequeñas misiones para romper el hielo. Puedes meterte todo lo teatral que te apetezca o jugar a tu ritmo observando y negociando.',
  },
  {
    id: 'ficha',
    question: '¿Cuándo y cómo recibiré mi personaje secreto?',
    answer:
      'Con lo que rellenes en el Paso 1 y los rumores confidenciales del Paso 2, la organización preparará tu ficha personalizada y te la enviará por privado unos días antes de la gala. Recuerda no enseñársela a nadie.',
  },
  {
    id: 'dinamica',
    question: '¿Cómo transcurre la tarde del domingo 3 de enero?',
    answer:
      'Abriremos puertas a las 17:00h con música y briefing inicial. Durante 90 a 120 minutos investigaréis pruebas escondidas, intercambiaréis secretos, formaréis alianzas y responderéis al interrogatorio final ante la Comisaria Xenia.',
  },
  {
    id: 'rumores',
    question: '¿Qué pasa con lo que envío en el Buzón de Lady Nebula?',
    answer:
      'Solo lo lee la organización para entretejer guiños, chismes y bromas internas en la trama de la gala. Puedes enviar tus soplos en modo anónimo y repetir las veces que quieras sobre distintos invitados.',
  },
  {
    id: 'silencio',
    question: '¿Qué puede saber Xenia antes del día de la fiesta?',
    answer:
      'Lo mínimo imprescindible: sabe que celebramos su cumpleaños, pero desconoce por completo la historia de Órbita-X, los roles, las pruebas y el Buzón de Lady Nebula. Silencio absoluto en grupos donde esté ella.',
  },
];

