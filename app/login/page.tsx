"use client"

import LoginForm from "@/core/components/auth/login-form"
import { DealsLogo } from "@/core/components/ui/deals-logo"
import Image from "next/image"
import { useState, useEffect } from "react"

export default function LoginPage() {
  // Add state to track image loading
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Set images as loaded after component mounts
  useEffect(() => {
    setImagesLoaded(true)
  }, [])

  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="flex w-full flex-col p-4 sm:p-6">
        <div className="mb-6 sm:mb-12">
          <DealsLogo />
        </div>

        <div className="flex flex-1 flex-col items-center">
          {/* Image shown on mobile */}
          <div className="w-full mb-8 md:hidden group">
            <div className="relative h-[200px] sm:h-[250px] w-full max-w-xs mx-auto">
              <Image
                src="/login.png"
                alt="Login illustration"
                fill
                className={`object-contain animate-float transition-all duration-300 ease-in-out 
                          group-hover:scale-105 group-hover:brightness-110 group-hover:drop-shadow-md
                          ${imagesLoaded ? "opacity-100" : "opacity-0"}`}
                priority
                onLoadingComplete={() => setImagesLoaded(true)}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full items-center justify-between">
            {/* Image hidden on mobile, shown on desktop */}
            <div className="hidden md:block md:w-1/2 lg:w-[45%] group">
              <div className="relative h-[300px] lg:h-[400px] w-full max-w-md mx-auto">
                <Image
                  src="/login.png"
                  alt="Login illustration"
                  fill
                  className={`object-contain animate-float transition-all duration-300 ease-in-out 
                            group-hover:scale-105 group-hover:brightness-110 group-hover:drop-shadow-md
                            ${imagesLoaded ? "opacity-100" : "opacity-0"}`}
                  priority
                  onLoadingComplete={() => setImagesLoaded(true)}
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 lg:w-[45%] max-w-md mx-auto">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
