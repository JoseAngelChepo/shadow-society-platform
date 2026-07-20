import { landingContent } from "@/content/landing"
import LandingButton from "../LandingButton"
import LandingContainer from "../LandingContainer"
import LandingSection from "../LandingSection"

export default function HeroSection() {
  const { hero } = landingContent

  return (
    <LandingSection variant="hero" aria-labelledby="landing-hero-title">
      <div className="bg" aria-hidden="true" />
      <LandingContainer>
        <div className="inner">
          <div className="badge">
            <span className="badge-dot" aria-hidden="true" />
            <span>{hero.eyebrow}</span>
          </div>

          <h1 id="landing-hero-title" className="title">
            {hero.title}
          </h1>

          <p className="lede">{hero.lede}</p>

          <div className="actions">
            <LandingButton href={hero.primaryCta.href} variant="primary" size="lg">
              {hero.primaryCta.label}
            </LandingButton>
            <LandingButton href={hero.secondaryCta.href} variant="secondary" size="lg">
              {hero.secondaryCta.label}
            </LandingButton>
          </div>
        </div>
      </LandingContainer>
      <style jsx>{`
        .bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(10, 10, 10, 0.04), transparent 70%),
            linear-gradient(to right, rgba(10, 10, 10, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 10, 10, 0.04) 1px, transparent 1px);
          background-size: auto, 56px 56px, 56px 56px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
        }
        .inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1.5rem;
          padding: 0.375rem 0.75rem 0.375rem 0.625rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--app-text);
          background: var(--app-surface);
          border: 1px solid var(--app-border);
          border-radius: 999px;
          box-shadow: var(--app-shadow-sm);
        }
        .badge-dot {
          width: 0.4375rem;
          height: 0.4375rem;
          border-radius: 50%;
          background: var(--app-success);
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.18);
        }
        .title {
          margin: 0 0 1.25rem;
          max-width: 22ch;
          font-size: 2.75rem;
          font-weight: 600;
          letter-spacing: -0.035em;
          line-height: 1.02;
          color: var(--app-text);
          text-wrap: balance;
        }
        .lede {
          margin: 0 0 2rem;
          max-width: 36rem;
          font-size: 1.0625rem;
          line-height: 1.55;
          color: var(--app-text-muted);
          text-wrap: pretty;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.625rem;
        }
        @media (min-width: 1024px) {
          .title {
            font-size: 4.5rem;
            max-width: 18ch;
          }
          .lede {
            font-size: 1.125rem;
          }
        }
        @media (min-width: 1280px) {
          .title {
            font-size: 5rem;
          }
        }
      `}</style>
    </LandingSection>
  )
}
