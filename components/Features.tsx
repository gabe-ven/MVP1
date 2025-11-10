"use client";

import LayoutEffect from "@/components/LayoutEffect";
import { TrendingUp, FileText, Mail, BarChart3, Target, Zap } from "lucide-react";

const Features = () => {
  const featuresList = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "AI-Powered Data Extraction",
      desc: "Our AI automatically extracts structured data from rate confirmation PDFs with high accuracy and speed.",
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Smart Document Processing",
      desc: "Process multiple PDFs at once and automatically organize load details, rates, and broker information.",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Gmail Integration",
      desc: "Connect your Gmail to import rate confirmations with a single click. Manual sync gives you full control.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-Time Analytics",
      desc: "Track your revenue, RPM trends, and broker performance with beautiful, interactive dashboards.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Broker Intelligence",
      desc: "Identify your top brokers and generate personalized outreach emails to grow your business.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Automated Mileage Calculation",
      desc: "Google Maps integration automatically calculates accurate driving distances for every load.",
    },
  ];

  return (
    <section id="features" className="custom-screen text-gray-300 py-20">
      <LayoutEffect
        className="duration-1000 delay-300"
        isInviewState={{
          trueState: "opacity-1",
          falseState: "opacity-0 translate-y-6",
        }}
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-white text-3xl font-semibold sm:text-4xl">
            Everything You Need to Manage Your Loads
          </h2>
          <p className="mt-3 text-gray-300">
            Load Insights provides powerful tools to help you analyze your freight business and make data-driven decisions.
          </p>
        </div>
      </LayoutEffect>
      <LayoutEffect
        className="duration-1000 delay-500"
        isInviewState={{
          trueState: "opacity-1",
          falseState: "opacity-0",
        }}
      >
        <div className="relative mt-12">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuresList.map((item, idx) => (
              <li key={idx} className="group relative">
                <div className="relative space-y-3 p-6 rounded-xl border border-gray-800/30 bg-black/40 backdrop-blur-sm hover:border-gray-700/50 transition-all">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg text-white shadow-lg">
                    {item.icon}
                  </div>
                  <h3 className="text-lg text-white font-semibold">{item.title}</h3>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </LayoutEffect>
    </section>
  );
};

export default Features;

