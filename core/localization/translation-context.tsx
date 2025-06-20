"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import enTranslations from "@/locales/en.json"
import arTranslations from "@/locales/ar.json"

type Language = "en" | "ar"
type TranslationKey = string
type TranslationParams = Record<string, string | number>

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey, params?: TranslationParams) => string
  dir: "ltr" | "rtl"
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

const translations = {
  en: enTranslations,
  ar: arTranslations,
}

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to English until a language switcher is added to the UI
  const [language, setLanguage] = useState<Language>("en")
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr")

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Update document direction when language changes
  useEffect(() => {
    setDir(language === "ar" ? "rtl" : "ltr")
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: TranslationKey, params?: TranslationParams): string => {
    // Split the key by dots to access nested properties
    const keys = key.split(".")

    // Get the translation object for the current language
    let translation: any = translations[language]

    // Navigate through the nested properties
    for (const k of keys) {
      if (!translation || typeof translation !== "object") {
        return key // Return the key if translation not found
      }
      translation = translation[k]
    }

    // If translation is not a string, return the key
    if (typeof translation !== "string") {
      return key
    }

    // Replace parameters in the translation string
    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue))
      }, translation)
    }

    return translation
  }

  return <TranslationContext.Provider value={{ language, setLanguage, t, dir }}>{children}</TranslationContext.Provider>
}

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
