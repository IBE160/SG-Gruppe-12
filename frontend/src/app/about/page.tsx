// frontend/src/app/about/page.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Zap, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              About AI CV Assistant
            </h1>
            <p className="text-xl text-gray-600">
              Empowering job seekers with AI-driven application tools
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that every job seeker deserves a fair chance to showcase their skills and experience.
                Our mission is to level the playing field by providing AI-powered tools that help you create
                professional, ATS-optimized applications that stand out to employers.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    Precision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our AI analyzes job postings with precision, matching your skills and experience
                    to create perfectly tailored applications.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    Speed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Generate professional CVs and cover letters in seconds, not hours.
                    Apply to more jobs faster without sacrificing quality.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Your data is protected with bank-level encryption. We never sell your information
                    and automatically delete files after 7 days.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    User-Focused
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Every feature is designed with you in mind. From our intuitive interface
                    to our responsive support team, we're here to help you succeed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                AI CV Assistant was born from a simple observation: job hunting is harder than it should be.
                We watched talented professionals struggle to get past ATS systems, spend hours customizing
                applications, and miss opportunities because they couldn't keep up with the pace of modern hiring.
              </p>
              <p>
                We knew there had to be a better way. By combining cutting-edge AI technology with deep
                understanding of recruitment processes, we created a tool that does the heavy lifting for you.
                Our platform analyzes job postings, optimizes your CV for ATS systems, and generates personalized
                cover letters—all in seconds.
              </p>
              <p>
                Today, we're proud to help thousands of job seekers land their dream jobs. Whether you're a
                recent graduate or an experienced professional, we're here to make your job search faster,
                easier, and more successful.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of job seekers who have found success with AI CV Assistant.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
