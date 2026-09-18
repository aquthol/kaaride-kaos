/** All player-facing strings (Estonian). */
export const TEXT = {
  title: 'Rasmuse Kääride Kaos',
  subtitle: 'Juuksurisalongi kiirabi',
  start: 'Alusta',
  retry: 'Proovi uuesti',
  toMenu: 'Menüüsse',
  loading: 'Laadin…',
  controlsTitle: 'Juhtimine',
  recipesTitle: 'Soengud',
  goalTitle: 'Kuidas mängida',
  goalSteps: [
    'Vii klient jaamadesse õiges järjekorras',
    'Hoia E all, et tööd teha',
    'Lõpuks kassasse — kiirus annab jootraha',
  ] as const,
  modeTitle: 'Mängijaid',
  modes: ['1 mängija', '2 mängijat'] as const,
  actionColumn: 'Tegevus',
  /** One row per action: what it does, player 1's key, player 2's key. */
  controls: [
    { action: 'liigu', p1: 'WASD', p2: 'Nooled' },
    { action: 'võta / pane maha', p1: 'Tühik', p2: 'Enter' },
    { action: 'tööta (hoia all)', p1: 'E', p2: 'Parem Shift' },
    { action: 'söösta', p1: 'Shift', p2: 'Numpad 0' },
  ] as const,
  howTo:
    'Vii kliendid õiges järjekorras läbi jaamade ja siis kassasse, enne kui nende kannatus otsa saab!',
  stations: {
    wait: 'Ooteala',
    wash: 'Pesukraan',
    cut: 'Lõikustool',
    colour: 'Värvimine',
    dry: 'Föön',
    checkout: 'Kassa',
  },
  levels: {
    title: 'Vali tase',
    locked: 'Lukus',
    lockedHint: 'Teeni eelmisel tasemel vähemalt üks täht',
    best: 'Parim',
    back: 'Tagasi',
    hint: 'Vali nooltega, kinnita Enteriga',
  },
  hud: {
    time: 'Aeg',
    money: 'Raha',
    served: 'Teenindatud',
  },
  startHint: 'Vali 1 või 2 ja vajuta Enter',
  audio: {
    on: 'Heli sees',
    off: 'Heli väljas',
    hint: 'M – heli sisse/välja',
  },
  banner: {
    start: 'Salong on avatud!',
    hurry: 'Viimased 30 sekundit!',
    end: 'Aeg läbi!',
  },
  nextLevel: 'Järgmine tase',
  end: {
    title: 'Päev läbi!',
    money: 'Teenitud',
    served: 'Rahul kliente',
    angry: 'Pahaseid kliente',
    /** Indexed by star count (0–3). */
    ratings: ['Järgmine kord läheb paremini!', 'Hea töö!', 'Suurepärane!', 'Kääride kuningas!'],
    keysHint: 'Enter – proovi uuesti · Esc – menüüsse',
  },
  float: {
    angry: 'Pahane!',
    burnt: 'Kõrbes!',
    done: 'Valmis!',
    hot: 'Kuum!',
  },
} as const;
