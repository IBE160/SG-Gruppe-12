// frontend/src/app/help/page.tsx
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, MessageCircle, BookOpen, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpCenterPage() {
  const helpTopics = [
    {
      icon: Upload,
      title: "Uploading Your CV",
      description: "Learn how to upload and format your CV for best results",
      link: "/guides#upload-cv"
    },
    {
      icon: FileText,
      title: "Creating Applications",
      description: "Step-by-step guide to generating tailored applications",
      link: "/guides#create-application"
    },
    {
      icon: BookOpen,
      title: "Understanding ATS",
      description: "What is ATS optimization and why it matters",
      link: "/guides#ats-optimization"
    },
    {
      icon: MessageCircle,
      title: "Account Management",
      description: "Managing your profile, settings, and subscription",
      link: "/guides#account"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600">
              Search our knowledge base or browse categories below
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for help articles..."
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Popular Topics
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {helpTopics.map((topic) => (
                <Link href={topic.link} key={topic.title}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <topic.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{topic.title}</CardTitle>
                          <CardDescription>{topic.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Quick Links
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/guides">
                <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Guides</h3>
                  <p className="text-sm text-gray-600">
                    Detailed tutorials and best practices
                  </p>
                </Card>
              </Link>

              <Link href="/faq">
                <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">FAQ</h3>
                  <p className="text-sm text-gray-600">
                    Frequently asked questions
                  </p>
                </Card>
              </Link>

              <Link href="/contact">
                <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Contact Us</h3>
                  <p className="text-sm text-gray-600">
                    Get in touch with support
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still need help?
              </h2>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you with any questions or issues.
              </p>
              <Link href="/contact">
                <Button size="lg">Contact Support</Button>
              </Link>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
