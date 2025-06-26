"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Submit to API route
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to submit email")
      }
      
      // Show success and reset form
      setIsSubmitted(true)
      setEmail("")
      
      toast({
        title: "Thank you!",
        description: "You've been added to our waitlist.",
      })
    } catch (error) {
      console.error("Waitlist submission error:", error)
      toast({
        title: "Something went wrong",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-muted p-6 rounded-lg text-center">
        <h3 className="font-medium text-lg mb-2">You're on the list!</h3>
        <p className="text-muted-foreground">
          We'll notify you when it's your turn to get access. Thanks for your interest!
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          className="h-12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="h-12"
        >
          {isLoading ? "Joining..." : "Join Waitlist"}
        </Button>
      </div>
      <p className="text-xs text-center text-muted-foreground">
        We'll notify you when it's your turn. No spam, ever.
      </p>
    </form>
  )
}
