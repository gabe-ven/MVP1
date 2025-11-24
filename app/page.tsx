"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import GmailAuthButton from "@/components/GmailAuthButton";
import Features from "@/components/Features";
import FAQs from "@/components/FAQs";
import AnimatedTrucks from "@/components/AnimatedTrucks";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to Dashboard
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Subtle gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl" />
        </div>

        <div className="custom-screen py-28 relative z-10">
          <div className="space-y-6 max-w-3xl mx-auto text-center">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 leading-tight">
              Analyze Your Freight Business
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                In Seconds
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-600 text-lg leading-relaxed">
              Connect your Gmail to get AI-powered insights from your rate confirmations: revenue analytics, RPM trends, broker performance, and detailed load tracking.
            </p>
          </div>
          
          {/* CTA Section */}
          <div className="mt-12">
            {session ? (
              <div className="flex justify-center">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 active:scale-95 transition-all font-semibold shadow-xl hover:shadow-2xl"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <GmailAuthButton />
            )}
          </div>
          
          {/* Hero Image with Glass Morphic Card */}
          <div className="relative mt-20">
            <div className="relative max-w-6xl mx-auto">
              <div className="glass-card rounded-3xl overflow-hidden p-2 shadow-2xl">
                <img
                  src="/preview.png"
                  className="rounded-2xl w-full"
                  alt="Load Insights Dashboard Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* FAQs Section */}
      <div id="faq">
        <FAQs />
      </div>
    </main>
  );
}
