import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap, Brain, Target, Shield, ArrowRight, Code, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"
import WaitlistForm from "@/components/WaitlistForm"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AutoLLM
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">
                How It Works
              </Link>
            </nav>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              asChild
            >
              <Link href="#waitlist">
                Join Waitlist
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
              🤖 AI-Powered Model Routing - Join the Waitlist
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                The Smartest
              </span>
              <br />
              <span className="text-gray-900">AI Assistant</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AutoLLM automatically chooses the best language model (GPT-4, Claude, Gemini) for your specific task,
              delivering the most intelligent response every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link href="#waitlist">
                  Join the Waitlist
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-lg px-8 py-6 rounded-xl"
              >
                See How It Works
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Brain className="w-4 h-4 text-indigo-500" />
                <span>Smart Routing</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-green-500" />
                <span>Best Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why AutoLLM?</h2>
            <p className="text-lg text-gray-600 mb-12">
              Stop wasting time choosing between different AI models. AutoLLM analyzes your task and automatically
              routes it to the most capable language model, whether that's GPT-4 for reasoning, Claude for analysis, or
              Gemini for creative tasks.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Intelligent Routing</h3>
                <p className="text-gray-600">
                  Our AI analyzes your prompt and automatically selects the best model for optimal results.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Best-in-Class Results</h3>
                <p className="text-gray-600">Get superior responses by leveraging each model's unique strengths.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Experience</h3>
                <p className="text-gray-600">
                  One interface, multiple models. No more switching between different AI tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AutoLLM combines the best of all worlds, giving you access to multiple AI models through one intelligent
              interface.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Smart Model Selection",
                description:
                  "Automatically routes your task to GPT-4, Claude, Gemini, or other top models based on task type.",
              },
              {
                icon: Code,
                title: "Code Generation",
                description: "Optimized routing for programming tasks, using the best coding-focused models available.",
              },
              {
                icon: FileText,
                title: "Content Writing",
                description: "Perfect model selection for creative writing, copywriting, and content generation tasks.",
              },
              {
                icon: BarChart3,
                title: "Data Analysis",
                description: "Intelligent routing to models that excel at analytical thinking and data interpretation.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized API calls and caching ensure you get responses as quickly as possible.",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Your data is encrypted and secure, with enterprise-grade privacy protection.",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-indigo-100 hover:border-indigo-200 transition-colors hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How AutoLLM Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our intelligent routing system analyzes your request and selects the optimal AI model in milliseconds.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Analyze Your Task",
                description:
                  "Our AI analyzes your prompt to understand the task type: coding, writing, analysis, or creative work.",
              },
              {
                step: "02",
                title: "Route to Best Model",
                description:
                  "Automatically selects the optimal model (GPT-4, Claude, Gemini) based on task requirements and model strengths.",
              },
              {
                step: "03",
                title: "Deliver Smart Response",
                description:
                  "Returns the highest quality response by leveraging each model's unique capabilities and expertise.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-indigo-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section removed */}

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Join the AutoLLM Waitlist</h2>
            <p className="text-lg text-gray-600 mb-8">
              Be among the first to experience intelligent AI model routing. Get early access and help shape the future
              of AI assistance.
            </p>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AutoLLM</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AutoLLM. All rights reserved. Intelligent AI routing for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
