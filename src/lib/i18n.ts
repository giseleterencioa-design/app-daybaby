// Sistema de internacionalização com traduções validadas para termos pediátricos

export type Language = 'pt' | 'en' | 'es'

export type Translations = {
  [key: string]: string | { [key: string]: string }
}

// Traduções validadas com termos pediátricos corretos
export const translations: Record<Language, Translations> = {
  pt: {
    // Header
    age: 'Idade',
    week: 'Semana',
    today: 'Hoje',
    settings: 'Configurações',
    
    // Activities
    activities: 'Atividades',
    noActivities: 'Nenhuma atividade registrada',
    tapToStart: 'Toque nos botões acima para começar',
    activitiesOf: 'Atividades de',
    
    // Activity types
    breastfeeding: 'Amamentação',
    diaper: 'Fralda',
    sleep: 'Berço',
    pumping: 'Pumping',
    bottle: 'Mamadeira',
    bath: 'Banho',
    medicine: 'Medicamento',
    temperature: 'Temperatura',
    weight: 'Peso',
    height: 'Altura',
    custom: 'Personalizado',
    
    // Breastfeeding specific
    breastSide: 'Lado do Seio',
    leftBreast: 'Esquerdo',
    rightBreast: 'Direito',
    
    // Activity details
    lastUsed: 'Última vez usada',
    date: 'Data',
    time: 'Hora',
    notes: 'Notas',
    addNotes: 'Adicione observações sobre esta atividade...',
    image: 'Imagem',
    gallery: 'Galeria',
    takePhoto: 'Tirar Foto',
    saveActivity: 'Salvar Atividade',
    
    // Quantity fields
    additionalInfo: 'Informações Adicionais',
    quantity: 'Quantidade (opcional)',
    duration: 'Duração (opcional)',
    
    // Baby management
    manageBabies: 'Gerenciar Filhos',
    registeredBabies: 'Filhos Cadastrados',
    addNewBaby: 'Adicionar Novo Filho',
    babyName: 'Nome',
    birthDate: 'Data de Nascimento',
    addBaby: 'Adicionar Filho',
    
    // Custom activities
    newCustomActivity: 'Nova Atividade Personalizada',
    activityName: 'Nome da Atividade',
    chooseIcon: 'Escolha um Ícone',
    chooseColor: 'Escolha uma Cor',
    addActivity: 'Adicionar Atividade',
    
    // Navigation
    home: 'Início',
    stats: 'Estatística',
    routine: 'Rotina',
    growth: 'Crescimento',
    account: 'Conta',
    
    // Settings
    chooseTheme: 'Escolha o tema',
    chooseLanguage: 'Escolha o idioma',
    chooseColorPalette: 'Escolha a paleta de cores',
    visualMode: 'Modo Visual',
    lightMode: 'Claro',
    darkMode: 'Escuro',
    highContrastMode: 'Alto Contraste',
    autoNightMode: 'Modo Noturno Automático',
    autoNightModeDesc: 'Escurece automaticamente durante a noite',
    
    // Color palettes
    neutral: 'Neutro',
    pastel: 'Pastel',
    bold: 'Vibrante',
    mono: 'Monocromático',
    
    // Analytics
    analytics: 'Analytics',
    usersByLanguage: 'Usuários por Idioma',
    retentionByLanguage: 'Retenção por Idioma',
    mostUsedTheme: 'Tema Mais Usado',
    
    // Export
    exportReport: 'Exportar Relatório',
    exportPDF: 'Exportar PDF',
    exportSuccess: 'Relatório exportado com sucesso!',
    
    // Tabs content
    statsDescription: 'Visualize gráficos e relatórios sobre as atividades do seu bebê.',
    routineDescription: 'Crie e gerencie a rotina diária do seu bebê.',
    growthDescription: 'Acompanhe o desenvolvimento físico do seu bebê.',
    accountDescription: 'Gerencie suas configurações e preferências.',
    
    comingSoon: 'Em breve',
    chartsAndAnalytics: 'gráficos e análises detalhadas',
    routinePlanning: 'planejamento de rotina completo',
    growthCharts: 'gráficos de peso, altura e marcos',
    profileSettings: 'perfil e configurações avançadas',
  },
  
  en: {
    // Header
    age: 'Age',
    week: 'Week',
    today: 'Today',
    settings: 'Settings',
    
    // Activities
    activities: 'Activities',
    noActivities: 'No activities recorded',
    tapToStart: 'Tap the buttons above to start',
    activitiesOf: 'Activities of',
    
    // Activity types (validated pediatric terms)
    breastfeeding: 'Breastfeeding',
    diaper: 'Diaper',
    sleep: 'Crib',
    pumping: 'Pumping',
    bottle: 'Bottle',
    bath: 'Bath',
    medicine: 'Medicine',
    temperature: 'Temperature',
    weight: 'Weight',
    height: 'Height',
    custom: 'Custom',
    
    // Breastfeeding specific
    breastSide: 'Breast Side',
    leftBreast: 'Left',
    rightBreast: 'Right',
    
    // Activity details
    lastUsed: 'Last used',
    date: 'Date',
    time: 'Time',
    notes: 'Notes',
    addNotes: 'Add observations about this activity...',
    image: 'Image',
    gallery: 'Gallery',
    takePhoto: 'Take Photo',
    saveActivity: 'Save Activity',
    
    // Quantity fields
    additionalInfo: 'Additional Information',
    quantity: 'Quantity (optional)',
    duration: 'Duration (optional)',
    
    // Baby management
    manageBabies: 'Manage Children',
    registeredBabies: 'Registered Children',
    addNewBaby: 'Add New Child',
    babyName: 'Name',
    birthDate: 'Birth Date',
    addBaby: 'Add Child',
    
    // Custom activities
    newCustomActivity: 'New Custom Activity',
    activityName: 'Activity Name',
    chooseIcon: 'Choose an Icon',
    chooseColor: 'Choose a Color',
    addActivity: 'Add Activity',
    
    // Navigation
    home: 'Home',
    stats: 'Statistics',
    routine: 'Routine',
    growth: 'Growth',
    account: 'Account',
    
    // Settings
    chooseTheme: 'Choose theme',
    chooseLanguage: 'Choose language',
    chooseColorPalette: 'Choose color palette',
    visualMode: 'Visual Mode',
    lightMode: 'Light',
    darkMode: 'Dark',
    highContrastMode: 'High Contrast',
    autoNightMode: 'Auto Night Mode',
    autoNightModeDesc: 'Automatically darkens during nighttime',
    
    // Color palettes
    neutral: 'Neutral',
    pastel: 'Pastel',
    bold: 'Bold',
    mono: 'Monochrome',
    
    // Analytics
    analytics: 'Analytics',
    usersByLanguage: 'Users by Language',
    retentionByLanguage: 'Retention by Language',
    mostUsedTheme: 'Most Used Theme',
    
    // Export
    exportReport: 'Export Report',
    exportPDF: 'Export PDF',
    exportSuccess: 'Report exported successfully!',
    
    // Tabs content
    statsDescription: 'View charts and reports about your baby\'s activities.',
    routineDescription: 'Create and manage your baby\'s daily routine.',
    growthDescription: 'Track your baby\'s physical development.',
    accountDescription: 'Manage your settings and preferences.',
    
    comingSoon: 'Coming soon',
    chartsAndAnalytics: 'detailed charts and analytics',
    routinePlanning: 'complete routine planning',
    growthCharts: 'weight, height and milestone charts',
    profileSettings: 'profile and advanced settings',
  },
  
  es: {
    // Header
    age: 'Edad',
    week: 'Semana',
    today: 'Hoy',
    settings: 'Configuración',
    
    // Activities
    activities: 'Actividades',
    noActivities: 'No hay actividades registradas',
    tapToStart: 'Toca los botones arriba para comenzar',
    activitiesOf: 'Actividades de',
    
    // Activity types (validated pediatric terms - neutral Spanish)
    breastfeeding: 'Lactancia',
    diaper: 'Pañal',
    sleep: 'Cuna',
    pumping: 'Extracción',
    bottle: 'Biberón',
    bath: 'Baño',
    medicine: 'Medicamento',
    temperature: 'Temperatura',
    weight: 'Peso',
    height: 'Altura',
    custom: 'Personalizado',
    
    // Breastfeeding specific
    breastSide: 'Lado del Pecho',
    leftBreast: 'Izquierdo',
    rightBreast: 'Derecho',
    
    // Activity details
    lastUsed: 'Última vez usada',
    date: 'Fecha',
    time: 'Hora',
    notes: 'Notas',
    addNotes: 'Agrega observaciones sobre esta actividad...',
    image: 'Imagen',
    gallery: 'Galería',
    takePhoto: 'Tomar Foto',
    saveActivity: 'Guardar Actividad',
    
    // Quantity fields
    additionalInfo: 'Información Adicional',
    quantity: 'Cantidad (opcional)',
    duration: 'Duración (opcional)',
    
    // Baby management
    manageBabies: 'Gestionar Hijos',
    registeredBabies: 'Hijos Registrados',
    addNewBaby: 'Agregar Nuevo Hijo',
    babyName: 'Nombre',
    birthDate: 'Fecha de Nacimiento',
    addBaby: 'Agregar Hijo',
    
    // Custom activities
    newCustomActivity: 'Nueva Actividad Personalizada',
    activityName: 'Nombre de la Actividad',
    chooseIcon: 'Elige un Ícono',
    chooseColor: 'Elige un Color',
    addActivity: 'Agregar Actividad',
    
    // Navigation
    home: 'Inicio',
    stats: 'Estadísticas',
    routine: 'Rutina',
    growth: 'Crecimiento',
    account: 'Cuenta',
    
    // Settings
    chooseTheme: 'Elige el tema',
    chooseLanguage: 'Elige el idioma',
    chooseColorPalette: 'Elige la paleta de colores',
    visualMode: 'Modo Visual',
    lightMode: 'Claro',
    darkMode: 'Oscuro',
    highContrastMode: 'Alto Contraste',
    autoNightMode: 'Modo Nocturno Automático',
    autoNightModeDesc: 'Se oscurece automáticamente durante la noche',
    
    // Color palettes
    neutral: 'Neutral',
    pastel: 'Pastel',
    bold: 'Vibrante',
    mono: 'Monocromático',
    
    // Analytics
    analytics: 'Analíticas',
    usersByLanguage: 'Usuarios por Idioma',
    retentionByLanguage: 'Retención por Idioma',
    mostUsedTheme: 'Tema Más Usado',
    
    // Export
    exportReport: 'Exportar Informe',
    exportPDF: 'Exportar PDF',
    exportSuccess: '¡Informe exportado con éxito!',
    
    // Tabs content
    statsDescription: 'Visualiza gráficos e informes sobre las actividades de tu bebé.',
    routineDescription: 'Crea y gestiona la rutina diaria de tu bebé.',
    growthDescription: 'Sigue el desarrollo físico de tu bebé.',
    accountDescription: 'Gestiona tus configuraciones y preferencias.',
    
    comingSoon: 'Próximamente',
    chartsAndAnalytics: 'gráficos y análisis detallados',
    routinePlanning: 'planificación completa de rutina',
    growthCharts: 'gráficos de peso, altura e hitos',
    profileSettings: 'perfil y configuración avanzada',
  }
}

// Hook para usar traduções
export function useTranslation(language: Language) {
  return {
    t: (key: string): string => {
      const keys = key.split('.')
      let value: any = translations[language]
      
      for (const k of keys) {
        value = value?.[k]
      }
      
      return typeof value === 'string' ? value : key
    },
    language
  }
}

// Detectar idioma do navegador
export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'pt'
  
  const browserLang = navigator.language.toLowerCase()
  
  if (browserLang.startsWith('pt')) return 'pt'
  if (browserLang.startsWith('es')) return 'es'
  return 'en'
}
