import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { Leaf, PackageCheck, Recycle, Users } from "lucide-react";

type Stat = {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ size?: number }>;
};

const stats: Stat[] = [
  { label: "Users", value: 500, suffix: "+", icon: Users },
  { label: "Tons Waste Recycled", value: 2, icon: Recycle },
  { label: "Pickups Completed", value: 100, suffix: "+", icon: PackageCheck },
  { label: "CO2 Saved", value: 12, suffix: "t", icon: Leaf },
];

const ImpactStatsSection: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentValues, setCurrentValues] = useState<number[]>(stats.map(() => 0));
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasStarted(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const durationMs = 1100;
    const frameMs = 30;
    const steps = Math.ceil(durationMs / frameMs);
    let tick = 0;

    const timer = window.setInterval(() => {
      tick += 1;
      const progress = Math.min(tick / steps, 1);

      setCurrentValues(
        stats.map((stat) => {
          const nextValue = Math.round(stat.value * progress);
          return nextValue;
        })
      );

      if (progress >= 1) {
        window.clearInterval(timer);
      }
    }, frameMs);

    return () => window.clearInterval(timer);
  }, [hasStarted]);

  const renderedValues = useMemo(
    () =>
      stats.map((stat, index) => {
        const current = currentValues[index] ?? 0;
        return `${current}${stat.suffix || ""}`;
      }),
    [currentValues]
  );

  return (
    <section className="home-section home-impact reveal-on-scroll" ref={sectionRef}>
      <Container>
        <div className="home-section-header">
          <h2>Our Impact So Far</h2>
          <p>Real outcomes from everyday recycling actions powered by EcoScrap.</p>
        </div>

        <Row className="g-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Col key={stat.label} xs={12} sm={6} lg={3}>
                <Card className="impact-card h-100">
                  <Card.Body>
                    <div className="impact-card-top">
                      <div className="home-icon-chip impact-icon-chip">
                        <Icon size={20} />
                      </div>
                      <p className="impact-label">{stat.label}</p>
                    </div>
                    <h3 className="impact-value">{renderedValues[index]}</h3>
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

export default ImpactStatsSection;
