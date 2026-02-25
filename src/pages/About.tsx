<<<<<<< HEAD
import React from 'react';
import { Shield, Leaf, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-white">
      <div className="relative py-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1616401784845-180882ba9ba8"
            alt="Recycling facility"
            className="w-full h-full object-cover opacity-25"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About Scrappy</h1>
            <p className="text-xl text-gray-600">
              We're on a mission to revolutionize the scrap and recycling industry through sustainable practices and innovative solutions.
            </p>
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust & Security</h3>
              <p className="text-gray-600">
                We maintain the highest standards of security and transparency in all our operations.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
              <p className="text-gray-600">
                Our processes are designed to minimize environmental impact and maximize resource recovery.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Focus</h3>
              <p className="text-gray-600">
                We work closely with local communities to promote recycling awareness and practices.
              </p>
            </div>
=======
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
>>>>>>> scrappy
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
            <div className="prose max-w-none">
              <p className="mb-4">
                Founded in 2020, EcoScrap emerged from a simple vision: to make recycling accessible and rewarding for everyone. What started as a small local initiative has grown into a comprehensive platform serving thousands of customers across the country.
              </p>
              <p className="mb-4">
                Our team consists of industry experts, environmental scientists, and technology innovators who work together to create sustainable solutions for waste management and recycling challenges.
              </p>
              <p>
                Today, we're proud to be leading the way in digital transformation of the scrap industry, making it easier than ever for individuals and businesses to contribute to a more sustainable future.
              </p>
            </div>
=======
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
>>>>>>> scrappy
          </div>
        </div>
      </section>
    </div>
  );
};

<<<<<<< HEAD
export default About;
=======
export default About;
>>>>>>> scrappy
