import React, { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import "../styles/ScrappyUI.css";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitted(false);
  };

  return (
    <section className="section">
      <div className="scrap-container">
        <h1 className="section-title">Contact Us</h1>
        <div className="contact-wrap">
          <article className="card">
            <h2>Get in Touch</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="btn-submit">
                Send Message <Send size={16} />
              </button>
              {submitted && <p>Thanks! Your message has been recorded.</p>}
            </form>
          </article>

          <div>
            <article className="card">
              <h2>Contact Information</h2>
              <p className="contact-item">
                <Phone size={18} /> +1 (555) 123-4567
              </p>
              <p className="contact-item">
                <Mail size={18} /> info@ecoscrap.com
              </p>
              <p className="contact-item">
                <MapPin size={18} /> 123 Recycling Way, Green City, ST 12345
              </p>
            </article>

            <article className="card" style={{ marginTop: "14px" }}>
              <h2>Business Hours</h2>
              <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
