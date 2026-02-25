import React, { useMemo, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";

type ScrapCategory = {
  name: string;
  pricePerKg: number;
};

const SCRAP_CATEGORIES: ScrapCategory[] = [
  { name: "Newspaper", pricePerKg: 12 },
  { name: "Plastic", pricePerKg: 18 },
  { name: "Metal", pricePerKg: 30 },
  { name: "E-Waste", pricePerKg: 25 },
  { name: "Organic Waste", pricePerKg: 6 },
  { name: "Batteries", pricePerKg: 40 },
];

const ScrapPriceCardsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ScrapCategory | null>(null);

  const helperText = useMemo(() => {
    if (!selectedCategory) {
      return "Select any category to view the latest price per kg.";
    }
    return `${selectedCategory.name}: Rs.${selectedCategory.pricePerKg}/kg`;
  }, [selectedCategory]);

  return (
    <section className="home-section home-scrap-price-section reveal-on-scroll" id="scrap-price-cards">
      <Container>
        <div className="home-section-header">
          <h2>Scrap Categories & Prices</h2>
          <p>Choose a category to quickly check price per kilogram before booking pickup.</p>
        </div>

        <Row className="g-4">
          {SCRAP_CATEGORIES.map((category) => {
            const isSelected = selectedCategory?.name === category.name;
            return (
              <Col key={category.name} md={6} lg={4}>
                <Card
                  className={`scrap-price-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedCategory(category)}
                  role="button"
                  aria-label={`View price for ${category.name}`}
                >
                  <Card.Body>
                    <h3>{category.name}</h3>
                    <p className="scrap-price-card-subtitle">Tap to view price</p>
                    {isSelected && <p className="scrap-price-chip">Rs.{category.pricePerKg}/kg</p>}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        <div className="scrap-price-info-box" aria-live="polite">
          {helperText}
        </div>
      </Container>
    </section>
  );
};

export default ScrapPriceCardsSection;
