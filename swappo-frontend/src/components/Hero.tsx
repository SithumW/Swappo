import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-swappo.jpg";
import "@/styles/components/Hero.css";

interface HeroProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export const Hero = ({ onGetStarted, onLearnMore }: HeroProps) => {
  return (
    <section className="hero">
      {/* Background Video */}
      <video
        className="hero-video"
        autoPlay
        muted
        playsInline
      >
        <source src="/icons/1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Buttons Overlay */}
      <div className="hero-buttons-overlay">
        <button onClick={onGetStarted} className="hero-btn-primary">
          Get Started Free
          <ArrowRight className="hero-btn-icon" />
        </button>
        <button onClick={onLearnMore} className="hero-btn-secondary">
          Learn More
        </button>
      </div>
    </section>
  );
};
