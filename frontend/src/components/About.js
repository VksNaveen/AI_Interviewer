import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaGraduationCap, FaBrain, FaChartLine, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSignInAlt, FaUsers } from 'react-icons/fa';
import '../About.css';
import Footer from './Footer';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaRobot />,
      title: "AI-Powered Interviews",
      description: "Experience realistic interview scenarios with our advanced AI interviewer that adapts to your responses and provides personalized feedback."
    },
    {
      icon: <FaGraduationCap />,
      title: "Comprehensive Learning",
      description: "Practice different types of interviews including technical rounds, MCQs, and self-introduction to build complete interview confidence."
    },
    {
      icon: <FaBrain />,
      title: "Smart Feedback",
      description: "Receive detailed analysis and constructive feedback on your performance to help you improve and succeed in real interviews."
    },
    {
      icon: <FaChartLine />,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed performance analytics and progress tracking features."
    }
  ];

  const teamMembers = [
    "Naveen Karuppasamy",
    "Krish Kumar Murugan",
    "Keerthi Palem",
    "Sona Selvaraj"
  ];

  return (
    <div className="about-page-wrapper">
      <div className="about-container">
        <header className="about-toolbar">
          <div className="about-toolbar-left">
            <img src="/AI_INT.png" alt="Logo" className="about-toolbar-logo" />
            <span className="about-toolbar-title">AI INTERVIEW COACH</span>
          </div>
          <div className="about-toolbar-right">
            <button className="about-login-button" onClick={() => navigate("/")}>
              <FaSignInAlt /> Login
            </button>
          </div>
        </header>

        <main className="about-content">
          <div className="about-header">
            <h1 className="about-title">Welcome to AI Interview Coach</h1>
            <p className="about-subtitle">
              Your personal AI-powered interview preparation platform designed to help you succeed in your career journey.
              Practice with our intelligent system and receive instant, personalized feedback to improve your interview skills.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>

          <section className="team-section">
            <h2 className="team-title">
              <FaUsers className="team-icon" /> Our Team
            </h2>
            <div className="team-list">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-member">
                  <h3 className="member-name">{member}</h3>
                </div>
              ))}
            </div>
          </section>

          <section className="contact-section">
            <h2 className="contact-title">Get in Touch</h2>
            <div className="contact-info">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>contact@aiinterviewcoach.com</span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>123 AI Street, Tech Valley, CA 94025</span>
              </div>
            </div>
          </section>
        </main>

        <Footer isAuthenticated={false} variant="full" />
      </div>
    </div>
  );
};

export default About;