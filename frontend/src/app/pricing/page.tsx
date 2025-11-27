// frontend/src/app/pricing/page.tsx
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, X } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for trying out the platform",
      features: [
        { text: "1 tailored application per week", included: true },
        { text: "Basic ATS optimization", included: true },
        { text: "Gap analysis", included: true },
        { text: "PDF download", included: true },
        { text: "Email support", included: true },
        { text: "Unlimited applications", included: false },
        { text: "Advanced ATS optimization", included: false },
        { text: "Application tracking", included: false },
        { text: "Priority support", included: false },
        { text: "Early access to new features", included: false }
      ],
      cta: "Get Started Free",
      ctaLink: "/signup",
      popular: false
    },
    {
      name: "Premium",
      price: "129",
      period: "per month",
      description: "For serious job seekers",
      features: [
        { text: "Unlimited tailored applications", included: true },
        { text: "Advanced ATS optimization", included: true },
        { text: "Comprehensive gap analysis", included: true },
        { text: "Multiple export formats", included: true },
        { text: "Application tracking dashboard", included: true },
        { text: "Priority email support", included: true },
        { text: "Early access to new features", included: true },
        { text: "Custom templates", included: true },
        { text: "Interview preparation tips", included: true },
        { text: "7-day money-back guarantee", included: true }
      ],
      cta: "Start Premium",
      ctaLink: "/signup",
      popular: true
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you need more
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative border-2 shadow-lg ${
                    plan.popular
                      ? 'border-primary shadow-primary/20'
                      : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price === "0" ? "Free" : `${plan.price} NOK`}
                      </span>
                      {plan.price !== "0" && (
                        <span className="text-gray-600 ml-2">/ month</span>
                      )}
                    </div>
                    <CardDescription className="text-gray-600">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-3 ${
                            !feature.included ? 'text-gray-400' : 'text-gray-700'
                          }`}
                        >
                          {feature.included ? (
                            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-sm">{feature.text}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={plan.ctaLink}
                      className={`block w-full text-center px-6 py-3 rounded-md font-medium transition-colors ${
                        plan.popular
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {plan.cta}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I switch plans at any time?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade to Premium at any time. If you decide to downgrade,
                  you'll continue to have Premium access until the end of your billing period.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, Mastercard, American Express)
                  and various local payment methods through our secure payment processor, Stripe.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Is there a refund policy?
                </h3>
                <p className="text-gray-600">
                  Yes! We offer a 7-day money-back guarantee for Premium subscriptions.
                  If you're not satisfied, contact support within 7 days for a full refund.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do I need a credit card for the free tier?
                </h3>
                <p className="text-gray-600">
                  No! The free tier requires no credit card. You can start creating
                  tailored applications immediately after signing up.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens to my data if I cancel?
                </h3>
                <p className="text-gray-600">
                  Your account and data remain accessible even after cancellation.
                  You can delete your account and all data at any time from your settings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 mb-8">
              Our support team is here to help you choose the right plan.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
