import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: "AutoLLM <noreply@yourdomain.com>", // Replace with your verified domain
      to: [email],
      subject: "Welcome to AutoLLM - The Smartest AI Assistant! 🤖",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to AutoLLM</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 15px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="font-size: 24px;">🤖</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to AutoLLM!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">The Smartest AI Assistant</p>
            </div>
            
            <div style="padding: 0 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for joining the AutoLLM waitlist! You're now part of an exclusive group that will experience the future of AI assistance.
              </p>
              
              <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #6366f1;">
                <h3 style="color: #6366f1; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">🧠 What makes AutoLLM special?</h3>
                <p style="margin: 0; font-size: 16px; color: #4b5563;">
                  AutoLLM automatically chooses the best AI model (GPT-4, Claude, Gemini) for your specific task, ensuring you always get the smartest possible response.
                </p>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Here's what you can expect as an early member:
              </p>
              
              <ul style="font-size: 16px; margin-bottom: 30px; padding-left: 20px;">
                <li style="margin-bottom: 12px;">🚀 <strong>First Access:</strong> Be among the first to try intelligent model routing</li>
                <li style="margin-bottom: 12px;">📊 <strong>Behind-the-Scenes:</strong> Exclusive updates on our AI routing technology</li>
                <li style="margin-bottom: 12px;">💡 <strong>Shape the Product:</strong> Your feedback will help us build the perfect AI assistant</li>
                <li style="margin-bottom: 12px;">🎯 <strong>Special Pricing:</strong> Exclusive early-bird discounts when we launch</li>
              </ul>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
                <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">💭 How AutoLLM Works:</h4>
                <ol style="margin: 0; padding-left: 20px; color: #6b7280;">
                  <li style="margin-bottom: 8px;">You submit your task or question</li>
                  <li style="margin-bottom: 8px;">Our AI analyzes the request type (coding, writing, analysis, etc.)</li>
                  <li style="margin-bottom: 8px;">We automatically route to the best model for that specific task</li>
                  <li>You get the smartest possible response, every time</li>
                </ol>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 30px;">
                We're working hard to revolutionize how you interact with AI. Stay tuned for updates, and feel free to reply with any questions or ideas!
              </p>
              
              <p style="font-size: 16px; margin-bottom: 10px;">
                Thanks for believing in the future of intelligent AI,<br>
                <strong>The AutoLLM Team</strong>
              </p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
              <p>You're receiving this email because you joined the AutoLLM waitlist.</p>
              <p>AutoLLM • Intelligent AI Model Routing • The Smartest AI Assistant</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      throw new Error("Failed to send AutoLLM welcome email")
    }

    console.log("AutoLLM welcome email sent successfully:", data)
  } catch (error) {
    console.error("Error sending AutoLLM welcome email:", error)
    throw new Error("Failed to send AutoLLM welcome email")
  }
}
