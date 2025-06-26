import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap, Brain, Target, Shield, ArrowRight, Code, FileText, BarChart3, RocketIcon, Sparkles, MessageSquare } from "lucide-react"
import Link from "next/link"
import WaitlistForm from "@/components/WaitlistForm"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex items-center justify-between h-14">
          <div className="font-bold text-xl">AI SaaS</div>
          <nav>
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="py-20 lg:py-32">
        <div className="container flex flex-col items-center text-center space-y-8">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            Now in beta - get early access
          </div>
          <h1 className="font-bold text-4xl lg:text-6xl max-w-3xl">
            Get the right AI model for every prompt
          </h1>
          <p className="max-w-[42rem] text-muted-foreground text-xl">
            Our intelligent routing system automatically selects the best AI model
            for your specific query - saving you money and delivering better results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Get Started <Sparkles className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20 bg-muted">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful AI, Simple Interface
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg">
              <div className="p-2 bg-primary/10 w-fit rounded-lg mb-4">
                <RocketIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Model Selection</h3>
              <p className="text-muted-foreground">
                Automatically routes your prompt to the best AI model for the task.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="p-2 bg-primary/10 w-fit rounded-lg mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cost Efficient</h3>
              <p className="text-muted-foreground">
                Only use powerful (expensive) models when needed, saving you money.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg">
              <div className="p-2 bg-primary/10 w-fit rounded-lg mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Conversation Memory</h3>
              <p className="text-muted-foreground">
                Maintains context across model switches for coherent conversations.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Start for free, upgrade when you need more capacity. No hidden costs.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free plan */}
            <div className="border rounded-lg p-8">
              <div className="mb-4 text-muted-foreground font-medium">FREE</div>
              <h3 className="text-4xl font-bold mb-2">$0</h3>
              <p className="text-muted-foreground mb-6">For casual users</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  10 prompts per day
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Smart model routing
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Conversation history
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/auth/login">Get Started</Link>
              </Button>
            </div>
            
            {/* Pro plan */}
            <div className="border border-primary rounded-lg p-8 shadow-sm">
              <div className="mb-4 text-primary font-medium">PRO</div>
              <h3 className="text-4xl font-bold mb-2">$19</h3>
              <p className="text-muted-foreground mb-6">Per month</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  100 prompts per month
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Priority access to newer models
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Export conversation history
                </li>
                <li className="flex items-center">
                  <svg className="mr-2 h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Email support
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/auth/login">Upgrade to Pro</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Join waitlist */}
      <section className="py-20 bg-muted">
        <div className="container max-w-xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Join Our Waitlist
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            We're rolling out access gradually. Sign up to be notified when it's your turn.
          </p>
          <WaitlistForm />
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI SaaS. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
