// frontend/src/app/features/page.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  Target,
  FileText,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Sparkles,
  BarChart3,
  Download
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Advanced natural language processing analyzes job postings to extract key requirements, skills, and qualifications in seconds.",
      benefits: [
        "Automatic keyword extraction",
        "Requirement prioritization (must-have vs nice-to-have)",
        "Skills matching against your CV",
        "Industry-specific insights"
      ]
    },
    {
      icon: Target,
      title: "ATS Optimization",
      description: "Ensure your application passes Applicant Tracking Systems with intelligent formatting and keyword optimization.",
      benefits: [
        "80%+ ATS compatibility score",
        "Standard section headings",
        "Keyword density optimization",
        "Clean, parseable formatting"
      ]
    },
    {
      icon: FileText,
      title: "Tailored Cover Letters",
      description: "Generate personalized cover letters that highlight your relevant experience and match job requirements.",
      benefits: [
        "Job-specific customization",
        "Professional tone matching",
        "Achievement highlighting",
        "Company culture alignment"
      ]
    },
    {
      icon: TrendingUp,
      title: "Gap Analysis",
      description: "Identify missing skills and qualifications, with actionable recommendations for improvement.",
      benefits: [
        "Skills gap identification",
        "Learning recommendations",
        "Experience suggestions",
        "Certification guidance"
      ]
    },
    {
      icon: Clock,
      title: "Lightning Fast",
      description: "Generate complete, professional applications in 5-15 seconds. Apply to more jobs in less time.",
      benefits: [
        "5-15 second generation time",
        "Batch processing support",
        "Quick edits and revisions",
        "Instant downloads"
      ]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Bank-level encryption and GDPR compliance ensure your data is always protected.",
      benefits: [
        "TLS encryption",
        "Auto-delete after 7 days",
        "GDPR compliant",
        "No data selling"
      ]
    },
    {
      icon: Sparkles,
      title: "Smart Suggestions",
      description: "Get AI-powered recommendations to improve your CV and strengthen your applications.",
      benefits: [
        "Content improvement tips",
        "Formatting suggestions",
        "Action verb recommendations",
        "Achievement quantification"
      ]
    },
    {
      icon: BarChart3,
      title: "Application Tracking",
      description: "Keep track of all your applications in one place with our built-in dashboard.",
      benefits: [
        "Application history",
        "Status tracking",
        "Success metrics",
        "Follow-up reminders"
      ]
    },
    {
      icon: Download,
      title: "Multiple Formats",
      description: "Download your optimized CVs and cover letters in various professional formats.",
      benefits: [
        "PDF export",
        "DOCX support",
        "Plain text version",
        "ATS-friendly formatting"
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Powerful Features
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to create winning job applications
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of job seekers who have landed their dream jobs with AI CV Assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Get Started Free
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
