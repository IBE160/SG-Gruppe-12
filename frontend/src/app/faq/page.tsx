// frontend/src/app/faq/page.tsx
"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs: FAQItem[] = [
    {
      category: "Getting Started",
      question: "How do I create an account?",
      answer: "Click on the 'Get Started Free' button on the homepage. Enter your email, create a password, and verify your email address. You can start using the free tier immediately without a credit card."
    },
    {
      category: "Getting Started",
      question: "What file formats do you support?",
      answer: "We currently support PDF and TXT formats for CV uploads. We recommend using PDF to preserve formatting. Files should be under 5MB in size."
    },
    {
      category: "Getting Started",
      question: "Do I need to provide a credit card for the free tier?",
      answer: "No! The free tier requires no credit card. You can create one tailored application per week completely free. Upgrade to Premium anytime for unlimited applications."
    },
    {
      category: "Using the Platform",
      question: "How does the AI analyze job postings?",
      answer: "Our AI uses natural language processing to extract key requirements, skills, and qualifications from job postings. It identifies must-have vs nice-to-have requirements and matches them against your CV to create a tailored application."
    },
    {
      category: "Using the Platform",
      question: "What is an ATS score?",
      answer: "ATS (Applicant Tracking System) score indicates how well your CV will perform in automated screening systems used by employers. A score of 80% or higher means your CV has a strong chance of passing initial automated screening."
    },
    {
      category: "Using the Platform",
      question: "Can I edit the generated CV and cover letter?",
      answer: "Yes! After generation, you can review and customize the content before downloading. We provide suggestions, but you have full control over the final output."
    },
    {
      category: "Using the Platform",
      question: "How long does it take to generate an application?",
      answer: "Most applications are generated in 5-15 seconds. Complex job postings with many requirements may take up to 30 seconds."
    },
    {
      category: "Privacy & Security",
      question: "Is my CV data secure?",
      answer: "Yes! We use bank-level encryption (TLS) for all data transmission. Your CVs are stored securely and automatically deleted after 7 days in compliance with GDPR regulations."
    },
    {
      category: "Privacy & Security",
      question: "Do you sell my data?",
      answer: "Never. We do not sell, rent, or share your personal data with third parties. Your information is used solely to provide our services to you."
    },
    {
      category: "Privacy & Security",
      question: "Can I delete my account and data?",
      answer: "Absolutely. You can delete your account and all associated data at any time from your account settings. All data is permanently removed within 48 hours."
    },
    {
      category: "Subscription & Billing",
      question: "What's included in the free tier?",
      answer: "The free tier includes 1 tailored application per week, basic ATS optimization, and gap analysis. Perfect for trying out the platform or casual job searching."
    },
    {
      category: "Subscription & Billing",
      question: "What are the benefits of Premium?",
      answer: "Premium (129 NOK/month) includes unlimited applications, advanced ATS optimization, application tracking, priority support, and early access to new features."
    },
    {
      category: "Subscription & Billing",
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your Premium subscription at any time. You'll continue to have Premium access until the end of your billing period, then automatically revert to the free tier."
    },
    {
      category: "Subscription & Billing",
      question: "Do you offer refunds?",
      answer: "We offer a 7-day money-back guarantee for Premium subscriptions. If you're not satisfied, contact support within 7 days for a full refund."
    },
    {
      category: "Technical",
      question: "Why isn't my CV parsing correctly?",
      answer: "Ensure your CV uses standard section headings (Education, Experience, Skills) and is in PDF format. Avoid using tables, text boxes, or images for important information. See our Upload Guide for best practices."
    },
    {
      category: "Technical",
      question: "The application is slow. What should I do?",
      answer: "Try refreshing the page or clearing your browser cache. If issues persist, contact support with details about your browser and operating system."
    },
    {
      category: "Technical",
      question: "Which browsers do you support?",
      answer: "We support the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox."
    }
  ];

  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Find quick answers to common questions
            </p>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category}</h2>
                <div className="space-y-4">
                  {faqs
                    .filter(faq => faq.category === category)
                    .map((faq, index) => {
                      const globalIndex = faqs.indexOf(faq);
                      const isOpen = openItems.includes(globalIndex);

                      return (
                        <Card key={globalIndex} className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                            aria-expanded={isOpen}
                          >
                            <h3 className="font-semibold text-lg text-gray-900 pr-4">
                              {faq.question}
                            </h3>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="px-6 pb-5 pt-2 border-t border-gray-100 bg-gray-50/50">
                              <p className="text-gray-700 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-8">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/help"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Visit Help Center
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
