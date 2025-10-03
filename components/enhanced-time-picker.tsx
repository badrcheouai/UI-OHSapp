"use client"

import { useState } from "react"
import { useTheme } from "@/contexts/ThemeContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, ChevronUp, ChevronDown } from "lucide-react"

interface EnhancedTimePickerProps {
  selectedTime: string
  onTimeSelect: (time: string) => void
  minTime?: string
  maxTime?: string
  interval?: number // minutes interval
}

export function EnhancedTimePicker({ 
  selectedTime, 
  onTimeSelect, 
  minTime = "08:00",
  maxTime = "18:00",
  interval = 30
}: EnhancedTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { themeColors, isDark } = useTheme()

  const getThemeColor = (shade: keyof typeof themeColors.colors.primary) => {
    return themeColors.colors.primary[shade]
  }

  const generateTimeSlots = () => {
    const slots = []
    const [minHour, minMinute] = minTime.split(':').map(Number)
    const [maxHour, maxMinute] = maxTime.split(':').map(Number)
    
    let currentHour = minHour
    let currentMinute = minMinute
    
    while (
      currentHour < maxHour || 
      (currentHour === maxHour && currentMinute <= maxMinute)
    ) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      slots.push(timeString)
      
      currentMinute += interval
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour++
      }
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()

  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':')
    return `${hours}h${minutes}`
  }

  const handleTimeSelect = (time: string) => {
    onTimeSelect(time)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200"
        style={{
          borderColor: isOpen ? getThemeColor(500) : undefined,
          boxShadow: isOpen ? `0 0 0 2px ${getThemeColor(500)}20` : undefined
        }}
      >
        <Clock className="mr-2 h-4 w-4" style={{ color: getThemeColor(600) }} />
        {selectedTime ? formatTimeForDisplay(selectedTime) : "Sélectionner une heure"}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-[99999] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl p-4 time-picker-dropdown">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Sélectionner l'heure
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1 h-6 w-6"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time
              const isCurrentTime = time === new Date().toTimeString().slice(0, 5)
              
              return (
                <Button
                  key={time}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTimeSelect(time)}
                  className={`h-10 text-sm font-medium transition-all duration-300 ${
                    isSelected 
                      ? 'text-white font-bold shadow-lg scale-105' 
                      : isCurrentTime 
                        ? 'text-white font-bold' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  style={{
                    backgroundColor: isSelected 
                      ? getThemeColor(600)
                      : isCurrentTime 
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
                  {formatTimeForDisplay(time)}
                </Button>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTimeSelect(new Date().toTimeString().slice(0, 5))}
                className="text-xs px-3 py-1 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Maintenant
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTimeSelect("12:00")}
                className="text-xs px-3 py-1 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Midi
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 