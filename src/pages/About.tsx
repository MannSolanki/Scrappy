import React from "react";
import { Leaf, Shield, Users } from "lucide-react";
import "../styles/ScrappyUI.css";

const About: React.FC = () => {
  return (
    <div>
      <section className="about-hero">
        <div className="scrap-container about-hero-inner">
          <h1>About EcoScrap</h1>
          <p>
            We are on a mission to revolutionize the scrap and recycling industry
            through sustainable practices and innovative solutions.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="scrap-container">
          <div className="feature-grid">
            <article className="feature">
              <div className="feature-icon">
                <Shield size={28} />
              </div>
              <h3>Trust and Security</h3>
              <p>
                We maintain high standards of security and transparency in all our
                operations.
              </p>
            </article>
            <article className="feature">
              <div className="feature-icon">
                <Leaf size={28} />
              </div>
              <h3>Sustainability</h3>
              <p>
                Our processes are designed to minimize environmental impact and
                maximize resource recovery.
              </p>
            </article>
            <article className="feature">
              <div className="feature-icon">
                <Users size={28} />
              </div>
              <h3>Community Focus</h3>
              <p>
                We work closely with local communities to promote recycling
                awareness and better practices.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="scrap-container">
          <h2 className="section-title">Our Story</h2>
          <div className="story">
            <p>
              Founded in 2020, EcoScrap emerged from a simple vision: to make
              recycling accessible and rewarding for everyone.
            </p>
            <p>
              Our team consists of industry experts, environmental scientists, and
              technology innovators working together to create sustainable
              solutions for waste management.
            </p>
            <p>
              Today, we are focused on making scrap management easier for both
              individuals and businesses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
