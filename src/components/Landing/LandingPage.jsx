import React, { useState } from 'react';
import { Heart, Users, Search, Package, Shield, Award, Clock, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { sendContactMessage } from '../../services/emailService';

const LandingPage = ({ onLoginClick }) => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await sendContactMessage(contactForm);
      setSubmitMessage('Message sent successfully! We\'ll get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending contact message:', error);
      setSubmitMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="landing-logo">
            <Heart size={32} />
            <span>BloodBank</span>
          </div>
          <div className="landing-nav-links">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
            <button onClick={onLoginClick} className="landing-login-btn">
              Login / Register
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Save Lives Through <span className="gradient-text">Blood Donation</span> <span className="heartbeat">❤️</span></h1>
            <p>
              Join our community of life-savers. Connect donors with those in need, 
              manage blood inventory, and make a difference in your community.
            </p>
            <div className="hero-buttons">
              <button onClick={onLoginClick} className="cta-primary">
                Get Started
              </button>
              <a href="#about" className="cta-secondary">
                Learn More
              </a>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="hero-card">
              <Heart className="hero-heart" />
              <h3>Every Drop Counts</h3>
              <p>Your donation can save up to 3 lives</p>
            </div>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div>Scroll Down</div>
          <div style={{ fontSize: '1.5rem', marginTop: '5px' }}>↓</div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Lives Saved</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Active Donors</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Partner Hospitals</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Emergency Support</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-content">
          <h2 className="section-title">About BloodBank</h2>
          <p className="section-subtitle">
            BloodBank is a comprehensive blood donation management system that connects 
            donors, hospitals, and medical institutions to ensure a steady supply of 
            life-saving blood when it's needed most.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <h3 className="feature-title">Safe & Secure</h3>
              <p className="feature-description">All donor information is protected with advanced security measures and encryption protocols</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={24} />
              </div>
              <h3 className="feature-title">Real-time Tracking</h3>
              <p className="feature-description">Live inventory management and instant request processing with automated notifications</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Award size={24} />
              </div>
              <h3 className="feature-title">Certified Process</h3>
              <p className="feature-description">Following international standards for blood collection, testing, and storage procedures</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Heart size={24} />
              </div>
              <h3 className="feature-title">Community Impact</h3>
              <p className="feature-description">Building stronger communities through organized blood donation drives and awareness programs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="services-container">
          <h2>Our Services</h2>
          <p className="services-subtitle">
            Comprehensive blood donation management for all stakeholders
          </p>
          
          <div className="services-grid">
            <div className="service-card">
              <Users className="service-icon donor" />
              <h3>For Donors</h3>
              <ul>
                <li>Easy registration and profile management</li>
                <li>Health eligibility assessment</li>
                <li>Donation history tracking</li>
                <li>Notification for urgent requests</li>
              </ul>
              <button onClick={onLoginClick} className="service-btn">
                Register as Donor
              </button>
            </div>
            
            <div className="service-card">
              <Package className="service-icon hospital" />
              <h3>For Hospitals</h3>
              <ul>
                <li>Blood inventory management</li>
                <li>Emergency blood requests</li>
                <li>Donor database access</li>
                <li>Real-time stock alerts</li>
              </ul>
              <button onClick={onLoginClick} className="service-btn">
                Hospital Login
              </button>
            </div>
            
            <div className="service-card">
              <Search className="service-icon admin" />
              <h3>Blood Bank Management</h3>
              <ul>
                <li>Request approval system</li>
                <li>Donor verification</li>
                <li>System-wide analytics</li>
                <li>Quality control monitoring</li>
              </ul>
              <button onClick={onLoginClick} className="service-btn">
                Admin Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="how-container">
          <h2>How It Works</h2>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Register</h4>
              <p>Sign up as a donor, hospital, or admin based on your role</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h4>Verify</h4>
              <p>Complete profile verification and health assessment</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h4>Connect</h4>
              <p>Match with compatible donors or submit blood requests</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h4>Save Lives</h4>
              <p>Donate blood and help save lives in your community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="contact-container">
          <h2>Get In Touch</h2>
          
          <div className="contact-content">
            <div className="contact-info">
              <h3>Contact Information</h3>
              
              <div className="contact-item">
                <Phone className="contact-icon" />
                <div>
                  <strong>Emergency Hotline</strong>
                  <p>+91 9876543210</p>
                </div>
              </div>
              
              <div className="contact-item">
                <Mail className="contact-icon" />
                <div>
                  <strong>Email Support</strong>
                  <p>support@bloodbank.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <div>
                  <strong>Head Office</strong>
                  <p>123 Healthcare Street, Medical City, MC 12345</p>
                </div>
              </div>
            </div>
            
            <div className="contact-form">
              <h3>Send us a Message</h3>
              {submitMessage && (
                <div className={`contact-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    placeholder="Your Name" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="email" 
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    placeholder="Your Email" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <textarea 
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    placeholder="Your Message" 
                    rows="4" 
                    required
                  />
                </div>
                <button type="submit" className="contact-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-section">
              <div className="footer-logo">
                <Heart size={32} />
                <span>BloodBank</span>
              </div>
              <p>
                Connecting donors with those in need. Our platform ensures safe, 
                efficient blood donation management with real-time tracking and 
                emergency support available 24/7.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link">
                  <Mail size={20} />
                </a>
                <a href="#" className="social-link">
                  <Phone size={20} />
                </a>
                <a href="#" className="social-link">
                  <MapPin size={20} />
                </a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>For Donors</h4>
              <ul>
                <li><a href="#">→ Register as Donor</a></li>
                <li><a href="#">→ Eligibility Check</a></li>
                <li><a href="#">→ Donation Process</a></li>
                <li><a href="#">→ Health Benefits</a></li>
                <li><a href="#">→ Success Stories</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>For Hospitals</h4>
              <ul>
                <li><a href="#">→ Join Network</a></li>
                <li><a href="#">→ Inventory Management</a></li>
                <li><a href="#">→ Request Blood</a></li>
                <li><a href="#">→ Emergency Support</a></li>
                <li><a href="#">→ Partner Benefits</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support & Info</h4>
              <ul>
                <li><a href="#">→ Help Center</a></li>
                <li><a href="#">→ Contact Support</a></li>
                <li><a href="#">→ Privacy Policy</a></li>
                <li><a href="#">→ Terms of Service</a></li>
                <li><a href="#">→ Report Issue</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 BloodBank - Professional Blood Donation Management System. All rights reserved. | Saving lives through technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;