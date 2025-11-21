"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import GmailAuthButton from "@/components/GmailAuthButton";
import Features from "@/components/Features";
import FAQs from "@/components/FAQs";
import AnimatedTrucks from "@/components/AnimatedTrucks";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient - smooth */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 via-slate-800/10 to-transparent" />
          
          {/* Sophisticated grid with perspective - Subtle with smooth FADE */}
          <div 
            className="absolute inset-0 h-[100vh] opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(148, 163, 184, 0.6) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148, 163, 184, 0.6) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
              transform: 'perspective(1000px) rotateX(60deg) scale(2)',
              transformOrigin: 'center top',
              maskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.95) 15%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.01) 85%, transparent 90%)',
              WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.95) 15%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.01) 85%, transparent 90%)',
            }}
          />
          
          {/* Dot pattern overlay - Subtle with smooth FADE */}
          <div 
            className="absolute inset-0 h-[100vh] opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(251, 146, 60, 0.5) 1.5px, transparent 1.5px)',
              backgroundSize: '60px 60px',
              maskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.75) 28%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0.2) 64%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.02) 85%, transparent 90%)',
              WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.9) 15%, rgba(0,0,0,0.75) 28%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.35) 52%, rgba(0,0,0,0.2) 64%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.02) 85%, transparent 90%)',
            }}
          />
          
          {/* Diagonal accent lines - Subtle with smooth FADE */}
          <div className="absolute top-0 left-0 w-full h-full opacity-40">
            <div className="absolute top-1/4 -left-1/4 w-3/4 h-0.5 rotate-45 transform origin-left" style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(249, 115, 22, 0.6) 20%, rgba(249, 115, 22, 0.6) 40%, rgba(249, 115, 22, 0.4) 60%, rgba(249, 115, 22, 0.2) 80%, transparent 100%)',
              boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)',
            }} />
            <div className="absolute top-1/3 right-0 w-2/3 h-0.5 -rotate-45 transform origin-right" style={{
              background: 'linear-gradient(to left, transparent 0%, rgba(251, 191, 36, 0.6) 20%, rgba(251, 191, 36, 0.6) 40%, rgba(251, 191, 36, 0.4) 60%, rgba(251, 191, 36, 0.2) 80%, transparent 100%)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
            }} />
            <div className="absolute top-1/2 left-1/4 w-1/2 h-0.5 rotate-45 transform" style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(251, 146, 60, 0.5) 20%, rgba(251, 146, 60, 0.5) 40%, rgba(251, 146, 60, 0.3) 65%, rgba(251, 146, 60, 0.15) 85%, transparent 100%)',
              boxShadow: '0 0 15px rgba(251, 146, 60, 0.2)',
            }} />
          </div>
          
          {/* Animated gradient mesh - Subtle with smooth FADE */}
          <div className="absolute inset-0 h-[100vh]" style={{
            maskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.92) 18%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.24) 67%, rgba(0,0,0,0.1) 78%, rgba(0,0,0,0.03) 87%, transparent 92%)',
            WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.92) 18%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.62) 42%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.24) 67%, rgba(0,0,0,0.1) 78%, rgba(0,0,0,0.03) 87%, transparent 92%)',
          }}>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          </div>
          
          {/* Scan line effect - Subtle with smooth FADE */}
          <div className="absolute inset-0 h-[100vh] opacity-10" style={{
            maskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.88) 18%, rgba(0,0,0,0.7) 32%, rgba(0,0,0,0.5) 46%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15) 73%, rgba(0,0,0,0.05) 84%, rgba(0,0,0,0.01) 92%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 5%, rgba(0,0,0,0.88) 18%, rgba(0,0,0,0.7) 32%, rgba(0,0,0,0.5) 46%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.15) 73%, rgba(0,0,0,0.05) 84%, rgba(0,0,0,0.01) 92%, transparent 95%)',
          }}>
            <div className="h-full w-full animate-[scan_8s_linear_infinite]" style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(251, 146, 60, 0.4) 50%, transparent 100%)',
              backgroundSize: '100% 200px',
            }} />
          </div>
        </div>

        {/* Animated Trucks */}
        <AnimatedTrucks />

        <div className="custom-screen py-28 relative z-10">
          <div className="space-y-5 max-w-3xl mx-auto text-center">
            <h1 
              className="text-4xl bg-clip-text text-transparent bg-gradient-to-r font-extrabold mx-auto sm:text-6xl"
              style={{
                backgroundImage: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #F59E0B 100%)"
              }}
            >
              Analyze Your Freight Business In Seconds
            </h1>
            <p className="max-w-xl mx-auto text-gray-100 text-lg">
              Connect your Gmail to get AI-powered insights from your rate confirmations: revenue analytics, RPM trends, broker performance, and detailed load tracking.
            </p>
          </div>
          
          {/* CTA Section */}
          <div className="mt-12">
            {session ? (
              <div className="flex justify-center">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 active:scale-95 transition-all font-semibold shadow-2xl shadow-orange-500/50 hover:shadow-orange-500/70"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <GmailAuthButton />
            )}
          </div>
          
          {/* Hero Image with Glow Effect */}
          <div className="relative mt-16 sm:mt-20">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent blur-3xl" />
            <div className="relative max-w-6xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden border border-gray-800/50 shadow-2xl shadow-orange-500/30">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-amber-500/10" />
                <img
                  src="/preview.png"
                  className="relative"
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
