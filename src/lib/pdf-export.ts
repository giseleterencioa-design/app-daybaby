// Sistema de exportação de relatórios em PDF

import { translations, Language } from './i18n'

export type Activity = {
  id: string
  type: string
  time: string
  date: string
  duration?: string
  notes?: string
  customName?: string
  quantity?: number
  quantityUnit?: 'ml' | 'oz'
  breastSide?: 'left' | 'right'
}

export type Baby = {
  id: string
  name: string
  birthDate: Date
}

export type ReportData = {
  baby: Baby
  activities: Activity[]
  startDate: Date
  endDate: Date
  language: Language
}

// Gerar relatório em HTML (que pode ser convertido para PDF)
export function generateHTMLReport(data: ReportData): string {
  const t = translations[data.language]
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(data.language === 'pt' ? 'pt-BR' : data.language === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }
  
  const calculateAge = (birthDate: Date) => {
    const today = new Date()
    const birth = new Date(birthDate)
    
    let months = (today.getFullYear() - birth.getFullYear()) * 12
    months -= birth.getMonth()
    months += today.getMonth()
    
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)) % 30
    
    return { months, days }
  }
  
  const age = calculateAge(data.baby.birthDate)
  
  // Agrupar atividades por tipo
  const activityGroups = data.activities.reduce((acc, activity) => {
    const type = activity.customName || activity.type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(activity)
    return acc
  }, {} as Record<string, Activity[]>)
  
  const html = `
<!DOCTYPE html>
<html lang="${data.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.exportReport} - ${data.baby.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #f472b6;
    }
    
    .header h1 {
      font-size: 32px;
      color: #ec4899;
      margin-bottom: 10px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    .header .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .header .date-range {
      font-size: 14px;
      color: #999;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 20px;
      color: #ec4899;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #fce7f3;
    }
    
    .activity-group {
      margin-bottom: 25px;
      background: #fef2f2;
      padding: 15px;
      border-radius: 8px;
    }
    
    .activity-group-title {
      font-size: 18px;
      color: #be123c;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .activity-count {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .activity-item {
      background: white;
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 6px;
      border-left: 4px solid #f472b6;
    }
    
    .activity-time {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }
    
    .activity-details {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .activity-notes {
      font-size: 13px;
      color: #999;
      font-style: italic;
      margin-top: 6px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .summary {
      background: #fef2f2;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #fce7f3;
    }
    
    .summary-item:last-child {
      border-bottom: none;
    }
    
    .summary-label {
      font-weight: 600;
      color: #be123c;
    }
    
    .summary-value {
      color: #666;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #fce7f3;
      color: #999;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .activity-group {
        page-break-inside: avoid;
      }
    }
    
    /* Garantir que textos longos não quebrem layout */
    h1, h2, h3, p, span, div {
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${t.exportReport}</h1>
    <div class="subtitle">${data.baby.name} - ${age.months}${t.age === 'Age' ? 'm' : 'm'} ${age.days}${t.age === 'Age' ? 'd' : 'd'}</div>
    <div class="date-range">${formatDate(data.startDate)} - ${formatDate(data.endDate)}</div>
  </div>
  
  <div class="section">
    <h2 class="section-title">${t.activities}</h2>
    ${Object.entries(activityGroups).map(([type, activities]) => `
      <div class="activity-group">
        <div class="activity-group-title">${type}</div>
        <div class="activity-count">${activities.length} ${activities.length === 1 ? (data.language === 'pt' ? 'registro' : data.language === 'es' ? 'registro' : 'record') : (data.language === 'pt' ? 'registros' : data.language === 'es' ? 'registros' : 'records')}</div>
        ${activities.map(activity => `
          <div class="activity-item">
            <div class="activity-time">${activity.time} - ${new Date(activity.date).toLocaleDateString(data.language === 'pt' ? 'pt-BR' : data.language === 'es' ? 'es-ES' : 'en-US', { day: '2-digit', month: 'short' })}</div>
            ${activity.breastSide ? `<div class="activity-details">${t.breastSide}: ${activity.breastSide === 'left' ? t.leftBreast : t.rightBreast}</div>` : ''}
            ${activity.quantity ? `<div class="activity-details">${t.quantity}: ${activity.quantity}${activity.quantityUnit}</div>` : ''}
            ${activity.duration ? `<div class="activity-details">${t.duration}: ${activity.duration}</div>` : ''}
            ${activity.notes ? `<div class="activity-notes">${activity.notes}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>
  
  <div class="summary">
    <h2 class="section-title">${data.language === 'pt' ? 'Resumo' : data.language === 'es' ? 'Resumen' : 'Summary'}</h2>
    <div class="summary-item">
      <span class="summary-label">${data.language === 'pt' ? 'Total de Atividades' : data.language === 'es' ? 'Total de Actividades' : 'Total Activities'}</span>
      <span class="summary-value">${data.activities.length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">${data.language === 'pt' ? 'Tipos de Atividades' : data.language === 'es' ? 'Tipos de Actividades' : 'Activity Types'}</span>
      <span class="summary-value">${Object.keys(activityGroups).length}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">${data.language === 'pt' ? 'Período' : data.language === 'es' ? 'Período' : 'Period'}</span>
      <span class="summary-value">${Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))} ${data.language === 'pt' ? 'dias' : data.language === 'es' ? 'días' : 'days'}</span>
    </div>
  </div>
  
  <div class="footer">
    ${data.language === 'pt' ? 'Gerado por' : data.language === 'es' ? 'Generado por' : 'Generated by'} Daybaby - ${formatDate(new Date())}
  </div>
</body>
</html>
  `
  
  return html
}

// Exportar relatório (abre em nova janela para impressão/salvar como PDF)
export function exportReport(data: ReportData) {
  const html = generateHTMLReport(data)
  
  // Abrir em nova janela
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Aguardar carregamento e abrir diálogo de impressão
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }
}
