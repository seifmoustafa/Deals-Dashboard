"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, parseISO } from "date-fns"
import { Loader2, AlertCircle } from "lucide-react"
import "react-phone-number-input/style.css"
import { countries } from "@/core/utils/countries"
import { getCountryFlag } from "@/core/utils/country-flags"
import { userService } from "@/infrastructure/di/container"
import type { User } from "@/domain/entities/user"
import { SimpleDatePicker } from "@/core/components/ui/simple-date-picker"
import { getMaxPhoneLength, formatPhoneWithCountryCode, extractNationalNumber } from "@/core/utils/phone-utils"
import { showToast } from "@/core/components/ui/animated-toast"
import { useToast } from "@/components/ui/use-toast"

interface EditUserFormProps {
  userName: string
}

export function EditUserForm({ userName }: EditUserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
  const [user, setUser] = useState<User | null>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    city: "",
    gender: "",
  })

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsFetching(true)
        setError(null)

        // Convert URL-friendly name back to original format
        const decodedName = decodeURIComponent(userName.replace(/-/g, " "))
        console.log("Fetching user with name:", decodedName)

        // Simulate a delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 500))

        try {
          const userData = await userService.getUserByName(decodedName)

          // Check if Firebase UID is missing but don't throw an error
          if (!userData.firebaseUid) {
            console.warn("User found but Firebase UID is missing")
            setError("User found but Firebase UID is missing. You can view user details, but updates cannot be saved.")
          }

          setUser(userData)

          // Set form data
          setFormData({
            email: userData.email || "",
            fullName: userData.fullName || "",
            city: userData.city || "",
            gender: userData.gender || "",
          })

          // Set phone number
          if (userData.phone) {
            setPhoneNumber(userData.phone)
          }

          // Set date of birth
          if (userData.dateOfBirth) {
            try {
              setDate(parseISO(userData.dateOfBirth))
            } catch (e) {
              console.error("Failed to parse date:", e)
            }
          }

          // Set country
          if (userData.country) {
            const country = countries.find((c) => c.name === userData.country)
            if (country) {
              setSelectedCountry(country)

              // Extract national number if phone exists
              if (userData.phone) {
                setNationalNumber(extractNationalNumber(userData.phone, country.dial_code))
              }
            }
          }
        } catch (error: any) {
          console.error("Failed to fetch user:", error)
          setError(error.message || "Failed to fetch user data")

          // Create a mock user for demonstration purposes
          const mockUser: User = {
            id: "mock-id",
            firebaseUid: "mock-firebase-uid",
            email: "user@example.com",
            fullName: decodedName || "Unknown User",
            phone: "",
            dateOfBirth: "",
            gender: "",
            country: "",
            city: "",
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          setUser(mockUser)

          // Set form data with mock user
          setFormData({
            email: mockUser.email,
            fullName: mockUser.fullName,
            city: "",
            gender: "",
          })
        }
      } finally {
        setIsFetching(false)
      }
    }

    fetchUser()
  }, [userName, router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null) // Clear any previous errors

    try {
      // Only include fields that have changed
      const userData: Partial<User> = {}

      if (formData.fullName !== user?.fullName) userData.fullName = formData.fullName

      // Always include phone number in the update if it's not empty
      if (phoneNumber) {
        userData.phone = phoneNumber
      }

      if (selectedCountry?.name !== user?.country) userData.country = selectedCountry?.name
      if (formData.city !== user?.city) userData.city = formData.city
      if (formData.gender !== user?.gender) userData.gender = formData.gender || undefined

      // Format date properly if it exists
      if (date) {
        const formattedDate = format(date, "yyyy-MM-dd")
        const userDateOfBirth = user?.dateOfBirth ? format(parseISO(user.dateOfBirth), "yyyy-MM-dd") : null

        if (formattedDate !== userDateOfBirth) {
          userData.dateOfBirth = formattedDate
        }
      } else if (user?.dateOfBirth) {
        // If date was cleared but user had a date before
        userData.dateOfBirth = null
      }

      console.log("Updating user with data:", userData)
      console.log("User Firebase UID:", user?.firebaseUid)

      // Only make the API call if there are changes
      if (Object.keys(userData).length > 0) {
        if (!user?.firebaseUid) {
          const errorMessage = "Cannot update user: Missing Firebase UID"
          setError(errorMessage)

          showToast({
            title: "Error",
            message: errorMessage,
            type: "error",
          })
          setIsLoading(false)
          return
        }

        try {
          await userService.updateUser(user.firebaseUid, userData)

          showToast({
            title: "Success",
            message: "User updated successfully",
            type: "success",
          })

          // Navigate after successful update
          router.push("/dashboard/users")
        } catch (updateError: any) {
          console.error("API Error:", updateError)
          const errorMessage = updateError.message || "Failed to update user"
          setError(`Failed to update user: ${errorMessage}`)

          showToast({
            title: "Error",
            message: errorMessage,
            type: "error",
          })
        }
      } else {
        showToast({
          title: "Info",
          message: "No changes were made to the user",
          type: "info",
        })
        router.push("/dashboard/users")
      }
    } catch (error: any) {
      console.error("Failed to update user:", error)
      setError(error.message || "An unexpected error occurred")
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard/users")
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Loading user data...</span>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="flex items-center text-red-500 mb-4">
          <AlertCircle className="h-8 w-8 mr-2" />
          <span className="text-lg font-medium">Error loading user</span>
        </div>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => router.push("/dashboard/users")} className="bg-green-600 hover:bg-green-700">
          Return to Users
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto" noValidate>
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              {error}. You can still edit this user, but some data may be missing or incorrect.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            disabled
            className="h-10 bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
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
          <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
            <SelectTrigger>
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

      <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-2 mt-8">
        <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update"}
        </Button>
      </div>
    </form>
  )
}
