import React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";

const industries = [
  {
    title: "Households",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Offices",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Retail Shops",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1000&q=80",
  },
  {
    title: "Industries",
    image:
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1000&q=80",
  },
];

const IndustriesSection: React.FC = () => {
  return (
    <section className="home-section reveal-on-scroll">
      <Container>
        <div className="home-section-header">
          <h2>Industries We Serve</h2>
          <p>Flexible scrap pickup plans tailored for different operational needs.</p>
        </div>

        <Row className="g-4">
          {industries.map((industry) => (
            <Col key={industry.title} xs={12} sm={6} lg={3}>
              <Card className="industry-card h-100">
                <div className="industry-image-wrap">
                  <Card.Img src={industry.image} alt={industry.title} className="industry-image" loading="lazy" />
                </div>
                <Card.Body>
                  <h3>{industry.title}</h3>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default IndustriesSection;
