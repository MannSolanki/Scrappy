import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
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
      <Container>
        <div className="home-section-header">
          <h2>How It Works</h2>
          <p>A simple four-step flow designed for fast and reliable scrap pickup.</p>
        </div>

        <Row className="g-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Col key={step.title} xs={12} sm={6} lg={3}>
                <Card className="home-card how-card h-100">
                  <Card.Body>
                    <div className="home-icon-chip">
                      <Icon size={20} />
                    </div>
                    <p className="home-step-label">Step {index + 1}</p>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
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

export default HowItWorksSection;
