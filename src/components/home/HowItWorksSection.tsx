import React from "react";
import { CalendarClock, Gift, ListChecks, Truck } from "lucide-react";

const steps = [
  {
    title: "Select Scrap Type",
    description: "Choose what you want to recycle from our supported scrap categories.",
    icon: ListChecks,
  },
  {
    title: "Schedule Pickup",
    description: "Pick your preferred date and time slot in just a few clicks.",
    icon: CalendarClock,
  },
  {
    title: "We Collect from Doorstep",
    description: "Our pickup partner reaches your location and collects the scrap safely.",
    icon: Truck,
  },
  {
    title: "Get Eco Rewards",
    description: "Receive rewards and track your contribution to a cleaner environment.",
    icon: Gift,
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="home-section reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="home-section-header">
          <h2>How It Works</h2>
          <p>A simple four-step flow designed for fast and reliable scrap pickup.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="home-card how-card h-full rounded-xl shadow-md bg-white p-5 hover:shadow-lg transition duration-300">
                <div className="home-icon-chip">
                  <Icon size={20} />
                </div>
                <p className="home-step-label">Step {index + 1}</p>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
