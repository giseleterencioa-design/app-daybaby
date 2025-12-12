// Sistema de analytics para rastreamento de métricas

export type AnalyticsEvent = {
  id: string
  timestamp: Date
  type: 'language_change' | 'theme_change' | 'activity_added' | 'session_start'
  data: Record<string, any>
}

export type UserPreferences = {
  language: 'pt' | 'en' | 'es'
  theme: 'light' | 'dark' | 'highContrast'
  colorPalette: 'neutral' | 'pastel' | 'bold' | 'mono'
  autoNightMode: boolean
}

export type AnalyticsData = {
  events: AnalyticsEvent[]
  userPreferences: UserPreferences
  sessionStart: Date
  lastActivity: Date
}

// Classe para gerenciar analytics
export class Analytics {
  private static STORAGE_KEY = 'daybaby_analytics'
  
  // Registrar evento
  static trackEvent(type: AnalyticsEvent['type'], data: Record<string, any> = {}) {
    if (typeof window === 'undefined') return
    
    const event: AnalyticsEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      data
    }
    
    const analytics = this.getAnalytics()
    analytics.events.push(event)
    analytics.lastActivity = new Date()
    
    this.saveAnalytics(analytics)
  }
  
  // Obter dados de analytics
  static getAnalytics(): AnalyticsData {
    if (typeof window === 'undefined') {
      return this.getDefaultAnalytics()
    }
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        // Converter strings de data para objetos Date
        data.sessionStart = new Date(data.sessionStart)
        data.lastActivity = new Date(data.lastActivity)
        data.events = data.events.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }))
        return data
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
    
    return this.getDefaultAnalytics()
  }
  
  // Salvar analytics
  static saveAnalytics(data: AnalyticsData) {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving analytics:', error)
    }
  }
  
  // Analytics padrão
  static getDefaultAnalytics(): AnalyticsData {
    return {
      events: [],
      userPreferences: {
        language: 'pt',
        theme: 'light',
        colorPalette: 'pastel',
        autoNightMode: false
      },
      sessionStart: new Date(),
      lastActivity: new Date()
    }
  }
  
  // Atualizar preferências do usuário
  static updatePreferences(preferences: Partial<UserPreferences>) {
    const analytics = this.getAnalytics()
    analytics.userPreferences = {
      ...analytics.userPreferences,
      ...preferences
    }
    this.saveAnalytics(analytics)
    
    // Registrar mudança de preferência
    if (preferences.language) {
      this.trackEvent('language_change', { language: preferences.language })
    }
    if (preferences.theme) {
      this.trackEvent('theme_change', { theme: preferences.theme })
    }
  }
  
  // Obter estatísticas
  static getStats() {
    const analytics = this.getAnalytics()
    
    // % de usuários por idioma (simulado - em produção viria do backend)
    const languageChanges = analytics.events.filter(e => e.type === 'language_change')
    const languageCount = languageChanges.reduce((acc, event) => {
      const lang = event.data.language
      acc[lang] = (acc[lang] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const totalLanguageChanges = Object.values(languageCount).reduce((a, b) => a + b, 0) || 1
    const languagePercentages = Object.entries(languageCount).map(([lang, count]) => ({
      language: lang,
      percentage: Math.round((count / totalLanguageChanges) * 100)
    }))
    
    // Tema mais usado
    const themeChanges = analytics.events.filter(e => e.type === 'theme_change')
    const themeCount = themeChanges.reduce((acc, event) => {
      const theme = event.data.theme
      acc[theme] = (acc[theme] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostUsedTheme = Object.entries(themeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || analytics.userPreferences.theme
    
    // Retenção por idioma (dias desde última atividade)
    const daysSinceLastActivity = Math.floor(
      (new Date().getTime() - analytics.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return {
      languagePercentages,
      mostUsedTheme,
      currentLanguage: analytics.userPreferences.language,
      retentionDays: daysSinceLastActivity,
      totalEvents: analytics.events.length,
      sessionStart: analytics.sessionStart
    }
  }
  
  // Iniciar sessão
  static startSession() {
    this.trackEvent('session_start', {
      timestamp: new Date().toISOString()
    })
  }
}

// Verificar se é horário noturno (22h - 6h)
export function isNightTime(): boolean {
  const hour = new Date().getHours()
  return hour >= 22 || hour < 6
}
