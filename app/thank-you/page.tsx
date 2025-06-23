import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Mail, Calendar, Brain } from "lucide-react"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Welcome to AutoLLM!</h1>
          <p className="text-xl text-gray-600 mb-8">
            You're now on our waitlist for the smartest AI assistant. Get ready to experience intelligent model routing.
          </p>
        </div>

        <Card className="border-indigo-100 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 flex items-center justify-center space-x-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              <span>What's Next?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Confirmation Email</h3>
                <p className="text-gray-600">
                  Check your inbox for a welcome email with exclusive insights about AutoLLM's intelligent routing.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-1">Early Access</h3>
                <p className="text-gray-600">
                  You'll be first in line to try AutoLLM when we launch, plus get exclusive updates on our AI routing
                  technology.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Link href="/">
            <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <p className="text-sm text-gray-500">Excited about intelligent AI? Share AutoLLM with your network!</p>
        </div>
      </div>
    </div>
  )
}
