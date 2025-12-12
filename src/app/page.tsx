"use client"

import { useState, useEffect } from "react"
import { 
  Heart, Moon, Circle, Calendar, Clock, Plus, ChevronLeft, ChevronRight, 
  Settings, User, Users, Home, BarChart3, BookOpen, TrendingUp, UserCircle, Baby, Droplet, Camera, Image as ImageIcon, Edit2, X, Download, Globe, Palette, Sun, Trash2, Bell, Activity, Monitor, Cloud, Play, Pause, StopCircle, Ruler, Weight, Upload, Thermometer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useTranslation, Language, detectBrowserLanguage } from "@/lib/i18n"
import { Analytics, isNightTime, UserPreferences } from "@/lib/analytics"
import { exportReport } from "@/lib/pdf-export"

type Baby = {
  id: string
  name: string
  birthDate: Date
  photo?: string
}

type ActivityType = "amamentacao" | "fralda" | "sono" | "pumping" | "mamadeira" | "banho" | "medicamento" | "temperatura" | "peso" | "altura" | "custom"

type Activity = {
  id: string
  type: ActivityType
  time: string
  date: string
  duration?: string
  notes?: string
  customIcon?: string
  customName?: string
  image?: string
  quantity?: number
  quantityUnit?: "ml" | "oz"
  breastSide?: "left" | "right"
  startTime?: string
  endTime?: string
  totalDuration?: number // em minutos
}

type CustomActivityType = {
  id: string
  name: string
  icon: string
  color: string
}

type GrowthRecord = {
  id: string
  date: string
  weight: number
  height: number
  headCircumference: number
  notes: string
  images: string[]
}

type ToothRecord = {
  id: string
  name: string
  position: number
  erupted: boolean
  eruptionDate?: string
}

type Theme = "blue" | "green" | "yellow" | "purple" | "pink"
type VisualMode = "light" | "dark" | "highContrast"
type ColorPalette = "neutral" | "pastel" | "bold" | "mono"
type ViewFormat = "list" | "chart"
type StatsView = "count" | "duration"

// Tipos de unidades
type WeightUnit = "kg" | "lb"
type TemperatureUnit = "celsius" | "fahrenheit"
type VolumeUnit = "ml" | "oz"
type TimeFormat = "24h" | "12h"

// Configurações de unidades
type UnitSettings = {
  weight: WeightUnit
  temperature: TemperatureUnit
  volume: VolumeUnit
  timeFormat: TimeFormat
}

const themes = {
  blue: {
    primary: "from-blue-200 via-blue-100 to-blue-50",
    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
    text: "text-blue-400",
    button: "bg-blue-300 hover:bg-blue-400",
    card: "border-blue-200/50"
  },
  green: {
    primary: "from-green-200 via-green-100 to-green-50",
    bg: "bg-gradient-to-br from-green-50 to-green-100",
    text: "text-green-400",
    button: "bg-green-300 hover:bg-green-400",
    card: "border-green-200/50"
  },
  yellow: {
    primary: "from-yellow-200 via-yellow-100 to-yellow-50",
    bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
    text: "text-yellow-500",
    button: "bg-yellow-300 hover:bg-yellow-400",
    card: "border-yellow-200/50"
  },
  purple: {
    primary: "from-purple-200 via-purple-100 to-purple-50",
    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
    text: "text-purple-400",
    button: "bg-purple-300 hover:bg-purple-400",
    card: "border-purple-200/50"
  },
  pink: {
    primary: "from-pink-200 via-pink-100 to-pink-50",
    bg: "bg-gradient-to-br from-pink-50 to-pink-100",
    text: "text-pink-400",
    button: "bg-pink-300 hover:bg-pink-400",
    card: "border-pink-200/50"
  }
}

// Paletas de cores - TONS CLARINHOS PARA BEBÊ
const colorPalettes = {
  neutral: {
    activities: ["bg-gray-200", "bg-slate-200", "bg-zinc-200", "bg-stone-200", "bg-neutral-200"]
  },
  pastel: {
    activities: ["bg-pink-200", "bg-blue-200", "bg-green-200", "bg-purple-200", "bg-yellow-200"]
  },
  bold: {
    activities: ["bg-pink-300", "bg-blue-300", "bg-green-300", "bg-purple-300", "bg-yellow-300"]
  },
  mono: {
    activities: ["bg-gray-200", "bg-gray-300", "bg-gray-200", "bg-slate-200", "bg-slate-300"]
  }
}

// Acervo completo de emojis para maternidade
const maternityIcons = [
  { id: "breastfeeding", name: "Amamentação", icon: "🤱🏽" },
  { id: "diaper", name: "Fralda", icon: "💩" },
  { id: "sleep", name: "Sono", icon: "💤" },
  { id: "pumping", name: "Pumping", icon: "⛽️" },
  { id: "bottle", name: "Mamadeira", icon: "🍼" },
  { id: "baby", name: "Bebê", icon: "👶" },
  { id: "heart", name: "Coração", icon: "❤️" },
  { id: "moon", name: "Lua", icon: "🌙" },
  { id: "star", name: "Estrela", icon: "⭐" },
  { id: "sun", name: "Sol", icon: "☀️" },
  { id: "cloud", name: "Nuvem", icon: "☁️" },
  { id: "smile", name: "Sorriso", icon: "😊" },
  { id: "music", name: "Música", icon: "🎵" },
  { id: "bath", name: "Banho", icon: "🛁" },
  { id: "medicine", name: "Remédio", icon: "💊" },
  { id: "thermometer", name: "Temperatura", icon: "🌡️" },
  { id: "weight", name: "Peso", icon: "⚖️" },
  { id: "height", name: "Altura", icon: "📏" },
  { id: "food", name: "Comida", icon: "🍽️" },
  { id: "toy", name: "Brinquedo", icon: "🧸" },
]

// Mapa de dentes com posicionamento realístico
const teethMap = {
  upper: [
    { id: 1, name: "Incisivo Central Superior Direito", type: "incisor" },
    { id: 2, name: "Incisivo Central Superior Esquerdo", type: "incisor" },
    { id: 3, name: "Incisivo Lateral Superior Direito", type: "incisor" },
    { id: 4, name: "Incisivo Lateral Superior Esquerdo", type: "incisor" },
    { id: 5, name: "Canino Superior Direito", type: "canine" },
    { id: 6, name: "Canino Superior Esquerdo", type: "canine" },
    { id: 7, name: "Primeiro Molar Superior Direito", type: "molar" },
    { id: 8, name: "Primeiro Molar Superior Esquerdo", type: "molar" },
    { id: 9, name: "Segundo Molar Superior Direito", type: "molar" },
    { id: 10, name: "Segundo Molar Superior Esquerdo", type: "molar" },
  ],
  lower: [
    { id: 11, name: "Incisivo Central Inferior Direito", type: "incisor" },
    { id: 12, name: "Incisivo Central Inferior Esquerdo", type: "incisor" },
    { id: 13, name: "Incisivo Lateral Inferior Direito", type: "incisor" },
    { id: 14, name: "Incisivo Lateral Inferior Esquerdo", type: "incisor" },
    { id: 15, name: "Canino Inferior Direito", type: "canine" },
    { id: 16, name: "Canino Inferior Esquerdo", type: "canine" },
    { id: 17, name: "Primeiro Molar Inferior Direito", type: "molar" },
    { id: 18, name: "Primeiro Molar Inferior Esquerdo", type: "molar" },
    { id: 19, name: "Segundo Molar Inferior Direito", type: "molar" },
    { id: 20, name: "Segundo Molar Inferior Esquerdo", type: "molar" },
  ]
}

