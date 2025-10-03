"use client"

import { useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"
import { fr } from "date-fns/locale"

interface EnhancedCalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  disabledDates?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
}

export function EnhancedCalendar({ 
  selectedDate, 
  onDateSelect, 
  disabledDates = () => false,
  minDate = new Date(),
  maxDate
}: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { themeColors, isDark } = useTheme()

  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => {
    return themeColors.colors.primary[shade]
  }

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })
    
    // Add padding days from previous month
    const firstDayOfWeek = start.getDay()
    const paddingDays = []
    for (let i = firstDayOfWeek; i > 0; i--) {
      paddingDays.push(subMonths(start, 1).getDate() - i + 1)
    }
    
    return { days, paddingDays }
  }

  const { days, paddingDays } = getDaysInMonth()

  return (
          <Card className="p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl relative z-[99999] calendar-popover">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            style={{
              color: getThemeColor(600)
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            style={{
              color: getThemeColor(600)
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="text-xs px-3 py-1 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          Aujourd'hui
        </Button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding days from previous month */}
        {paddingDays.map((day, index) => (
          <div
            key={`padding-${index}`}
            className="h-10 w-10 flex items-center justify-center text-slate-300 dark:text-slate-600 text-sm"
          >
            {day}
          </div>
        ))}
        
        {/* Current month days */}
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isCurrentDay = isToday(day)
          const isDisabled = day < minDate || (maxDate && day > maxDate) || disabledDates(day)
          
          return (
            <Button
              key={day.toISOString()}
              variant="ghost"
              size="sm"
              onClick={() => !isDisabled && onDateSelect(day)}
              disabled={isDisabled}
              className={`h-10 w-10 p-0 text-sm font-medium transition-all duration-300 ${
                isSelected 
                  ? 'text-white font-bold shadow-lg scale-105' 
                  : isCurrentDay 
                    ? 'text-white font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              style={{
                backgroundColor: isSelected 
                  ? getThemeColor(600)
                  : isCurrentDay 
                    ? getThemeColor(500)
                    : 'transparent',
                boxShadow: isSelected 
                  ? `0 4px 12px -2px ${getThemeColor(500)}40, 0 2px 4px -1px ${getThemeColor(500)}20`
                  : 'none',
                borderRadius: '8px',
                border: isSelected ? `2px solid ${getThemeColor(700)}` : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {format(day, 'd')}
            </Button>
          )
        })}
      </div>

      {/* Quick Navigation */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          {[1, 2, 3, 6].map((months) => (
            <Button
              key={months}
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(new Date(), months))}
              className="text-xs px-2 py-1 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              +{months} mois
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
} 