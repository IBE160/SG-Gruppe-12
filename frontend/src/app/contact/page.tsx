// frontend/src/app/contact/page.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600">
              We're here to help. Get in touch with our team.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    Email Support
                  </CardTitle>
                  <CardDescription>
                    Get help via email within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a href="mailto:support@aicvassistant.com" className="text-primary hover:underline">
                    support@aicvassistant.com
                  </a>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    Live Chat
                  </CardTitle>
                  <CardDescription>
                    Chat with us in real-time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Available Monday-Friday, 9am-5pm CET</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    Phone
                  </CardTitle>
                  <CardDescription>
                    Speak with our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">+47 123 45 678</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    Office
                  </CardTitle>
                  <CardDescription>
                    Visit us in person
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Oslo, Norway<br />
                    By appointment only
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="bg-blue-50 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Looking for something specific?
              </h2>
              <p className="text-gray-600 mb-6">
                Check out our help resources before reaching out
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/help"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Help Center
                </a>
                <a
                  href="/faq"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  FAQ
                </a>
                <a
                  href="/guides"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Guides
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
