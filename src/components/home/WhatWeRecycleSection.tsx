import React from "react";
import { BatteryCharging, Cpu, FileText, Leaf, Recycle, Wrench } from "lucide-react";

const recycleItems = [
  {
    title: "Paper",
    description: "Newspapers, cardboard, books, and office paper waste.",
    icon: FileText,
  },
  {
    title: "Plastic",
    description: "Bottles, containers, packaging films, and household plastics.",
    icon: Recycle,
  },
  {
    title: "Metal",
    description: "Iron, aluminum, steel, and mixed metal scrap materials.",
    icon: Wrench,
  },
  {
    title: "E-waste",
    description: "Old electronics, cables, chargers, and small appliances.",
    icon: Cpu,
  },
  {
    title: "Organic Waste",
    description: "Compostable kitchen and garden waste for eco processing.",
    icon: Leaf,
  },
  {
    title: "Batteries",
    description: "Safe handling of used household and device batteries.",
    icon: BatteryCharging,
  },
];

const WhatWeRecycleSection: React.FC = () => {
  return (
    <section className="home-section home-section-tint reveal-on-scroll" id="what-we-recycle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="home-section-header">
          <h2>What We Recycle</h2>
          <p>We process multiple scrap streams with responsible segregation and handling.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recycleItems.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="home-card recycle-card h-full rounded-xl shadow-md bg-white p-5 hover:shadow-lg transition duration-300">
                <div className="home-icon-chip">
                  <Icon size={20} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatWeRecycleSection;
