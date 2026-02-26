import React, { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import HowItWorksSection from "../components/home/HowItWorksSection";
import ImpactStatsSection from "../components/home/ImpactStatsSection";
import IndustriesSection from "../components/home/IndustriesSection";
import ScrapPriceCardsSection from "../components/home/ScrapPriceCardsSection";
import WhatWeRecycleSection from "../components/home/WhatWeRecycleSection";
import "../styles/HomePage.css";

const Home: React.FC = () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll(".reveal-on-scroll"));
    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 home-hero-content">
          <p className="home-hero-badge hero-fade hero-fade-1">EcoScrap Platform</p>
          <h1 className="hero-fade hero-fade-2">Turn Scrap Into Value</h1>
          <p className="home-hero-subtitle hero-fade hero-fade-3">
            Build cleaner neighborhoods with intelligent doorstep pickup,
            responsible recycling, and transparent rewards.
          </p>
          <div className="home-hero-actions hero-fade hero-fade-4">
            <Link
              to={isLoggedIn ? "/dashboard" : "/login"}
              className="hero-btn hero-btn-primary"
            >
              Schedule Pickup <ArrowRight size={18} />
            </Link>
            <a href="#what-we-recycle" className="hero-btn hero-btn-secondary">
              Check Scrap Price
            </a>
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <WhatWeRecycleSection />
      <ScrapPriceCardsSection />
      <IndustriesSection />
      <ImpactStatsSection />
    </div>
  );
};

export default Home;
