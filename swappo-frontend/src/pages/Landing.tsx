import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import "@/styles/pages/Landing.css";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export const Landing = () => {
  const navigate = useNavigate();
  const [fadeInClass, setFadeInClass] = useState(false);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  // Scroll fade-in for footer info section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Trigger fade-in when footer comes into view
      if (scrollPosition > 500) { // Adjust as needed
        setFadeInClass(true);
      } else {
        setFadeInClass(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <Header onLoginClick={handleLogin} />
      
      <Hero onGetStarted={handleGetStarted} />

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Start Trading?</h2>
          <p className="cta-text">
            Join thousands of community members already trading, saving money, and reducing waste.
          </p>
          <button onClick={handleGetStarted} className="cta-button">
            Join Swappo Today
            <ArrowRight className="cta-button-icon" />
          </button>
        </div>
      </section>

      {/* Footer with Info Section */}
      <footer className="landing-footer">
        <div className="infocontainer">
          <div className={`info ${fadeInClass ? 'fade-in' : ''}`}>
            <h1>What is Swappo?</h1>
            <hr className="hrwelcm" />
            <p>
              This website is an online platform designed
              for users to exchange items with each other.
              Whether you have an item you no longer need or
              you are looking for something new, Swappo is the
              perfect place to find what you are looking for.
            </p>
          </div>

          <div className={`info ${fadeInClass ? 'fade-in' : ''}`}>
            <h1>How does Swappo Work?</h1>
            <hr className="hrwelcm" />
            <p>
              Swappo simplifies the process of item exchange
              by enabling users to list items they want to trade 
              and browse items they are interested in. The platform
              facilitates direct communication between users, making 
              it easy to negotiate and finalize the exchange.
            </p>
          </div>

          <div className={`info ${fadeInClass ? 'fade-in' : ''}`}>
            <h1>Why choose Swappo?</h1>
            <hr className="hrwelcm" />
            <p>
              Swappo promotes sustainability and community by encouraging
              the reuse and recycling of items. It's a cost-effective way 
              to find new treasures while decluttering your space. With a 
              focus on user experience, Swappo ensures a safe and enjoyable 
              swapping environment for everyone.
            </p>
          </div>
        </div>

        {/* ✅ Social Footer Section */}
        <div className="footer">
          <div className="topBar">
            <div className="bottomlogo">
              <img src="/icons/logohome.png" alt="SWA PPO Logo" className="swappoImage" />
            </div>

            <div className="bottomHead">
              <a  className="footer-legal-links2">About Us</a>
              <a  className="footer-legal-links2">Contact Us</a>
              <a  className="footer-legal-links2">Help Center</a>
              <a  className="footer-legal-links2">Follow On</a>

              <div className="socialicon"> 
                <img src="icons/so/in.png" alt="LinkedIn" />
                <img src="icons/so/fb.png" alt="Facebook" />
                <img src="icons/so/tw.png" alt="Twitter" />
                <img src="icons/so/ins.png" alt="Instagram" />
              </div>
            </div>
          </div>

          <hr className="footer-hr" />

          <div className="bottomBar">
            <div className="bottomContent">
              <div>
                <a className="footer-legal-links">TERMS & CONDITIONS</a>
                <a className="footer-legal-links">PRIVACY POLICY</a>
              </div>
              <div>
                <p>Copyright 2025 © Swappo</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
