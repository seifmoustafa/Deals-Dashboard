"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/core/localization/translation-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage} className="font-medium">
      {language === "en" ? "العربية" : "English"}
    </Button>
  )
}