export default function DaybabyApp() {
  // Estados de preferências do usuário
  const [language, setLanguage] = useState<Language>('pt')
  const [visualMode, setVisualMode] = useState<VisualMode>('light')
  const [colorPalette, setColorPalette] = useState<ColorPalette>('pastel')
  const [autoNightMode, setAutoNightMode] = useState(false)
  
  // Estados de configurações de unidades
  const [unitSettings, setUnitSettings] = useState<UnitSettings>({
    weight: "kg",
    temperature: "celsius",
    volume: "ml",
    timeFormat: "24h"
  })
  
  const [theme, setTheme] = useState<Theme>("pink")
  const [currentTab, setCurrentTab] = useState("home")
  const [babies, setBabies] = useState<Baby[]>([
    { id: "1", name: "Sofia", birthDate: new Date(2024, 2, 15) }
  ])
  const [selectedBabyId, setSelectedBabyId] = useState("1")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activities, setActivities] = useState<Activity[]>([])
  const [customActivityTypes, setCustomActivityTypes] = useState<CustomActivityType[]>([])
  const [showAddCustomActivity, setShowAddCustomActivity] = useState(false)
  const [showManageActivities, setShowManageActivities] = useState(false)
  const [showFullSettings, setShowFullSettings] = useState(false)
  const [newCustomName, setNewCustomName] = useState("")
  const [newCustomIcon, setNewCustomIcon] = useState("🤱🏽")
  const [newCustomColor, setNewCustomColor] = useState("bg-yellow-200")
  
  // Estados para gerenciar bebês
  const [showManageBabies, setShowManageBabies] = useState(false)
  const [newBabyName, setNewBabyName] = useState("")
  const [newBabyBirthDate, setNewBabyBirthDate] = useState("")
  
  // Estados para editar bebê selecionado
  const [showEditBaby, setShowEditBaby] = useState(false)
  const [editBabyName, setEditBabyName] = useState("")
  const [editBabyBirthDate, setEditBabyBirthDate] = useState("")
  const [editBabyPhoto, setEditBabyPhoto] = useState("")
  
  // Estados para o modal de detalhes da atividade
  const [showActivityDetail, setShowActivityDetail] = useState(false)
  const [selectedActivityType, setSelectedActivityType] = useState<{ id: string; name: string; icon: string; color: string } | null>(null)
  const [activityTime, setActivityTime] = useState("")
  const [activityDate, setActivityDate] = useState("")
  const [activityNotes, setActivityNotes] = useState("")
  const [activityImage, setActivityImage] = useState("")
  const [activityQuantity, setActivityQuantity] = useState("")
  const [activityQuantityUnit, setActivityQuantityUnit] = useState<"ml" | "oz">("ml")
  const [activityDuration, setActivityDuration] = useState("")
  const [activityBreastSide, setActivityBreastSide] = useState<"left" | "right">("left")

  // Estados para cronômetro
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null)
  const [timerElapsed, setTimerElapsed] = useState(0)
  const [activityStartTime, setActivityStartTime] = useState("")
  const [activityEndTime, setActivityEndTime] = useState("")

  // Estado para controlar se está no cliente (evita hydration mismatch)
  const [isClient, setIsClient] = useState(false)
  
  // Analytics
  const [analyticsStats, setAnalyticsStats] = useState<any>(null)

  // Estados para configurações completas
  const [userName, setUserName] = useState("Mamãe")
  const [userEmail, setUserEmail] = useState("mamae@email.com")
  const [tempUserName, setTempUserName] = useState("")
  const [tempUserEmail, setTempUserEmail] = useState("")
  const [notificationBreastfeeding, setNotificationBreastfeeding] = useState(true)
  const [notificationDiaper, setNotificationDiaper] = useState(true)
  const [notificationSleep, setNotificationSleep] = useState(false)
  const [notificationMedicine, setNotificationMedicine] = useState(true)
  const [viewFormat, setViewFormat] = useState<ViewFormat>("list")
  const [fontSize, setFontSize] = useState("medium")
  const [syncEnabled, setSyncEnabled] = useState(false)

  // Estado para controlar visualização de estatísticas
  const [statsView, setStatsView] = useState<StatsView>("count")

  // Estados para crescimento
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [showAddGrowth, setShowAddGrowth] = useState(false)
  const [growthDate, setGrowthDate] = useState("")
  const [growthWeight, setGrowthWeight] = useState("")
  const [growthHeight, setGrowthHeight] = useState("")
  const [growthHeadCirc, setGrowthHeadCirc] = useState("")
  const [growthNotes, setGrowthNotes] = useState("")
  const [growthImages, setGrowthImages] = useState<string[]>([])
  const [growthTab, setGrowthTab] = useState("growth")

  // Estados para dentição
  const [teethRecords, setTeethRecords] = useState<ToothRecord[]>([
    ...teethMap.upper.map(tooth => ({
      id: tooth.id.toString(),
      name: tooth.name,
      position: tooth.id,
      erupted: false
    })),
    ...teethMap.lower.map(tooth => ({
      id: tooth.id.toString(),
      name: tooth.name,
      position: tooth.id,
      erupted: false
    }))
  ])
  const [showToothDetail, setShowToothDetail] = useState(false)
  const [selectedTooth, setSelectedTooth] = useState<ToothRecord | null>(null)

  // Estado para controlar hover dos cards de atividade
  const [hoveredActivityId, setHoveredActivityId] = useState<string | null>(null)

  // Hook de tradução
  const { t } = useTranslation(language)

  // Inicialização
  useEffect(() => {
    setIsClient(true)
    
    // Detectar idioma do navegador
    const detectedLang = detectBrowserLanguage()
    
    // Carregar preferências do analytics
    const analytics = Analytics.getAnalytics()
    setLanguage(analytics.userPreferences.language || detectedLang)
    setVisualMode(analytics.userPreferences.theme || 'light')
    setColorPalette(analytics.userPreferences.colorPalette || 'pastel')
    setAutoNightMode(analytics.userPreferences.autoNightMode || false)
    
    // Iniciar sessão
    Analytics.startSession()
    
    // Carregar estatísticas
    setAnalyticsStats(Analytics.getStats())
  }, [])
  
  // Aplicar modo noturno automático
  useEffect(() => {
    if (autoNightMode && isClient) {
      const checkNightMode = () => {
        if (isNightTime() && visualMode !== 'dark') {
          setVisualMode('dark')
        }
      }
      
      checkNightMode()
      const interval = setInterval(checkNightMode, 60000) // Verificar a cada minuto
      
      return () => clearInterval(interval)
    }
  }, [autoNightMode, isClient, visualMode])

  // Atualizar preferências quando mudarem
  useEffect(() => {
    if (isClient) {
      Analytics.updatePreferences({
        language,
        theme: visualMode,
        colorPalette,
        autoNightMode
      })
      setAnalyticsStats(Analytics.getStats())
    }
  }, [language, visualMode, colorPalette, autoNightMode, isClient])

  // Cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - timerStartTime.getTime()) / 1000)
        setTimerElapsed(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerStartTime])

  const currentTheme = themes[theme]
  const selectedBaby = babies.find(b => b.id === selectedBabyId)
  
  // Obter cores das atividades baseado na paleta
  const getActivityColors = () => colorPalettes[colorPalette].activities

  // Tipos de atividades padrão com traduções e emojis - CORES CLARINHAS
  const getDefaultActivityTypes = () => [
    { id: "amamentacao", name: t('breastfeeding'), icon: "🤱🏽", color: getActivityColors()[0] },
    { id: "fralda", name: t('diaper'), icon: "💩", color: getActivityColors()[2] },
    { id: "sono", name: t('sleep'), icon: "💤", color: getActivityColors()[1] },
    { id: "pumping", name: t('pumping'), icon: "⛽️", color: getActivityColors()[3] },
    { id: "mamadeira", name: t('bottle'), icon: "🍼", color: getActivityColors()[4] },
  ]

  // Calcular idade do bebê
  const calculateAge = (birthDate: Date) => {
    const today = currentDate
    const birth = new Date(birthDate)
    
    let months = (today.getFullYear() - birth.getFullYear()) * 12
    months -= birth.getMonth()
    months += today.getMonth()
    
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)) % 30
    const weeks = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 7))
    
    return { months, days, weeks }
  }

  const age = selectedBaby ? calculateAge(selectedBaby.birthDate) : { months: 0, days: 0, weeks: 0 }

  // Navegar entre dias
  const changeDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  const isToday = currentDate.toDateString() === new Date().toDateString()

  // Adicionar novo bebê
  const addBaby = () => {
    if (newBabyName && newBabyBirthDate) {
      const newBaby: Baby = {
        id: Date.now().toString(),
        name: newBabyName,
        birthDate: new Date(newBabyBirthDate)
      }
      setBabies([...babies, newBaby])
      setNewBabyName("")
      setNewBabyBirthDate("")
    }
  }

  // Remover bebê
  const removeBaby = (babyId: string) => {
    if (babies.length > 1) {
      setBabies(babies.filter(b => b.id !== babyId))
      if (selectedBabyId === babyId) {
        setSelectedBabyId(babies.find(b => b.id !== babyId)?.id || "")
      }
    }
  }

  // Abrir modal de edição do bebê
  const openEditBaby = () => {
    if (selectedBaby) {
      setEditBabyName(selectedBaby.name)
      setEditBabyBirthDate(selectedBaby.birthDate.toISOString().split('T')[0])
      setEditBabyPhoto(selectedBaby.photo || "")
      setShowEditBaby(true)
    }
  }

  // Salvar edição do bebê
  const saveEditBaby = () => {
    if (selectedBaby && editBabyName && editBabyBirthDate) {
      setBabies(babies.map(baby => 
        baby.id === selectedBaby.id 
          ? { ...baby, name: editBabyName, birthDate: new Date(editBabyBirthDate), photo: editBabyPhoto }
          : baby
      ))
      setShowEditBaby(false)
    }
  }

  // Calcular tempo desde a última atividade
  const getTimeSinceLastActivity = (activityTypeId: string) => {
    const lastActivity = activities
      .filter(a => a.type === activityTypeId)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })[0]

    if (!lastActivity) {
      return null
    }

    const lastActivityDate = new Date(`${lastActivity.date}T${lastActivity.time}`)
    const now = new Date()
    const diffMs = now.getTime() - lastActivityDate.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      if (diffHours % 24 > 0) {
        return `${diffDays}d ${diffHours % 24}h ago`
      }
      return `${diffDays}d ago`
    } else if (diffHours > 0) {
      if (diffMinutes % 60 > 0) {
        return `${diffHours}h ${diffMinutes % 60}m ago`
      }
      return `${diffHours}h ago`
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`
    } else {
      return "just now"
    }
  }

  // Funções do cronômetro
  const startTimer = () => {
    const now = new Date()
    setTimerStartTime(now)
    setIsTimerRunning(true)
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    setActivityStartTime(`${hours}:${minutes}`)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
  }

  const stopTimer = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    setActivityEndTime(`${hours}:${minutes}`)
    setIsTimerRunning(false)
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerStartTime(null)
    setTimerElapsed(0)
    setActivityStartTime("")
    setActivityEndTime("")
  }

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Abrir modal de detalhes da atividade
  const openActivityDetail = (actType: { id: string; name: string; icon: string; color: string }) => {
    setSelectedActivityType(actType)
    
    // Buscar última atividade deste tipo
    const lastActivity = activities.find(a => a.type === actType.id)
    
    // Preencher com dados da última atividade ou valores padrão
    const now = new Date()
    setActivityTime(lastActivity?.time || now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }))
    setActivityDate(lastActivity?.date || currentDate.toISOString().split('T')[0])
    setActivityNotes(lastActivity?.notes || "")
    setActivityImage(lastActivity?.image || "")
    setActivityQuantity(lastActivity?.quantity?.toString() || "")
    setActivityQuantityUnit(lastActivity?.quantityUnit || "ml")
    setActivityDuration(lastActivity?.duration || "")
    setActivityBreastSide(lastActivity?.breastSide || "left")
    
    // Resetar cronômetro
    resetTimer()
    
    setShowActivityDetail(true)
  }

  // Salvar atividade com detalhes
  const saveActivityDetail = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: selectedActivityType?.id as ActivityType,
      time: activityTime,
      date: activityDate,
      notes: activityNotes,
      customName: selectedActivityType?.name,
      customIcon: selectedActivityType?.icon,
      image: activityImage
    }

    // Adicionar lado do seio se for amamentação
    if (selectedActivityType?.id === "amamentacao") {
      newActivity.breastSide = activityBreastSide
    }

    // Adicionar horários de início e fim se foram registrados
    if (activityStartTime) {
      newActivity.startTime = activityStartTime
    }
    if (activityEndTime) {
      newActivity.endTime = activityEndTime
    }
    if (timerElapsed > 0) {
      newActivity.totalDuration = Math.floor(timerElapsed / 60) // converter para minutos
    }

    // Adicionar quantidade e duração se for pumping ou mamadeira
    if (selectedActivityType?.id === "pumping" || selectedActivityType?.id === "mamadeira") {
      if (activityQuantity) {
        newActivity.quantity = parseFloat(activityQuantity)
        newActivity.quantityUnit = activityQuantityUnit
      }
      if (activityDuration) {
        newActivity.duration = activityDuration
      }
    }

    setActivities([newActivity, ...activities])
    setShowActivityDetail(false)
    
    // Registrar no analytics
    Analytics.trackEvent('activity_added', {
      type: selectedActivityType?.id,
      date: activityDate
    })
    
    // Limpar campos
    setActivityNotes("")
    setActivityImage("")
    setActivityQuantity("")
    setActivityDuration("")
    resetTimer()
  }

  // Adicionar tipo de atividade customizada
  const addCustomActivityType = () => {
    if (newCustomName) {
      const newType: CustomActivityType = {
        id: Date.now().toString(),
        name: newCustomName,
        icon: newCustomIcon,
        color: newCustomColor
      }
      setCustomActivityTypes([...customActivityTypes, newType])
      setNewCustomName("")
      setNewCustomIcon("🤱🏽")
      setNewCustomColor("bg-yellow-200")
      setShowAddCustomActivity(false)
    }
  }

  // Deletar atividade customizada
  const deleteCustomActivity = (id: string) => {
    setCustomActivityTypes(customActivityTypes.filter(a => a.id !== id))
  }

  // Deletar todas as atividades de um tipo
  const deleteActivitiesByType = (typeId: string) => {
    setActivities(activities.filter(a => a.type !== typeId))
  }

  // Adicionar registro de crescimento
  const addGrowthRecord = () => {
    if (growthDate && growthWeight && growthHeight && growthHeadCirc) {
      const newRecord: GrowthRecord = {
        id: Date.now().toString(),
        date: growthDate,
        weight: parseFloat(growthWeight),
        height: parseFloat(growthHeight),
        headCircumference: parseFloat(growthHeadCirc),
        notes: growthNotes,
        images: growthImages
      }
      setGrowthRecords([...growthRecords, newRecord].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      
      // Limpar campos
      setGrowthDate("")
      setGrowthWeight("")
      setGrowthHeight("")
      setGrowthHeadCirc("")
      setGrowthNotes("")
      setGrowthImages([])
      setShowAddGrowth(false)
    }
  }

  // Atualizar dente
  const updateTooth = (toothId: string, erupted: boolean, eruptionDate?: string) => {
    setTeethRecords(teethRecords.map(tooth => 
      tooth.id === toothId 
        ? { ...tooth, erupted, eruptionDate: erupted ? eruptionDate : undefined }
        : tooth
    ))
  }

  // Filtrar atividades do dia atual
  const todayActivities = activities.filter(a => a.date === currentDate.toISOString().split('T')[0])

  // Obter ícone - agora suporta emojis
  const getIcon = (iconName: string, size: string = "w-8 h-8") => {
    // Se for emoji, retorna direto
    if (iconName && /\p{Emoji}/u.test(iconName)) {
      return <span className="text-2xl">{iconName}</span>
    }
    
    // Caso contrário, usa ícones Lucide
    switch (iconName) {
      case "heart": return <Heart className={size} />
      case "moon": return <Moon className={size} />
      case "baby": return <Baby className={size} />
      case "droplet": return <Droplet className={size} />
      default: return <Circle className={size} />
    }
  }

  // Todos os tipos de atividades (padrão + customizados)
  const allActivityTypes = [
    ...getDefaultActivityTypes(),
    ...customActivityTypes.map(c => ({ id: c.id, name: c.name, icon: c.icon, color: c.color }))
  ]

  // Formatar data para exibição
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Resetar horas para comparação apenas de datas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    
    // Se for ontem
    if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return language === 'pt' ? 'Ontem' : language === 'es' ? 'Ayer' : 'Yesterday'
    }
    
    // Se for antes de ontem, mostrar dia da semana
    if (dateOnly.getTime() < yesterdayOnly.getTime()) {
      const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'
      return date.toLocaleDateString(locale, { weekday: 'long' })
    }
    
    // Caso contrário (hoje ou futuro), mostrar data normal
    const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'
    return date.toLocaleDateString(locale, { day: "2-digit", month: "short" })
  }

  // Verificar se a atividade precisa de campos especiais
  const needsQuantityFields = selectedActivityType?.id === "pumping" || selectedActivityType?.id === "mamadeira"
  const isBreastfeeding = selectedActivityType?.id === "amamentacao"
  const needsTimer = selectedActivityType?.id === "amamentacao" || selectedActivityType?.id === "sono" || selectedActivityType?.id === "mamadeira"
  
  // Exportar relatório
  const handleExportReport = () => {
    if (!selectedBaby) return
    
    exportReport({
      baby: selectedBaby,
      activities: activities,
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      endDate: currentDate,
      language
    })
  }

  // Salvar configurações de usuário
  const saveUserSettings = () => {
    setUserName(tempUserName)
    setUserEmail(tempUserEmail)
    alert("Configurações salvas com sucesso!")
  }

  // Abrir modal de configurações completas
  const openFullSettings = () => {
    setTempUserName(userName)
    setTempUserEmail(userEmail)
    setShowFullSettings(true)
  }

  // Calcular estatísticas por tipo de atividade
  const getActivityStats = () => {
    const stats: { [key: string]: { count: number; totalTime: number; avgTime: number } } = {}
    
    activities.forEach(activity => {
      const typeId = activity.type
      if (!stats[typeId]) {
        stats[typeId] = { count: 0, totalTime: 0, avgTime: 0 }
      }
      stats[typeId].count++
      if (activity.totalDuration) {
        stats[typeId].totalTime += activity.totalDuration
      }
    })
    
    // Calcular média
    Object.keys(stats).forEach(typeId => {
      if (stats[typeId].count > 0) {
        stats[typeId].avgTime = Math.round(stats[typeId].totalTime / stats[typeId].count)
      }
    })
    
    return stats
  }
  
  // Classes de tema visual
  const getVisualModeClasses = () => {
    switch (visualMode) {
      case 'dark':
        return {
          bg: 'bg-slate-900',
          card: 'bg-slate-800/90 text-white backdrop-blur-xl',
          text: 'text-slate-100',
          subtext: 'text-slate-400',
          border: 'border-slate-700/50'
        }
      case 'highContrast':
        return {
          bg: 'bg-black',
          card: 'bg-white text-black border-4 border-black',
          text: 'text-white',
          subtext: 'text-yellow-400',
          border: 'border-white'
        }
      default: // light
        return {
          bg: currentTheme.bg,
          card: 'bg-white/70 text-slate-700 backdrop-blur-xl shadow-xl',
          text: 'text-slate-800',
          subtext: 'text-slate-600',
          border: 'border-slate-200/50'
        }
    }
  }
  
  const visualClasses = getVisualModeClasses()

  // Componente de dente realístico
  const ToothComponent = ({ tooth, onClick }: { tooth: ToothRecord; onClick: () => void }) => {
    const toothData = [...teethMap.upper, ...teethMap.lower].find(t => t.id === tooth.position)
    const toothType = toothData?.type || 'incisor'
    
    // Estilos baseados no tipo de dente
    const getToothStyle = () => {
      switch (toothType) {
        case 'incisor':
          return 'w-8 h-10 rounded-t-lg' // Incisivos são mais retangulares
        case 'canine':
          return 'w-7 h-11 rounded-t-full' // Caninos são pontiagudos
        case 'molar':
          return 'w-9 h-9 rounded-lg' // Molares são mais quadrados
        default:
          return 'w-8 h-10 rounded-t-lg'
      }
    }
    
    return (
      <button
        onClick={onClick}
        className={`${getToothStyle()} border-2 transition-all hover:scale-110 ${
          tooth.erupted
            ? 'bg-white border-blue-300 shadow-md'
            : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
        }`}
        title={tooth.name}
      >
        {tooth.erupted && <span className="text-xs">🦷</span>}
      </button>
    )
  }

  // Obter nome do idioma
  const getLanguageName = (lang: Language) => {
    switch (lang) {
      case 'pt': return 'Português'
      case 'en': return 'English'
      case 'es': return 'Español'
      default: return lang
    }
  }
  
  // Função para aplicar padrão US
  const applyUSMetrics = () => {
    setUnitSettings({
      weight: "lb",
      temperature: "fahrenheit",
      volume: "oz",
      timeFormat: "12h"
    })
  }
  
  // Função para aplicar padrão métrico
  const applyMetricSystem = () => {
    setUnitSettings({
      weight: "kg",
      temperature: "celsius",
      volume: "ml",
      timeFormat: "24h"
    })
  }

  return (
    <div className={`min-h-screen ${visualClasses.bg} pb-20`}>
      {/* Header com informações do bebê - CORES CLARINHAS */}
      <div className={`bg-gradient-to-br ${currentTheme.primary} ${visualMode === 'dark' ? 'opacity-95' : ''} ${visualMode === 'highContrast' ? 'border-b-4 border-black' : ''} text-slate-700 p-6 sm:p-8 shadow-2xl relative overflow-hidden`}>
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            {/* Informações do bebê - EDITÁVEL */}
            <div className="flex items-center gap-4">
              {/* Foto do bebê */}
              <div 
                onClick={openEditBaby}
                className="relative hover:opacity-80 transition-opacity group cursor-pointer"
              >
                {selectedBaby?.photo ? (
                  <img 
                    src={selectedBaby.photo} 
                    alt={selectedBaby.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white/50"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/50">
                    <Baby className="w-8 h-8 text-slate-600" />
                  </div>
                )}
                {/* Ícone de edição */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-700 drop-shadow-lg">{selectedBaby?.name}</h1>
                  <p className="text-sm text-slate-600 font-medium">
                    {isClient ? selectedBaby?.birthDate.toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "..."}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={openEditBaby}
                    className="h-8 w-8 rounded-xl hover:bg-white/60 text-slate-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {babies.length > 1 && (
                    <Select value={selectedBabyId} onValueChange={setSelectedBabyId}>
                      <SelectTrigger className="w-auto h-9 bg-white/60 backdrop-blur-md border-white/50 text-slate-700 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {babies.map(baby => (
                          <SelectItem key={baby.id} value={baby.id}>
                            {baby.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-1 font-medium">
                  {isClient ? `${t('age')}: ${age.months}m ${age.days}d (${t('week')} ${age.weeks})` : "..."}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Configurações */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-600 hover:bg-white/60 rounded-2xl w-14 h-14 backdrop-blur-md border border-white/40"
                onClick={openFullSettings}
              >
                <Settings className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Navegação de datas - CORES CLARINHAS */}
          <div className="flex items-center justify-between bg-white/60 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/50 shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate("prev")}
              className="text-slate-600 hover:bg-white/60 h-10 w-10 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-slate-700 whitespace-nowrap">
                {isClient ? (isToday ? t('today') : formatDisplayDate(currentDate.toISOString().split('T')[0])) : '...'}
              </span>
              <span className="text-sm text-slate-600 font-medium">
                {isClient ? currentDate.toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US', { day: "2-digit", month: "2-digit", year: "numeric" }) : '...'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => changeDate("next")}
              disabled={isToday}
              className="text-slate-600 hover:bg-white/60 disabled:opacity-50 h-10 w-10 rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Edição do Bebê */}
      <Dialog open={showEditBaby} onOpenChange={setShowEditBaby}>
        <DialogContent className={`max-w-md ${visualClasses.card} rounded-3xl`}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Editar Informações do Bebê</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Foto do bebê */}
            <div>
              <Label className="text-sm mb-2 block">Foto do Bebê</Label>
              <div className="flex items-center gap-4">
                {editBabyPhoto ? (
                  <div className="relative">
                    <img 
                      src={editBabyPhoto} 
                      alt="Preview"
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                    />
                    <button
                      onClick={() => setEditBabyPhoto("")}
                      className="absolute -top-2 -right-2 bg-red-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Baby className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-xl"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setEditBabyPhoto(e.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }
                    input.click()
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Adicionar Foto
                </Button>
              </div>
            </div>

            {/* Nome do bebê */}
            <div>
              <Label className="text-sm mb-2 block">Nome do Bebê</Label>
              <Input
                value={editBabyName}
                onChange={(e) => setEditBabyName(e.target.value)}
                placeholder="Nome do bebê"
                className="rounded-xl"
              />
            </div>

            {/* Data de nascimento */}
            <div>
              <Label className="text-sm mb-2 block">Data de Nascimento</Label>
              <Input
                type="date"
                value={editBabyBirthDate}
                onChange={(e) => setEditBabyBirthDate(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={saveEditBaby} 
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-200 to-purple-300 hover:from-blue-300 hover:to-purple-400 text-slate-700"
                disabled={!editBabyName || !editBabyBirthDate}
              >
                Salvar Alterações
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowEditBaby(false)}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações Completas */}
      <Dialog open={showFullSettings} onOpenChange={setShowFullSettings}>
        <DialogContent className={`max-w-2xl max-h-[90vh] overflow-y-auto ${visualClasses.card} rounded-3xl`}>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Configurações
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Conta de Usuário */}
            <div className={`p-5 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold">Conta de Usuário</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Nome</Label>
                  <Input
                    value={tempUserName}
                    onChange={(e) => setTempUserName(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm">E-mail</Label>
                  <Input
                    type="email"
                    value={tempUserEmail}
                    onChange={(e) => setTempUserEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveUserSettings} className="flex-1 rounded-xl">
                    Salvar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setTempUserName(userName)
                      setTempUserEmail(userEmail)
                    }}
                    className="flex-1 rounded-xl"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>

            {/* Notificações */}
            <div className={`p-5 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-emerald-300 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold">Notificações</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembrete de Amamentação</Label>
                    <p className="text-xs text-gray-500">Notificar a cada 3 horas</p>
                  </div>
                  <Switch
                    checked={notificationBreastfeeding}
                    onCheckedChange={setNotificationBreastfeeding}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembrete de Troca de Fralda</Label>
                    <p className="text-xs text-gray-500">Notificar a cada 2 horas</p>
                  </div>
                  <Switch
                    checked={notificationDiaper}
                    onCheckedChange={setNotificationDiaper}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembrete de Soneca</Label>
                    <p className="text-xs text-gray-500">Notificar horários de sono</p>
                  </div>
                  <Switch
                    checked={notificationSleep}
                    onCheckedChange={setNotificationSleep}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembrete de Medicamento</Label>
                    <p className="text-xs text-gray-500">Notificar horários de remédio</p>
                  </div>
                  <Switch
                    checked={notificationMedicine}
                    onCheckedChange={setNotificationMedicine}
                  />
                </div>
              </div>
            </div>

            {/* Preferências de Atividade */}
            <div className={`p-5 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-fuchsia-300 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold">Preferências de Atividade</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm mb-2 block">Formato de Visualização</Label>
                  <Select value={viewFormat} onValueChange={(value: ViewFormat) => setViewFormat(value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="list">📋 Lista</SelectItem>
                      <SelectItem value="chart">📊 Gráfico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Aparência do App */}
            <div className={`p-5 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-red-300 rounded-2xl flex items-center justify-center shadow-lg">
                  <Monitor className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold">Aparência do App</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">Tema</Label>
                  <Select value={visualMode} onValueChange={(value: VisualMode) => setVisualMode(value)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="light">☀️ Claro</SelectItem>
                      <SelectItem value="dark">🌙 Escuro</SelectItem>
                      <SelectItem value="highContrast">🔲 Alto Contraste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Tamanho da Fonte</Label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="small">Pequena</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm mb-2 block">Cor do Tema</Label>
                  <div className="flex gap-3">
                    {(Object.keys(themes) as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${themes[t].primary} ${
                          theme === t ? "ring-4 ring-offset-2 ring-slate-300" : ""
                        } transition-all hover:scale-110 shadow-lg`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sincronização */}
            <div className={`p-5 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-2xl flex items-center justify-center shadow-lg">
                  <Cloud className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold">Sincronização</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-xs text-gray-500">Sincronizar dados na nuvem</p>
                  </div>
                  <Switch
                    checked={syncEnabled}
                    onCheckedChange={setSyncEnabled}
                  />
                </div>
                {syncEnabled && (
                  <div className="pt-2">
                    <p className="text-sm text-gray-600 mb-2">
                      Para ativar a sincronização, conecte sua conta:
                    </p>
                    <Button variant="outline" className="w-full rounded-xl">
                      Conectar Conta Google
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Botão Salvar Alterações */}
            <div className="pt-4 border-t">
              <Button 
                onClick={() => {
                  saveUserSettings()
                  setShowFullSettings(false)
                }}
                className="w-full bg-gradient-to-r from-blue-200 to-purple-300 hover:from-blue-300 hover:to-purple-400 text-slate-700 font-semibold py-3 rounded-2xl shadow-lg"
              >
                Salvar Todas as Alterações
              </Button>
            </div>

            {/* Botão Voltar */}
            <Button 
              variant="outline" 
              onClick={() => setShowFullSettings(false)}
              className="w-full rounded-2xl"
            >
              Voltar à Tela Principal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de gerenciar bebês - MOVIDO PARA ABA CONTA */}
      <Dialog open={showManageBabies} onOpenChange={setShowManageBabies}>
        <DialogContent className={`max-w-md ${visualClasses.card} rounded-3xl`}>
          <DialogHeader>
            <DialogTitle className="text-2xl">{t('manageBabies')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Lista de bebês existentes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t('registeredBabies')}</Label>
              {babies.map((baby) => (
                <div key={baby.id} className={`flex items-center justify-between p-4 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl backdrop-blur-sm`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-rose-300 rounded-2xl flex items-center justify-center shadow-lg">
                      <Baby className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <div className={`font-semibold ${visualClasses.text}`}>{baby.name}</div>
                      <div className={`text-xs ${visualClasses.subtext}`}>
                        {isClient ? baby.birthDate.toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US') : '...'}
                      </div>
                    </div>
                  </div>
                  {babies.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBaby(baby.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Adicionar novo bebê */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-semibold">{t('addNewBaby')}</Label>
              <div>
                <Label className="text-xs text-gray-600">{t('babyName')}</Label>
                <Input
                  value={newBabyName}
                  onChange={(e) => setNewBabyName(e.target.value)}
                  placeholder={t('babyName')}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">{t('birthDate')}</Label>
                <Input
                  type="date"
                  value={newBabyBirthDate}
                  onChange={(e) => setNewBabyBirthDate(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <Button 
                onClick={addBaby} 
                className="w-full rounded-xl bg-gradient-to-r from-pink-200 to-rose-300 hover:from-pink-300 hover:to-rose-400 text-slate-700"
                disabled={!newBabyName || !newBabyBirthDate}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addBaby')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes da atividade */}
      <Dialog open={showActivityDetail} onOpenChange={setShowActivityDetail}>
        <DialogContent className={`max-w-md max-h-[90vh] overflow-y-auto ${visualClasses.card} rounded-3xl`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedActivityType && (
                <>
                  <div className={`w-14 h-14 rounded-2xl ${selectedActivityType.color} flex items-center justify-center shadow-lg`}>
                    {getIcon(selectedActivityType.icon, "w-7 h-7")}
                  </div>
                  <span className="text-xl">{selectedActivityType.name}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Cronômetro para atividades que precisam */}
            {needsTimer && (
              <div className={`${visualMode === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-2xl p-5 space-y-3`}>
                <Label className={`text-sm ${visualMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} block`}>Cronômetro</Label>
                
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-400 mb-4">
                    {formatTimer(timerElapsed)}
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    {!isTimerRunning && timerElapsed === 0 && (
                      <Button onClick={startTimer} className="flex items-center gap-2 rounded-xl bg-blue-300 hover:bg-blue-400 text-slate-700">
                        <Play className="w-4 h-4" />
                        Iniciar
                      </Button>
                    )}
                    
                    {isTimerRunning && (
                      <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2 rounded-xl">
                        <Pause className="w-4 h-4" />
                        Pausar
                      </Button>
                    )}
                    
                    {!isTimerRunning && timerElapsed > 0 && (
                      <Button onClick={startTimer} className="flex items-center gap-2 rounded-xl bg-blue-300 hover:bg-blue-400 text-slate-700">
                        <Play className="w-4 h-4" />
                        Continuar
                      </Button>
                    )}
                    
                    {timerElapsed > 0 && (
                      <>
                        <Button onClick={stopTimer} variant="destructive" className="flex items-center gap-2 rounded-xl bg-red-200 hover:bg-red-300 text-slate-700">
                          <StopCircle className="w-4 h-4" />
                          Parar
                        </Button>
                        <Button onClick={resetTimer} variant="outline" className="flex items-center gap-2 rounded-xl">
                          <X className="w-4 h-4" />
                          Resetar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {activityStartTime && (
                  <div className="text-sm text-center space-y-1">
                    <div className={visualMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Início: <span className="font-semibold">{activityStartTime}</span>
                    </div>
                    {activityEndTime && (
                      <div className={visualMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Fim: <span className="font-semibold">{activityEndTime}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Última vez usada */}
            <div className={`${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl p-4`}>
              <Label className={`text-sm ${visualMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2 block`}>{t('lastUsed')}</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className={`text-xs ${visualMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('date')}</Label>
                  <Input
                    type="date"
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className={`mt-1 rounded-xl ${visualMode === 'dark' ? 'bg-slate-600 text-white border-slate-500' : ''}`}
                  />
                </div>
                <div className="flex-1">
                  <Label className={`text-xs ${visualMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{t('time')}</Label>
                  <Input
                    type="time"
                    value={activityTime}
                    onChange={(e) => setActivityTime(e.target.value)}
                    className={`mt-1 rounded-xl ${visualMode === 'dark' ? 'bg-slate-600 text-white border-slate-500' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Seleção de lado do seio para amamentação */}
            {isBreastfeeding && (
              <div className={`${visualMode === 'dark' ? 'bg-pink-900/30' : 'bg-pink-50'} rounded-2xl p-4 space-y-3`}>
                <Label className={`text-sm ${visualMode === 'dark' ? 'text-gray-300' : 'text-gray-600'} block`}>{t('breastSide')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActivityBreastSide("left")}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      activityBreastSide === "left"
                        ? "border-pink-300 bg-pink-100 shadow-md"
                        : "border-gray-200 hover:border-pink-200"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">👈</div>
                      <div className="font-semibold text-gray-700">{t('leftBreast')}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActivityBreastSide("right")}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      activityBreastSide === "right"
                        ? "border-pink-300 bg-pink-100 shadow-md"
                        : "border-gray-200 hover:border-pink-200"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">👉</div>
                      <div className="font-semibold text-gray-700">{t('rightBreast')}</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Campos específicos para Pumping e Mamadeira */}
            {needsQuantityFields && (
              <div className={`${visualMode === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-2xl p-4 space-y-3`}>
                <Label className={`text-sm ${visualMode === 'dark' ? 'text-gray-300' : 'text-black'} block`}>{t('additionalInfo')}</Label>
                
                {/* Quantidade */}
                <div>
                  <Label className={`text-xs ${visualMode === 'dark' ? 'text-gray-300' : 'text-black'} mb-1 block`}>{t('quantity')}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={activityQuantity}
                      onChange={(e) => setActivityQuantity(e.target.value)}
                      placeholder="Ex: 120"
                      className="flex-1 rounded-xl"
                      min="0"
                      step="10"
                    />
                    <Select value={activityQuantityUnit} onValueChange={(value: "ml" | "oz") => setActivityQuantityUnit(value)}>
                      <SelectTrigger className="w-20 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Duração */}
                <div>
                  <Label className={`text-xs ${visualMode === 'dark' ? 'text-gray-300' : 'text-black'} mb-1 block`}>{t('duration')}</Label>
                  <Input
                    type="text"
                    value={activityDuration}
                    onChange={(e) => setActivityDuration(e.target.value)}
                    placeholder="Ex: 15 min"
                    className="w-full rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Notas */}
            <div>
              <Label className={`text-sm ${visualClasses.subtext} mb-2 block`}>{t('notes')}</Label>
              <Textarea
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                placeholder={t('addNotes')}
                className="min-h-[100px] rounded-xl"
              />
            </div>

            {/* Incluir imagem */}
            <div>
              <Label className={`text-sm ${visualClasses.subtext} mb-2 block`}>{t('image')}</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className={`flex-1 flex items-center gap-2 rounded-xl ${visualMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => {
                    // Simular seleção de imagem
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setActivityImage(e.target?.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }
                    input.click()
                  }}
                >
                  <ImageIcon className="w-4 h-4" />
                  {t('gallery')}
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 flex items-center gap-2 rounded-xl ${visualMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => {
                    // Simular captura de foto
                    alert("Funcionalidade de câmera será implementada")
                  }}
                >
                  <Camera className="w-4 h-4" />
                  {t('takePhoto')}
                </Button>
              </div>
              
              {activityImage && (
                <div className="mt-3 relative">
                  <img src={activityImage} alt="Preview" className="w-full h-40 object-cover rounded-2xl" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-xl"
                    onClick={() => setActivityImage("")}
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>

            {/* Botão salvar */}
            <Button onClick={saveActivityDetail} className="w-full rounded-2xl bg-gradient-to-r from-blue-200 to-purple-300 hover:from-blue-300 hover:to-purple-400 shadow-lg text-slate-700">
              {t('saveActivity')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de gerenciar atividades */}
      <Dialog open={showManageActivities} onOpenChange={setShowManageActivities}>
        <DialogContent className={`max-w-md max-h-[90vh] overflow-y-auto ${visualClasses.card} rounded-3xl`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Gerenciar Atividades</DialogTitle>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setShowManageActivities(false)
                  setShowAddCustomActivity(true)
                }}
                className="h-10 w-10 rounded-xl"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Atividades Padrão */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Atividades Padrão</Label>
              <div className="space-y-2">
                {getDefaultActivityTypes().map((actType) => (
                  <div
                    key={actType.id}
                    className={`flex items-center justify-between p-4 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${actType.color} flex items-center justify-center shadow-lg`}>
                        {getIcon(actType.icon, "w-6 h-6")}
                      </div>
                      <span className={`font-medium ${visualClasses.text}`}>{actType.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openActivityDetail(actType)}
                        className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 h-10 w-10 rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Deseja deletar todas as atividades de "${actType.name}"?`)) {
                            deleteActivitiesByType(actType.id)
                          }
                        }}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Atividades Customizadas */}
            {customActivityTypes.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-3 block">Atividades Personalizadas</Label>
                <div className="space-y-2">
                  {customActivityTypes.map((actType) => (
                    <div
                      key={actType.id}
                      className={`flex items-center justify-between p-4 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${actType.color} flex items-center justify-center shadow-lg`}>
                          {getIcon(actType.icon, "w-6 h-6")}
                        </div>
                        <span className={`font-medium ${visualClasses.text}`}>{actType.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openActivityDetail(actType)}
                          className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 h-10 w-10 rounded-xl"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Deseja deletar a atividade "${actType.name}"?`)) {
                              deleteCustomActivity(actType.id)
                              deleteActivitiesByType(actType.id)
                            }
                          }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Conteúdo principal com abas */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          {/* ABA 1: Início - Registro de atividades */}
          <TabsContent value="home" className="space-y-6">
            {/* Botões de atividades principais - CORES CLARINHAS */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto px-2 pb-2">
              {allActivityTypes.map((actType) => {
                const timeSince = isClient ? getTimeSinceLastActivity(actType.id) : null
                return (
                  <button
                    key={actType.id}
                    onClick={() => openActivityDetail(actType)}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div className={`${actType.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all text-slate-700 group-hover:shadow-2xl`}>
                      {getIcon(actType.icon, "w-8 h-8")}
                    </div>
                    {timeSince && (
                      <span className={`text-[10px] ${visualMode === 'dark' ? 'text-slate-400' : 'text-slate-600'} whitespace-nowrap font-medium`}>
                        {timeSince}
                      </span>
                    )}
                  </button>
                )
              })}
              
              {/* Botão gerenciar atividades */}
              <button
                onClick={() => setShowManageActivities(true)}
                className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-dashed border-slate-300 flex-shrink-0 hover:bg-slate-200"
              >
                <Plus className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Lista de atividades do dia */}
            <Card className={`p-6 ${visualClasses.card} ${visualClasses.border} rounded-3xl`}>
              <h2 className={`text-2xl font-bold mb-6 ${currentTheme.text}`}>
                {isClient ? `${t('activitiesOf')} ${isToday ? t('today') : currentDate.toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US', { day: "numeric", month: "long" })}` : '...'}
              </h2>
              {todayActivities.length === 0 ? (
                <div className={`text-center py-12 ${visualClasses.subtext}`}>
                  <Clock className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">{t('noActivities')}</p>
                  <p className="text-sm mt-1">{t('tapToStart')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayActivities.map((activity) => {
                    const actType = allActivityTypes.find(t => t.id === activity.type)
                    const isHovered = hoveredActivityId === activity.id
                    return (
                      <div
                        key={activity.id}
                        onMouseEnter={() => setHoveredActivityId(activity.id)}
                        onMouseLeave={() => setHoveredActivityId(null)}
                        className={`flex items-center gap-3 p-3 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-white/80'} hover:bg-white transition-all border ${visualClasses.border} shadow-sm hover:shadow-md relative`}
                      >
                        <div className={`w-12 h-12 rounded-2xl ${actType?.color || "bg-gray-200"} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          {getIcon(activity.customIcon || actType?.icon || "circle", "w-6 h-6")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${visualClasses.text} flex items-center gap-2`}>
                            {activity.customName || actType?.name || t('custom')}
                            {activity.breastSide && (
                              <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">
                                {activity.breastSide === "left" ? `👈 ${t('leftBreast')}` : `👉 ${t('rightBreast')}`}
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${visualClasses.subtext} mt-0.5`}>
                            {activity.startTime && activity.endTime ? (
                              <span>{activity.startTime} - {activity.endTime}</span>
                            ) : (
                              <span>{activity.time}</span>
                            )}
                            {activity.totalDuration && (
                              <span className="ml-2 text-blue-500 font-semibold">
                                ({activity.totalDuration} min)
                              </span>
                            )}
                          </div>
                          {(activity.quantity || activity.duration) && (
                            <div className="text-xs text-blue-500 mt-0.5 font-medium">
                              {activity.quantity && `${activity.quantity}${activity.quantityUnit}`}
                              {activity.quantity && activity.duration && " • "}
                              {activity.duration}
                            </div>
                          )}
                          {activity.notes && (
                            <div className={`text-xs ${visualClasses.subtext} mt-0.5 truncate`}>{activity.notes}</div>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                          {activity.image && (
                            <img src={activity.image} alt="Activity" className="w-12 h-12 rounded-xl object-cover shadow-md" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const activityType = allActivityTypes.find(t => t.id === activity.type)
                              if (activityType) {
                                openActivityDetail(activityType)
                              }
                            }}
                            className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 h-8 w-8 flex-shrink-0 rounded-xl"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Deseja deletar esta atividade?')) {
                                setActivities(activities.filter(a => a.id !== activity.id))
                              }
                            }}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 flex-shrink-0 rounded-xl"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ABA 2: Estatísticas */}
          <TabsContent value="stats">
            <Card className={`p-6 ${visualClasses.card} rounded-3xl`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${currentTheme.text}`}>
                  {t('analytics')}
                </h2>
                
                {/* Tabs para alternar entre visualizações */}
                <div className="flex gap-2">
                  <Button
                    variant={statsView === "count" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatsView("count")}
                    className="text-xs rounded-xl"
                  >
                    Número de Vezes
                  </Button>
                  <Button
                    variant={statsView === "duration" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatsView("duration")}
                    className="text-xs rounded-xl"
                  >
                    Duração
                  </Button>
                </div>
              </div>
              
              {activities.length === 0 ? (
                <div className={`text-center py-12 ${visualClasses.subtext}`}>
                  <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma atividade registrada ainda</p>
                  <p className="text-sm mt-1">Comece registrando atividades para ver estatísticas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Visualização: Número de Vezes */}
                  {statsView === "count" && (
                    <>
                      {allActivityTypes.map((actType) => {
                        const typeActivities = activities.filter(a => a.type === actType.id)
                        if (typeActivities.length === 0) return null
                        
                        return (
                          <div key={actType.id} className={`p-5 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl`}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 rounded-2xl ${actType.color} flex items-center justify-center shadow-lg`}>
                                {getIcon(actType.icon, "w-6 h-6")}
                              </div>
                              <h3 className="font-semibold text-lg">{actType.name}</h3>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-5xl font-bold text-blue-400">{typeActivities.length}</div>
                              <div className="text-sm text-gray-500 mt-1">vezes registradas</div>
                            </div>
                            
                            {/* Detalhes específicos para amamentação */}
                            {actType.id === "amamentacao" && (
                              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <div className="text-3xl font-bold text-pink-400">
                                    {typeActivities.filter(a => a.breastSide === "left").length}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">👈 Esquerda</div>
                                </div>
                                <div>
                                  <div className="text-3xl font-bold text-pink-400">
                                    {typeActivities.filter(a => a.breastSide === "right").length}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">👉 Direita</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </>
                  )}
                  
                  {/* Visualização: Duração */}
                  {statsView === "duration" && (
                    <>
                      {allActivityTypes.map((actType) => {
                        const typeActivities = activities.filter(a => a.type === actType.id)
                        if (typeActivities.length === 0) return null
                        
                        const totalTime = typeActivities.reduce((sum, a) => sum + (a.totalDuration || 0), 0)
                        const avgTime = typeActivities.length > 0 ? Math.round(totalTime / typeActivities.length) : 0
                        
                        // Só mostrar se houver dados de duração
                        if (totalTime === 0) return null
                        
                        return (
                          <div key={actType.id} className={`p-5 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl`}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-12 h-12 rounded-2xl ${actType.color} flex items-center justify-center shadow-lg`}>
                                {getIcon(actType.icon, "w-6 h-6")}
                              </div>
                              <h3 className="font-semibold text-lg">{actType.name}</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-4xl font-bold text-green-400">{totalTime} min</div>
                                <div className="text-xs text-gray-500 mt-1">Tempo Total</div>
                              </div>
                              <div>
                                <div className="text-4xl font-bold text-purple-400">{avgTime} min</div>
                                <div className="text-xs text-gray-500 mt-1">Tempo Médio</div>
                              </div>
                            </div>
                            
                            {/* Detalhes específicos para amamentação com duração */}
                            {actType.id === "amamentacao" && (
                              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                                <div>
                                  <div className="text-2xl font-bold text-pink-400">
                                    {typeActivities.filter(a => a.breastSide === "left").reduce((sum, a) => sum + (a.totalDuration || 0), 0)} min
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">👈 Esquerda</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-pink-400">
                                    {typeActivities.filter(a => a.breastSide === "right").reduce((sum, a) => sum + (a.totalDuration || 0), 0)} min
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">👉 Direita</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      {/* Mensagem se não houver dados de duração */}
                      {allActivityTypes.every(actType => {
                        const typeActivities = activities.filter(a => a.type === actType.id)
                        const totalTime = typeActivities.reduce((sum, a) => sum + (a.totalDuration || 0), 0)
                        return totalTime === 0
                      }) && (
                        <div className={`text-center py-12 ${visualClasses.subtext}`}>
                          <Clock className="w-16 h-16 mx-auto mb-3 opacity-50" />
                          <p className="text-lg font-medium">Nenhuma atividade com duração registrada</p>
                          <p className="text-sm mt-1">Use o cronômetro ao registrar atividades para ver estatísticas de duração</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ABA 3: Rotina */}
          <TabsContent value="routine">
            <Card className={`p-6 ${visualClasses.card} rounded-3xl`}>
              <h2 className={`text-2xl font-bold mb-4 ${currentTheme.text}`}>
                {t('routine')}
              </h2>
              <p className={visualClasses.subtext}>
                {t('routineDescription')}
              </p>
              <div className={`mt-8 text-center ${visualClasses.subtext}`}>
                <Clock className="w-20 h-20 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">{t('comingSoon')}: {t('routinePlanning')}</p>
              </div>
            </Card>
          </TabsContent>

          {/* ABA 4: Crescimento */}
          <TabsContent value="growth">
            <Card className={`p-6 ${visualClasses.card} rounded-3xl`}>
              <h2 className={`text-2xl font-bold mb-6 ${currentTheme.text}`}>
                {t('growth')}
              </h2>
              
              <Tabs value={growthTab} onValueChange={setGrowthTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 rounded-2xl">
                  <TabsTrigger value="growth" className="rounded-xl">Crescimento</TabsTrigger>
                  <TabsTrigger value="teething" className="rounded-xl">Dentição</TabsTrigger>
                </TabsList>
                
                {/* Sub-aba: Crescimento */}
                <TabsContent value="growth" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className={visualClasses.subtext}>
                      Acompanhe o desenvolvimento físico do seu bebê
                    </p>
                    <Button onClick={() => setShowAddGrowth(true)} size="sm" className="rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                  
                  {growthRecords.length === 0 ? (
                    <div className={`text-center py-12 ${visualClasses.subtext}`}>
                      <TrendingUp className="w-20 h-20 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">Nenhum registro de crescimento ainda</p>
                      <p className="text-sm mt-1">Adicione medidas para acompanhar o desenvolvimento</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Gráfico simplificado */}
                      <div className={`p-5 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl`}>
                        <h3 className="font-semibold mb-4 text-lg">Evolução</h3>
                        <div className="space-y-2">
                          {growthRecords.map((record, index) => (
                            <div key={record.id} className="flex items-center gap-3">
                              <div className="text-xs text-gray-500 w-24 font-medium">
                                {new Date(record.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                              </div>
                              <div className="flex-1 flex gap-2">
                                <div className="flex-1 bg-blue-100 rounded-xl px-3 py-2 text-xs font-semibold">
                                  {record.weight} kg
                                </div>
                                <div className="flex-1 bg-green-100 rounded-xl px-3 py-2 text-xs font-semibold">
                                  {record.height} cm
                                </div>
                                <div className="flex-1 bg-purple-100 rounded-xl px-3 py-2 text-xs font-semibold">
                                  {record.headCircumference} cm
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Lista de registros */}
                      <div className="space-y-3">
                        {growthRecords.map((record) => (
                          <div key={record.id} className={`p-5 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="font-semibold text-lg">
                                {new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Deseja deletar este registro?')) {
                                    setGrowthRecords(growthRecords.filter(r => r.id !== record.id))
                                  }
                                }}
                                className="h-10 w-10 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <div className="text-xs text-gray-500">Peso</div>
                                <div className="font-semibold text-lg">{record.weight} kg</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Altura</div>
                                <div className="font-semibold text-lg">{record.height} cm</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Cabeça</div>
                                <div className="font-semibold text-lg">{record.headCircumference} cm</div>
                              </div>
                            </div>
                            {record.notes && (
                              <div className="mt-3 text-xs text-gray-600">{record.notes}</div>
                            )}
                            {record.images.length > 0 && (
                              <div className="mt-3 flex gap-2">
                                {record.images.map((img, idx) => (
                                  <img key={idx} src={img} alt="Growth" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                {/* Sub-aba: Dentição */}
                <TabsContent value="teething" className="space-y-4">
                  <p className={visualClasses.subtext}>
                    Acompanhe o nascimento dos dentinhos
                  </p>
                  
                  {/* Mapa de dentes realístico */}
                  <div className={`p-6 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl`}>
                    <h3 className="font-semibold mb-6 text-center text-lg">Mapa de Dentes</h3>
                    
                    {/* Arcada superior - formato de arco */}
                    <div className="mb-12">
                      <div className="text-xs text-center text-gray-500 mb-3">Superiores</div>
                      <div className="relative">
                        {/* Linha da gengiva superior */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-1 bg-pink-100 rounded-full"></div>
                        
                        <div className="flex justify-center items-end gap-1 pt-2">
                          {teethMap.upper.map((toothData) => {
                            const tooth = teethRecords.find(t => t.position === toothData.id)
                            if (!tooth) return null
                            return (
                              <ToothComponent
                                key={tooth.id}
                                tooth={tooth}
                                onClick={() => {
                                  setSelectedTooth(tooth)
                                  setShowToothDetail(true)
                                }}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Arcada inferior - formato de arco */}
                    <div>
                      <div className="text-xs text-center text-gray-500 mb-3">Inferiores</div>
                      <div className="relative">
                        <div className="flex justify-center items-start gap-1 pb-2">
                          {teethMap.lower.map((toothData) => {
                            const tooth = teethRecords.find(t => t.position === toothData.id)
                            if (!tooth) return null
                            return (
                              <ToothComponent
                                key={tooth.id}
                                tooth={tooth}
                                onClick={() => {
                                  setSelectedTooth(tooth)
                                  setShowToothDetail(true)
                                }}
                              />
                            )
                          })}
                        </div>
                        
                        {/* Linha da gengiva inferior */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-1 bg-pink-100 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Estatísticas */}
                  <div className={`p-5 ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'} rounded-2xl text-center`}>
                    <div className="text-5xl font-bold text-blue-400">
                      {teethRecords.filter(t => t.erupted).length} / 20
                    </div>
                    <div className="text-sm text-gray-500 mt-2">dentes nascidos</div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </TabsContent>

          {/* ABA 5: Conta - COM CONFIGURAÇÕES DE UNIDADES */}
          <TabsContent value="account">
            <Card className={`p-6 ${visualClasses.card} rounded-3xl`}>
              <h2 className={`text-2xl font-bold mb-6 ${currentTheme.text}`}>
                {t('account')}
              </h2>
              
              <div className="space-y-6">
                {/* Seção de Gerenciamento de Profiles */}
                <div className={`p-5 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-rose-300 rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Gerenciar Profiles</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Alterne entre diferentes bebês e gerencie seus profiles
                    </p>
                    
                    {/* Botão para abrir modal de gerenciamento */}
                    <Button 
                      onClick={() => setShowManageBabies(true)}
                      className="w-full rounded-xl bg-gradient-to-r from-pink-200 to-rose-300 hover:from-pink-300 hover:to-rose-400 text-slate-700"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Gerenciar Bebês
                    </Button>
                    
                    {/* Lista rápida de bebês */}
                    <div className="mt-4 space-y-2">
                      <Label className="text-xs text-gray-500">Bebês Cadastrados:</Label>
                      {babies.map((baby) => (
                        <div 
                          key={baby.id} 
                          className={`flex items-center justify-between p-3 rounded-xl ${
                            selectedBabyId === baby.id 
                              ? 'bg-pink-100 border-2 border-pink-300' 
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Baby className="w-5 h-5 text-slate-600" />
                            <span className="font-medium text-sm">{baby.name}</span>
                          </div>
                          {selectedBabyId === baby.id && (
                            <span className="text-xs bg-pink-200 text-pink-700 px-2 py-1 rounded-full font-semibold">
                              Ativo
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Seção de Idioma */}
                <div className={`p-5 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg">
                      <Globe className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Idioma / Language / Idioma</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm">{t('chooseLanguage')}</Label>
                    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="pt">🇧🇷 Português</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">
                      {language === 'pt' && 'Idioma atual: Português'}
                      {language === 'en' && 'Current language: English'}
                      {language === 'es' && 'Idioma actual: Español'}
                    </p>
                  </div>
                </div>

                {/* NOVA SEÇÃO: Configurações de Unidades */}
                <div className={`p-5 rounded-2xl ${visualMode === 'dark' ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-2xl flex items-center justify-center shadow-lg">
                      <Ruler className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Unidades de Medida</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Botões de padrão rápido */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={applyMetricSystem}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        Sistema Métrico
                      </Button>
                      <Button 
                        onClick={applyUSMetrics}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        US Metrics
                      </Button>
                    </div>
                    
                    {/* Peso */}
                    <div>
                      <Label className="text-sm mb-2 flex items-center gap-2">
                        <Weight className="w-4 h-4" />
                        Peso / Weight
                      </Label>
                      <Select 
                        value={unitSettings.weight} 
                        onValueChange={(value: WeightUnit) => setUnitSettings({...unitSettings, weight: value})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="kg">kg (quilogramas)</SelectItem>
                          <SelectItem value="lb">lb (libras)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Temperatura */}
                    <div>
                      <Label className="text-sm mb-2 flex items-center gap-2">
                        <Thermometer className="w-4 h-4" />
                        Temperatura / Temperature
                      </Label>
                      <Select 
                        value={unitSettings.temperature} 
                        onValueChange={(value: TemperatureUnit) => setUnitSettings({...unitSettings, temperature: value})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="celsius">°C (Celsius)</SelectItem>
                          <SelectItem value="fahrenheit">°F (Fahrenheit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Volume */}
                    <div>
                      <Label className="text-sm mb-2 flex items-center gap-2">
                        <Droplet className="w-4 h-4" />
                        Volume / Volume
                      </Label>
                      <Select 
                        value={unitSettings.volume} 
                        onValueChange={(value: VolumeUnit) => setUnitSettings({...unitSettings, volume: value})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="ml">ml (mililitros)</SelectItem>
                          <SelectItem value="oz">oz (onças)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Formato de Hora */}
                    <div>
                      <Label className="text-sm mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Formato de Hora / Time Format
                      </Label>
                      <Select 
                        value={unitSettings.timeFormat} 
                        onValueChange={(value: TimeFormat) => setUnitSettings({...unitSettings, timeFormat: value})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="24h">24h (00:00 - 23:59)</SelectItem>
                          <SelectItem value="12h">12h (AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Feedback visual */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium">
                        ✓ Configurações aplicadas imediatamente em todas as telas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Navegação inferior fixa - CORES CLARINHAS */}
          <TabsList className={`fixed bottom-0 left-0 right-0 grid w-full grid-cols-5 h-20 rounded-none border-t ${visualMode === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'} backdrop-blur-xl shadow-2xl`}>
            <TabsTrigger value="home" className="flex flex-col gap-1.5 py-3 rounded-none data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-50 data-[state=active]:to-transparent">
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">{t('home')}</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex flex-col gap-1.5 py-3 rounded-none data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-50 data-[state=active]:to-transparent">
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">{t('stats')}</span>
            </TabsTrigger>
            <TabsTrigger value="routine" className="flex flex-col gap-1.5 py-3 rounded-none data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-50 data-[state=active]:to-transparent">
              <Clock className="w-6 h-6" />
              <span className="text-xs font-medium">{t('routine')}</span>
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex flex-col gap-1.5 py-3 rounded-none data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-50 data-[state=active]:to-transparent">
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs font-medium">{t('growth')}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex flex-col gap-1.5 py-3 rounded-none data-[state=active]:bg-gradient-to-t data-[state=active]:from-blue-50 data-[state=active]:to-transparent">
              <UserCircle className="w-6 h-6" />
              <span className="text-xs font-medium">{t('account')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Modal de adicionar crescimento */}
      <Dialog open={showAddGrowth} onOpenChange={setShowAddGrowth}>
        <DialogContent className={`max-w-md ${visualClasses.card} rounded-3xl`}>
          <DialogHeader>
            <DialogTitle className="text-xl">Adicionar Registro de Crescimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={growthDate}
                onChange={(e) => setGrowthDate(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={growthWeight}
                  onChange={(e) => setGrowthWeight(e.target.value)}
                  placeholder="3.5"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">Altura (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={growthHeight}
                  onChange={(e) => setGrowthHeight(e.target.value)}
                  placeholder="50"
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">Cabeça (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={growthHeadCirc}
                  onChange={(e) => setGrowthHeadCirc(e.target.value)}
                  placeholder="35"
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={growthNotes}
                onChange={(e) => setGrowthNotes(e.target.value)}
                placeholder="Observações sobre o desenvolvimento..."
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label>Fotos</Label>
              <Button
                variant="outline"
                className="w-full mt-1 rounded-xl"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) {
                      Array.from(files).forEach(file => {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setGrowthImages([...growthImages, e.target?.result as string])
                        }
                        reader.readAsDataURL(file)
                      })
                    }
                  }
                  input.click()
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Adicionar Fotos
              </Button>
              {growthImages.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {growthImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img src={img} alt="Preview" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                      <button
                        onClick={() => setGrowthImages(growthImages.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button 
              onClick={addGrowthRecord} 
              className="w-full rounded-xl bg-gradient-to-r from-blue-200 to-purple-300 hover:from-blue-300 hover:to-purple-400 shadow-lg text-slate-700"
              disabled={!growthDate || !growthWeight || !growthHeight || !growthHeadCirc}
            >
              Salvar Registro
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes do dente */}
      <Dialog open={showToothDetail} onOpenChange={setShowToothDetail}>
        <DialogContent className={`max-w-md ${visualClasses.card} rounded-3xl`}>
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedTooth?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Dente nasceu?</Label>
              <Switch
                checked={selectedTooth?.erupted || false}
                onCheckedChange={(checked) => {
                  if (selectedTooth) {
                    const date = checked ? new Date().toISOString().split('T')[0] : undefined
                    updateTooth(selectedTooth.id, checked, date)
                    setSelectedTooth({ ...selectedTooth, erupted: checked, eruptionDate: date })
                  }
                }}
              />
            </div>
            {selectedTooth?.erupted && (
              <div>
                <Label>Data de nascimento</Label>
                <Input
                  type="date"
                  value={selectedTooth.eruptionDate || ''}
                  onChange={(e) => {
                    if (selectedTooth) {
                      updateTooth(selectedTooth.id, true, e.target.value)
                      setSelectedTooth({ ...selectedTooth, eruptionDate: e.target.value })
                    }
                  }}
                  className="mt-1 rounded-xl"
                />
              </div>
            )}
            <Button onClick={() => setShowToothDetail(false)} className="w-full rounded-xl">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de adicionar atividade customizada */}
      <Dialog open={showAddCustomActivity} onOpenChange={setShowAddCustomActivity}>
        <DialogContent className={`${visualClasses.card} rounded-3xl`}>
          <DialogHeader>
            <DialogTitle className="text-xl">{t('newCustomActivity')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('activityName')}</Label>
              <Input
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                placeholder="Ex: Vitamina, Passeio, etc."
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>{t('chooseIcon')}</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {maternityIcons.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => setNewCustomIcon(icon.icon)}
                    className={`p-3 rounded-2xl border-2 transition-all ${
                      newCustomIcon === icon.icon
                        ? "border-pink-300 bg-pink-100 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{icon.icon}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>{t('chooseColor')}</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {["bg-pink-200", "bg-blue-200", "bg-green-200", "bg-yellow-200", "bg-purple-200", "bg-cyan-200", "bg-orange-200", "bg-rose-200", "bg-indigo-200", "bg-teal-200"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCustomColor(color)}
                    className={`w-14 h-14 rounded-2xl ${color} border-2 transition-all shadow-md ${
                      newCustomColor === color
                        ? "border-gray-600 scale-110 ring-4 ring-offset-2 ring-gray-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button onClick={addCustomActivityType} className="w-full rounded-xl bg-gradient-to-r from-pink-200 to-rose-300 hover:from-pink-300 hover:to-rose-400 shadow-lg text-slate-700">
              {t('addActivity')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
