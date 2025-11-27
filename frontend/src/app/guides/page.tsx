// frontend/src/app/guides/page.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Upload, FileText, Download, Target, Zap } from "lucide-react";

export default function GuidesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Guides & Tutorials
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to create perfect job applications
            </p>
          </div>
        </section>

        {/* Getting Started Guide */}
        <section id="getting-started" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Getting Started</h2>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get up and running in just 5 minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Create Your Account</h4>
                      <p className="text-gray-600">
                        Sign up with your email and create a secure password. No credit card required for the free tier.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Upload Your CV</h4>
                      <p className="text-gray-600">
                        Upload your existing CV in PDF or TXT format. Our AI will extract your skills, experience, and qualifications.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Paste Job Description</h4>
                      <p className="text-gray-600">
                        Copy and paste the job posting you&apos;re interested in. Our AI analyzes requirements and keywords.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Generate & Download</h4>
                      <p className="text-gray-600">
                        Get your tailored CV and cover letter in seconds. Download in PDF format and apply with confidence.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detailed Guides */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl font-bold text-gray-900">Detailed Guides</h2>

            {/* Upload CV Guide */}
            <Card id="upload-cv">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-primary" />
                  How to Upload Your CV
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Follow these best practices to ensure your CV is parsed correctly:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Use a standard CV format with clear section headings (Education, Experience, Skills)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Save as PDF to preserve formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Include contact information at the top</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Use bullet points for achievements and responsibilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Keep file size under 5MB</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Create Application Guide */}
            <Card id="create-application">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  Creating Tailored Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Get the most out of our AI by following these tips:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span><strong>Copy the entire job posting:</strong> Include job title, requirements, and company description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span><strong>Review the match analysis:</strong> Check which requirements you meet and which need emphasis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span><strong>Customize further:</strong> Add specific examples or adjust tone to match company culture</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span><strong>Check ATS score:</strong> Aim for 80%+ to ensure your application passes automated screening</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* ATS Optimization Guide */}
            <Card id="ats-optimization">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  Understanding ATS Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  ATS (Applicant Tracking Systems) scan and rank applications before they reach human recruiters.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">What is ATS?</h4>
                  <p className="text-sm text-gray-700">
                    ATS software helps companies manage hundreds of applications by automatically scanning CVs for keywords,
                    qualifications, and formatting. About 75% of applications are rejected by ATS before a human ever sees them.
                  </p>
                </div>
                <h4 className="font-semibold">How we optimize your CV:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Extract and match job-specific keywords</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Use standard section headings that ATS recognizes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Remove graphics and complex formatting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Include relevant skills and qualifications from the job posting</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Account Management Guide */}
            <Card id="account">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Download className="w-6 h-6 text-primary" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold">Managing Your Profile</h4>
                <p className="text-gray-600">
                  Update your profile settings, manage your uploaded CVs, and track your application history from your dashboard.
                </p>
                <h4 className="font-semibold mt-4">Subscription & Billing</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Free tier: 1 tailored application per week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Premium: Unlimited applications, advanced features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>Cancel anytime from account settings</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
