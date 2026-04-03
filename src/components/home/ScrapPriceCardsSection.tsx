import React, { useMemo, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Newspaper, 
  Trash2, 
  Box, 
  Cpu, 
  Leaf, 
  Battery, 
  Calculator, 
  TrendingUp, 
  IndianRupee,
  ArrowRight
} from "lucide-react";

type ScrapCategory = {
  name: string;
  pricePerKg: number;
  icon: React.ReactNode;
  description: string;
  isPopular?: boolean;
};

const SCRAP_CATEGORIES: ScrapCategory[] = [
  { 
    name: "Newspaper", 
    pricePerKg: 12, 
    icon: <Newspaper size={24} />, 
    description: "Clean old newspapers, magazines, and books." 
  },
  { 
    name: "Plastic", 
    pricePerKg: 18, 
    icon: <Trash2 size={24} />, 
    description: "PET bottles, HDPE containers, and hard plastic.",
    isPopular: true 
  },
  { 
    name: "Metal", 
    pricePerKg: 30, 
    icon: <Box size={24} />, 
    description: "Iron, aluminum, copper, and mixed scrap metal.",
    isPopular: true 
  },
  { 
    name: "E-Waste", 
    pricePerKg: 25, 
    icon: <Cpu size={24} />, 
    description: "Old electronics, circuit boards, and wires." 
  },
  { 
    name: "Organic Waste", 
    pricePerKg: 6, 
    icon: <Leaf size={24} />, 
    description: "Compostable kitchen waste and garden scrap." 
  },
  { 
    name: "Batteries", 
    pricePerKg: 40, 
    icon: <Battery size={24} />, 
    description: "Lead-acid and lithium-ion batteries accepted." 
  },
];

const ScrapPriceCardsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ScrapCategory | null>(null);
  const [calcWeight, setCalcWeight] = useState<number>(0);
  const [calcCategory, setCalcCategory] = useState<string>(SCRAP_CATEGORIES[0].name);

  const estimatedEarnings = useMemo(() => {
    const categorySize = SCRAP_CATEGORIES.find(c => c.name === calcCategory);
    return categorySize ? categorySize.pricePerKg * calcWeight : 0;
  }, [calcWeight, calcCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <section className="home-section home-scrap-price-section py-5" id="scrap-price-cards" style={{ background: "linear-gradient(180deg, #f5faf7 0%, #e8f5ed 100%)" }}>
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill mb-3 fw-bold">Live Pricing</span>
          <h2 className="display-5 fw-bold mb-3">Scrap Categories & Prices</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: "600px" }}>
            Transparent pricing for all your recyclables. Select a category to see details or use our calculator below.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Row className="g-4">
            {SCRAP_CATEGORIES.map((category) => {
              const isSelected = selectedCategory?.name === category.name;
              return (
                <Col key={category.name} md={6} lg={4}>
                  <motion.div
                    variants={itemVariants}
                    className={`scrap-price-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCalcCategory(category.name);
                    }}
                  >
                    {category.isPopular && (
                      <div className="scrap-card-popular-badge">Popular</div>
                    )}
                    
                    <div>
                      <div className="scrap-card-icon">
                        {category.icon}
                      </div>
                      <h3 className="h5 fw-bold mb-2">{category.name}</h3>
                      <p className="small text-muted mb-3">{category.description}</p>
                      
                      <div className="scrap-price-badge">
                        <IndianRupee size={14} className="me-1" />
                        {category.pricePerKg}/kg
                      </div>
                    </div>

                    <button 
                      className="btn btn-primary scrap-card-book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle booking navigate or modal
                        window.location.href = "/login";
                      }}
                    >
                      Book Pickup <ArrowRight size={16} className="ms-2" />
                    </button>
                  </motion.div>
                </Col>
              );
            })}
          </Row>
        </motion.div>

        {/* Calculator Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="scrap-calculator-card"
        >
          <Row className="align-items-center">
            <Col lg={7}>
              <h3 className="calculator-title h4">
                <Calculator size={28} />
                Estimated Earnings Calculator
              </h3>
              <p className="text-muted mb-4">
                Enter the approximate weight of your scrap to estimate your total earnings.
              </p>
              
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted uppercase">Select Category</Form.Label>
                      <Form.Select 
                        className="form-control-lg border-2"
                        value={calcCategory}
                        onChange={(e) => setCalcCategory(e.target.value)}
                        style={{ borderRadius: "1rem" }}
                      >
                        {SCRAP_CATEGORIES.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted uppercase">Estimated Weight (Kg)</Form.Label>
                      <Form.Control 
                        type="number"
                        min="0"
                        className="form-control-lg border-2"
                        placeholder="e.g. 10"
                        value={calcWeight || ""}
                        onChange={(e) => setCalcWeight(Number(e.target.value))}
                        style={{ borderRadius: "1rem" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Col>
            
            <Col lg={5} className="mt-4 mt-lg-0">
              <div className="calculator-result">
                <div className="result-label">Estimated Payout</div>
                <div className="result-amount">
                  <span style={{ fontSize: "1.5rem", verticalAlign: "middle", marginRight: "4px" }}>Rs.</span>
                  {estimatedEarnings.toLocaleString()}
                </div>
                <div className="badge bg-success bg-opacity-10 text-success rounded-pill py-2">
                  <TrendingUp size={14} className="me-1" /> Best Price Guaranteed
                </div>
              </div>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </section>
  );
};

export default ScrapPriceCardsSection;
