"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const [language, setLanguage] = useState<"en" | "fr">("en")

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "fr" : "en")}
      className="h-8 px-2 text-sm font-medium"
    >
      <Globe className="h-4 w-4 mr-1" />
      {language === "en" ? "FR" : "EN"}
    </Button>
  )
}
