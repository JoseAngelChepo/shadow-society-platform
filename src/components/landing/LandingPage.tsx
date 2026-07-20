"use client"

import LandingHeader from "@/components/landing/LandingHeader"
import FaqSection from "@/components/landing/sections/FaqSection"
import FeaturesSection from "@/components/landing/sections/FeaturesSection"
import FinalCtaSection from "@/components/landing/sections/FinalCtaSection"
import HeroSection from "@/components/landing/sections/HeroSection"
import HowItWorksSection from "@/components/landing/sections/HowItWorksSection"
import LandingFooter from "@/components/landing/sections/LandingFooter"
import ProblemSection from "@/components/landing/sections/ProblemSection"
import SocialProofSection from "@/components/landing/sections/SocialProofSection"
import SolutionSection from "@/components/landing/sections/SolutionSection"

export default function LandingPage() {
  return (
    <div className="page">
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SocialProofSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: var(--app-bg);
        }
      `}</style>
    </div>
  )
}
