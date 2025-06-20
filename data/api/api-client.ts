import { env } from "@/infrastructure/config/env"
import { TokenStorage } from "@/infrastructure/storage/token-storage"
import { checkUnauthorized } from "@/core/auth/auth-interceptor"

export class ApiClient {
  private baseUrl: string
  private tokenStorage: TokenStorage

  constructor() {
    this.baseUrl = env.API_BASE_URL
    this.tokenStorage = new TokenStorage()
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    const token = this.tokenStorage.getToken()
    if (token) {
      // Use Bearer token authentication format
      headers["Authorization"] = `Bearer ${token}`
      console.log("Adding Authorization header with Bearer token")
    }

    return headers
  }

  async get<T>(endpoint: string, queryParams?: Record<string, any>): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`

    if (queryParams) {
      const params = new URLSearchParams()
      Object.entries(queryParams).forEach(([key, value]) => {
        // Only add parameters that are defined and not null or empty strings
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })

      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    console.log(`[API] GET Request URL: ${url}`)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      })

      console.log(`[API] GET Response Status: ${response.status}`)

      // Get the response text
      const responseText = await response.text()
      console.log(`[API] GET Response Text:`, responseText)

      // Parse the response if possible
      let responseData = {}
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        // If it's not valid JSON, use the text as is
        responseData = { message: responseText }
      }

      // Check for unauthorized response with the parsed data
      if (checkUnauthorized(response.status, responseData)) {
        throw new Error("Unauthorized: Invalid token")
      }

      if (!response.ok) {
        console.error(`[API] GET Request Failed: ${url}`, {
          status: response.status,
          statusText: response.statusText,
          responseData,
        })

        throw new Error(responseData.message || `HTTP error ${response.status}: ${response.statusText}`)
      }

      console.log(`[API] GET Response Data:`, responseData)
      return responseData as T
    } catch (error) {
      console.error(`[API] Network or parsing error during GET request to ${url}:`, error)
      throw error
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log(`[API] POST Request URL: ${url}`)
    console.log(`[API] POST Request Body:`, data)

    try {
      const headers = this.getHeaders()
      console.log(`[API] POST Request Headers:`, headers)

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      })

      console.log(`[API] POST Response Status: ${response.status}`)

      // Get the response text
      const responseText = await response.text()
      console.log(`[API] POST Response Text:`, responseText)

      // Parse the response if possible
      let responseData = {}
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        // If it's not valid JSON, use the text as is
        responseData = { message: responseText }
      }

      // Check for unauthorized response with the parsed data
      if (checkUnauthorized(response.status, responseData)) {
        throw new Error("Unauthorized: Invalid token")
      }

      if (!response.ok) {
        console.error(`[API] POST Request Failed: ${url}`, {
          status: response.status,
          statusText: response.statusText,
          responseData,
        })

        throw new Error(responseData.message || `HTTP error ${response.status}: ${response.statusText}`)
      }

      console.log(`[API] POST Response Data:`, responseData)
      return responseData as T
    } catch (error) {
      console.error(`[API] Network or parsing error during POST request to ${url}:`, error)
      throw error
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log(`[API] PUT Request URL: ${url}`)
    console.log(`[API] PUT Request Body:`, data)

    try {
      const headers = this.getHeaders()
      console.log(`[API] PUT Request Headers:`, headers)

      const response = await fetch(url, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(data),
      })

      console.log(`[API] PUT Response Status: ${response.status}`)

      // Get the response text
      const responseText = await response.text()
      console.log(`[API] PUT Response Text:`, responseText)

      // Parse the response if possible
      let responseData = {}
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        // If it's not valid JSON, use the text as is
        responseData = { message: responseText }
      }

      // Check for unauthorized response with the parsed data
      if (checkUnauthorized(response.status, responseData)) {
        throw new Error("Unauthorized: Invalid token")
      }

      if (!response.ok) {
        console.error(`[API] PUT Request Failed: ${url}`, {
          status: response.status,
          statusText: response.statusText,
          responseData,
        })

        throw new Error(responseData.message || `HTTP error ${response.status}: ${response.statusText}`)
      }

      console.log(`[API] PUT Response Data:`, responseData)
      return responseData as T
    } catch (error) {
      console.error(`[API] Network or parsing error during PUT request to ${url}:`, error)
      throw error
    }
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log(`[API] PATCH Request URL: ${url}`)
    console.log(`[API] PATCH Request Body:`, data)

    try {
      const headers = this.getHeaders()
      console.log(`[API] PATCH Request Headers:`, headers)

      const response = await fetch(url, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(data),
      })

      console.log(`[API] PATCH Response Status: ${response.status}`)

      // Get the response text
      const responseText = await response.text()
      console.log(`[API] PATCH Response Text:`, responseText)

      // Parse the response if possible
      let responseData = {}
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        // If it's not valid JSON, use the text as is
        responseData = { message: responseText }
      }

      // Check for unauthorized response with the parsed data
      if (checkUnauthorized(response.status, responseData)) {
        throw new Error("Unauthorized: Invalid token")
      }

      if (!response.ok) {
        console.error(`[API] PATCH Request Failed: ${url}`, {
          status: response.status,
          statusText: response.statusText,
          responseData,
        })

        throw new Error(responseData.message || `HTTP error ${response.status}: ${response.statusText}`)
      }

      console.log(`[API] PATCH Response Data:`, responseData)
      return responseData as T
    } catch (error) {
      console.error(`[API] Network or parsing error during PATCH request to ${url}:`, error)
      throw error
    }
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log(`[API] DELETE Request URL: ${url}`)
    if (data) {
      console.log(`[API] DELETE Request Body:`, data)
    }

    try {
      const headers = this.getHeaders()
      console.log(`[API] DELETE Request Headers:`, headers)

      const options: RequestInit = {
        method: "DELETE",
        headers: headers,
      }

      // Add body if data is provided
      if (data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      console.log(`[API] DELETE Response Status: ${response.status}`)

      // Get the response text
      const responseText = await response.text()
      console.log(`[API] DELETE Response Text:`, responseText)

      // Parse the response if possible
      let responseData = {}
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        // If it's not valid JSON, use the text as is
        responseData = { message: responseText }
      }

      // Check for unauthorized response with the parsed data
      if (checkUnauthorized(response.status, responseData)) {
        throw new Error("Unauthorized: Invalid token")
      }

      if (!response.ok) {
        console.error(`[API] DELETE Request Failed: ${url}`, {
          status: response.status,
          statusText: response.statusText,
          responseData,
        })

        throw new Error(responseData.message || `HTTP error ${response.status}: ${response.statusText}`)
      }

      console.log(`[API] DELETE Response Data:`, responseData)
      return responseData as T
    } catch (error) {
      console.error(`[API] Network or parsing error during DELETE request to ${url}:`, error)
      throw error
    }
  }
}
