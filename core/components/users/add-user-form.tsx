"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import "react-phone-number-input/style.css"
import { countries } from "@/core/utils/countries"
import { getCountryFlag } from "@/core/utils/country-flags"
import { SimpleDatePicker } from "@/core/components/ui/simple-date-picker"
import { getMaxPhoneLength, formatPhoneWithCountryCode } from "@/core/utils/phone-utils"
import { format } from "date-fns"
import { TokenStorage } from "@/infrastructure/storage/token-storage"

export function AddUserForm() {
  const router = useRouter()
  const tokenStorage = new TokenStorage()

  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [nationalNumber, setNationalNumber] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<{
    name: string
    code: string
    dial_code: string
  } | null>(null)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCountries, setFilteredCountries] = useState(countries)
  const phoneInputRef = useRef<HTMLInputElement>(null)

  const initialFormState = {
    email: "",
    password: "",
    fullName: "",
    city: "",
    gender: "",
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Update full phone number when national number or country changes
  useEffect(() => {
    if (selectedCountry) {
      setPhoneNumber(formatPhoneWithCountryCode(nationalNumber, selectedCountry.dial_code))
    } else {
      setPhoneNumber(nationalNumber)
    }
  }, [nationalNumber, selectedCountry])

  // Filter countries based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCountries(countries)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredCountries(
        countries.filter((country) => country.name.toLowerCase().includes(query) || country.dial_code.includes(query)),
      )
    }
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".country-dropdown-container") && !target.closest(".country-select-button")) {
        setShowCountryDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountrySelect = (country: (typeof countries)[0]) => {
    setSelectedCountry(country)
    // Set phone number to the country's dial code
    setNationalNumber("")
    setShowCountryDropdown(false)
    setSearchQuery("")

    // Focus the phone input after selecting a country
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus()
      }
    }, 100)
  }

  const toggleCountryDropdown = () => {
    setShowCountryDropdown((prev) => !prev)
    if (!showCountryDropdown) {
      setSearchQuery("")
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Only allow digits
    const digitsOnly = value.replace(/\D/g, "")

    if (selectedCountry) {
      // Get max length for this country
      const maxLength = getMaxPhoneLength(selectedCountry.code)

      // Limit to max length for this country
      const limitedValue = digitsOnly.slice(0, maxLength)

      // Update national number (without country code)
      setNationalNumber(limitedValue)
    } else {
      setNationalNumber(digitsOnly)
    }
  }

  // Update the handleSubmit function to show toast notifications after the API response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Validate form
      if (!formData.fullName || !formData.email || !formData.password) {
        setError("Please fill in all required fields")
        setIsSubmitting(false)
        return
      }

      // Get token from token storage
      const tokenStorage = new TokenStorage()
      const token = tokenStorage.getToken()

      if (!token) {
        setError("Authentication token is missing. Please log in again.")
        setIsSubmitting(false)
        return
      }

      // Prepare request body
      const requestBody = {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: phoneNumber || "",
        date_of_birth: date ? format(date, "yyyy-MM-dd") : "",
        gender: formData.gender || "",
        country: selectedCountry?.name || "",
        city: formData.city || "",
      }

      // Make API request
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error("API Error Response:", errorData)
        throw new Error(errorData?.message || `Failed to create user: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("User created successfully:", data)

      // Show success toast with the message from the API response
      toast({
        title: "Success",
        description: data.message || "User created successfully",
        variant: "success",
      })

      // Reset form and redirect
      setFormData(initialFormState)
      router.push("/dashboard/users")
    } catch (error) {
      console.error("Error creating user:", error)

      // Show error toast with the specific error message
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"

      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/users")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="country">Country</Label>
          <div className="relative">
            <button
              type="button"
              className="country-select-button flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={toggleCountryDropdown}
            >
              {selectedCountry ? (
                <span className="flex items-center">
                  <img
                    src={getCountryFlag(selectedCountry.code) || "/placeholder.svg"}
                    alt={`${selectedCountry.name} flag`}
                    className="h-4 w-6 object-cover rounded-sm mr-2"
                  />
                  <span>{selectedCountry.name}</span>
                </span>
              ) : (
                "Select country..."
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {showCountryDropdown && (
              <div className="country-dropdown-container absolute z-[9999] mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="p-2 border-b">
                  <Input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="h-8"
                    autoFocus
                  />
                </div>
                <div className="max-h-[200px] sm:max-h-[300px] overflow-y-auto p-1">
                  {filteredCountries.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500">No countries found.</div>
                  ) : (
                    filteredCountries.map((country) => (
                      <div
                        key={country.code}
                        className={`flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors ${
                          selectedCountry?.code === country.code ? "bg-primary/5 text-primary font-medium" : ""
                        }`}
                        onClick={() => handleCountrySelect(country)}
                      >
                        <img
                          src={getCountryFlag(country.code) || "/placeholder.svg"}
                          alt={`${country.name} flag`}
                          className="h-4 w-6 object-cover rounded-sm mr-2"
                        />
                        <span>{country.name}</span>
                        <span className="ml-2 text-gray-500 text-xs">{country.dial_code}</span>
                        {selectedCountry?.code === country.code && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="ml-auto h-4 w-4"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <div className="relative">
            <div className="flex">
              <div className="flex items-center h-10 px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500">
                {selectedCountry ? (
                  <div className="flex items-center">
                    <img
                      src={getCountryFlag(selectedCountry.code) || "/placeholder.svg"}
                      alt={`${selectedCountry.name} flag`}
                      className="h-4 w-5 object-cover rounded-sm mr-1"
                    />
                    <span className="text-sm font-medium">{selectedCountry.dial_code}</span>
                  </div>
                ) : (
                  <span className="text-sm">Select country</span>
                )}
              </div>
              <Input
                ref={phoneInputRef}
                id="phone"
                name="phone"
                type="tel"
                placeholder="Phone number"
                value={nationalNumber}
                onChange={handlePhoneChange}
                className="h-10 rounded-l-none"
                disabled={!selectedCountry}
                maxLength={selectedCountry ? getMaxPhoneLength(selectedCountry.code) : undefined}
              />
            </div>
            {selectedCountry && (
              <p className="text-xs text-gray-500 mt-1">Max {getMaxPhoneLength(selectedCountry.code)} digits</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="city" value={formData.city} onChange={handleChange} />
        </div>

        {/* Date Picker */}
        <div className="space-y-2 relative">
          <Label htmlFor="birthDate">Birth Date</Label>
          <SimpleDatePicker date={date} onDateChange={handleDateSelect} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={(value) => handleSelectChange("gender", value)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="select" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-2 mt-8">
        <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add"}
        </Button>
      </div>
    </form>
  )
}
