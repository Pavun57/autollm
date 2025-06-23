"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    useCase: "",
    aiExperience: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string;
    company?: string;
    role?: string;
  }>({})
  const [submissionError, setSubmissionError] = useState<string>("")
  const router = useRouter()

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; company?: string; role?: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company is required"
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/thank-you")
      } else {
        // Handle different response types
        let errorMessage = "Something went wrong. Please try again."

        try {
          const contentType = response.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } else {
            const errorText = await response.text()
            console.error("Non-JSON error response:", errorText)
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError)
        }

        // You could show a toast notification here instead of console.error
        setSubmissionError(errorMessage)

        // Optionally set an error state to show to the user
        // setSubmissionError(errorMessage)
      }
    } catch (error) {
      console.error("Network error submitting form:", error)
      // You could show a toast notification here
      setSubmissionError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }

    // Clear submission error when user starts typing
    if (submissionError) {
      setSubmissionError("")
    }
  }

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user selects an option
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }

    // Clear submission error when user makes a selection
    if (submissionError) {
      setSubmissionError("")
    }
  }

  return (
    <Card className="border-indigo-100 shadow-lg">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="text"
              name="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleInputChange}
              className={`h-12 text-lg ${errors.name ? "border-red-500" : "border-indigo-200 focus:border-indigo-500"}`}
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <Input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleInputChange}
              className={`h-12 text-lg ${errors.email ? "border-red-500" : "border-indigo-200 focus:border-indigo-500"}`}
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <Input
              type="text"
              name="company"
              placeholder="Your company or organization"
              value={formData.company}
              onChange={handleInputChange}
              className={`h-12 text-lg ${errors.company ? "border-red-500" : "border-indigo-200 focus:border-indigo-500"}`}
              disabled={isLoading}
            />
            {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
          </div>

          <div>
            <Input
              type="text"
              name="role"
              placeholder="Your role or job title"
              value={formData.role}
              onChange={handleInputChange}
              className={`h-12 text-lg ${errors.role ? "border-red-500" : "border-indigo-200 focus:border-indigo-500"}`}
              disabled={isLoading}
            />
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          <div>
            <Select 
              name="aiExperience" 
              value={formData.aiExperience} 
              onValueChange={(value) => handleSelectChange(value, "aiExperience")}
              disabled={isLoading}
            >
              <SelectTrigger className={`h-12 border-indigo-200 focus:border-indigo-500`}>
                <SelectValue placeholder="Your experience with AI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner - Just starting with AI</SelectItem>
                <SelectItem value="intermediate">Intermediate - Some experience with AI tools</SelectItem>
                <SelectItem value="advanced">Advanced - Regular AI user</SelectItem>
                <SelectItem value="expert">Expert - AI professional or developer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Textarea
              name="useCase"
              placeholder="How do you plan to use AutoLLM? (Optional)"
              value={formData.useCase}
              onChange={handleInputChange}
              className={`min-h-[100px] text-lg border-indigo-200 focus:border-indigo-500`}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Joining Waitlist...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                Join the Waitlist
              </>
            )}
          </Button>
        </form>

        {submissionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{submissionError}</p>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4 text-center">
          Get early access to intelligent AI model routing. No spam, ever.
        </p>
      </CardContent>
    </Card>
  )
}
