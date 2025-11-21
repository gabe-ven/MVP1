"use client";

import LayoutEffect from "@/components/LayoutEffect";

const faqsList = [
  {
    q: "How does AI extraction work?",
    a: "Our AI uses OpenAI's GPT-4 to intelligently read and extract structured data from your rate confirmation PDFs, including load details, rates, broker info, and more.",
  },
  {
    q: "Is my Gmail data secure?",
    a: "Yes! We use OAuth 2.0 for secure, read-only access to your Gmail. We never store your password and only access emails with PDF attachments.",
  },
  {
    q: "How accurate is the mileage calculation?",
    a: "We use Google Maps Directions API to calculate exact driving distances between pickup and delivery locations, ensuring accurate RPM metrics.",
  },
  {
    q: "Can I upload PDFs manually?",
    a: "While our Gmail integration automates the process, you can also manually upload rate confirmation PDFs through the dashboard if needed.",
  },
  {
    q: "What PDF formats are supported?",
    a: "We support all standard PDF formats. Our AI is trained to extract data from various rate confirmation layouts and broker formats.",
  },
  {
    q: "How does the broker outreach feature work?",
    a: "We analyze your load history to identify your most profitable brokers and generate personalized email drafts to help you secure more loads.",
  },
];

const FAQs = () => (
  <section id="faq" className="custom-screen py-20">
    <div className="max-w-xl text-center xl:mx-auto">
      <h2 className="text-gray-900 text-3xl font-extrabold sm:text-4xl">Everything you need to know</h2>
      <p className="mt-3 text-gray-600">Here are the most common questions about Noctem.</p>
    </div>
    <div className="mt-12">
      <LayoutEffect
        className="duration-1000 delay-300"
        isInviewState={{
          trueState: "opacity-1",
          falseState: "opacity-0 translate-y-12",
        }}
      >
        <ul className="space-y-8 gap-12 grid-cols-2 sm:grid sm:space-y-0 lg:grid-cols-3">
          {faqsList.map((item, idx) => (
            <li key={idx} className="space-y-3 glass-card p-6 rounded-xl">
              <summary className="flex items-center justify-between font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">{item.q}</summary>
              <p className="leading-relaxed text-gray-600 mt-2">{item.a}</p>
            </li>
          ))}
        </ul>
      </LayoutEffect>
    </div>
  </section>
);

export default FAQs;

