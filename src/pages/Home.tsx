import React, { useEffect } from "react";
import { ArrowRight, Leaf, Recycle, Truck } from "lucide-react";
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
          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-hero-badge hero-fade hero-fade-1">EcoScrap Platform</p>
              <h1 className="hero-fade hero-fade-2">Sell Your Scrap Easily &amp; Get Doorstep Pickup</h1>
              <p className="home-hero-subtitle hero-fade hero-fade-3">
                Join a cleaner circular economy with fast doorstep collection, verified recycling,
                and transparent payouts for every pickup.
              </p>
              <div className="home-hero-actions hero-fade hero-fade-4">
                <Link to={isLoggedIn ? "/dashboard" : "/login"} className="hero-btn hero-btn-primary">
                  Schedule Pickup <ArrowRight size={18} />
                </Link>
                <a href="#services" className="hero-btn hero-btn-secondary">
                  Explore Services
                </a>
              </div>
            </div>

            <div className="home-hero-visual hero-fade hero-fade-4" aria-hidden="true">
              <div className="hero-illustration-card">
                <div className="hero-illustration-icon hero-icon-one"><Truck size={18} /></div>
                <div className="hero-illustration-icon hero-icon-two"><Recycle size={18} /></div>
                <div className="hero-illustration-icon hero-icon-three"><Leaf size={18} /></div>
                <div className="hero-illustration-rings" />
                <p className="hero-illustration-label">Doorstep Pickup</p>
                <h3 className="hero-illustration-title">Eco Collection in 24 Hours</h3>
                <p className="hero-illustration-text">Paper, plastic, metal and e-waste picked up safely from your location.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="services" className="home-section-anchor" />
      <HowItWorksSection />
      <WhatWeRecycleSection />
      <ScrapPriceCardsSection />
      <IndustriesSection />
      <ImpactStatsSection />
    </div>
  );
};

export default Home;
