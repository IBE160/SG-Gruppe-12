// frontend/src/app/how-it-works/page.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSearch, Sparkles, Download, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      icon: Upload,
      title: "Upload Your CV",
      description: "Upload your existing CV in PDF or TXT format. Our AI will parse and extract your skills, experience, education, and qualifications.",
      details: [
        "Supports PDF and TXT formats",
        "Automatic skills extraction",
        "Experience timeline analysis",
        "Education and certification detection",
        "Secure, encrypted upload"
      ],
      color: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      number: 2,
      icon: FileSearch,
      title: "Paste Job Description",
      description: "Copy and paste the job posting you're interested in. Our AI analyzes the requirements, responsibilities, and preferred qualifications.",
      details: [
        "Keyword extraction",
        "Requirement prioritization",
        "Skills matching",
        "Company culture analysis",
        "Industry insights"
      ],
      color: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      number: 3,
      icon: Sparkles,
      title: "AI Analysis & Generation",
      description: "Our advanced AI matches your profile to the job requirements and generates a tailored CV and cover letter optimized for ATS systems.",
      details: [
        "5-15 second generation time",
        "ATS optimization (80%+ score)",
        "Keyword optimization",
        "Gap analysis",
        "Personalized recommendations"
      ],
      color: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      number: 4,
      icon: Download,
      title: "Review & Download",
      description: "Review your tailored application, make any edits you'd like, and download in your preferred format. Apply with confidence!",
      details: [
        "Full editing capabilities",
        "PDF and DOCX export",
        "ATS-friendly formatting",
        "Instant download",
        "Save for future use"
      ],
      color: "bg-orange-100",
      iconColor: "text-orange-600"
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
              How It Works
            </h1>
            <p className="text-xl text-gray-600">
              Create perfect job applications in 4 simple steps
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Icon Section */}
                      <div className="flex-shrink-0">
                        <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center`}>
                          <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-bold text-primary">
                            STEP {step.number}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {step.description}
                        </p>
                        <ul className="space-y-2">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-6">
                    <div className="w-0.5 h-8 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Why It Works Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Our Approach Works
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">5-15s</div>
                <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
                <p className="text-sm text-gray-600">
                  Generate complete applications in seconds, not hours
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">80%+</div>
                <h3 className="font-semibold text-lg mb-2">ATS Score</h3>
                <p className="text-sm text-gray-600">
                  Optimized to pass automated screening systems
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <h3 className="font-semibold text-lg mb-2">Customizable</h3>
                <p className="text-sm text-gray-600">
                  Full control to edit and refine before downloading
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Powered by Advanced AI
            </h2>
            <p className="text-gray-600 text-center mb-8 leading-relaxed">
              Our platform uses cutting-edge natural language processing from OpenAI GPT-5 and
              Anthropic Claude 3.5 to understand job requirements and match them against your
              experience. The result? Tailored applications that highlight your most relevant
              skills and achievements.
            </p>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                What Makes Our AI Different?
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Context-aware analysis that understands industry-specific terminology</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Smart keyword placement that feels natural, not forced</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Achievement highlighting that quantifies your impact</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Tone matching that aligns with company culture</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-8">
              Create your first tailored application in less than a minute.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Get Started Free
              </a>
              <a
                href="/features"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Explore Features
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
