import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
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
      <Container>
        <div className="home-section-header">
          <h2>What We Recycle</h2>
          <p>We process multiple scrap streams with responsible segregation and handling.</p>
        </div>

        <Row className="g-4">
          {recycleItems.map((item) => {
            const Icon = item.icon;
            return (
              <Col key={item.title} xs={12} sm={6} lg={4}>
                <Card className="home-card recycle-card h-100">
                  <Card.Body>
                    <div className="home-icon-chip">
                      <Icon size={20} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default WhatWeRecycleSection;
