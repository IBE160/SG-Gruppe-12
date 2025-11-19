import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Upload, Target, Download } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Target className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">AI CV Assistant</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link href="/signup">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <span className="px-3 py-1 text-sm font-medium text-primary">
              Trusted by 10,000+ job seekers
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Stop Guessing What<br />Employers Want
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get AI-tailored CVs and cover letters in minutes that speak the employer's language
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Get Started Free
              </Button>
            </Link>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
              ))}
            </div>
            <div className="flex items-center gap-1 text-warning">
              {'★'.repeat(5)}
            </div>
            <span className="text-gray-600">4.8/5 from 2,500+ reviews</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to your perfect application</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload CV</h3>
              <p className="text-gray-600">
                Upload your CV once. Our AI parses and understands your experience.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Paste Job Ad</h3>
              <p className="text-gray-600">
                AI analyzes the job requirements and matches them to your skills.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Download Tailored Docs</h3>
              <p className="text-gray-600">
                Get a customized CV and cover letter optimized for ATS systems.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
              <div className="space-y-4">
                {[
                  "AI-Powered Job Analysis",
                  "ATS Optimization",
                  "Keyword Matching",
                  "Gap Analysis",
                  "Instant Cover Letters",
                  "Multiple CV Versions"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
              <blockquote className="space-y-4">
                <div className="flex text-warning text-2xl">
                  {'★'.repeat(5)}
                </div>
                <p className="text-lg text-gray-800 italic">
                  "I got 3 interviews in the first week! This tool saved me hours per application."
                </p>
                <footer className="text-gray-600">
                  — Emma, Recent Graduate, Oslo
                </footer>
              </blockquote>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">0 NOK</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>1 tailored application/week</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Basic ATS optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Gap analysis</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" fullWidth>Get Started</Button>
              </Link>
            </Card>

            <Card className="p-8 text-center border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">129 NOK</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="font-medium">Unlimited applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Advanced ATS optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Application tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/signup">
                <Button fullWidth>Upgrade to Premium</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6" />
                <span className="font-bold">AI CV Assistant</span>
              </div>
              <p className="text-gray-400 text-sm">
                Helping job seekers create perfect applications with AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/how-it-works">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/guides">Guides</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 AI CV Assistant. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
