import React, { useState } from "react";
import "./Home.css";
import avatar from './avatar-bot.jpg'
import robot from './robot-icon.jpg'
function Home() {
  const [purpose, setPurpose] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Travel Purpose submitted: ${purpose}`);
  };

  return (
    <div className="homepage">
      <section className="hero-section">
        <h1>Your multilingual <br /> AI chatbot assistant</h1>
        <div className="chat-bubbles">
          <span>Hello</span>
          <span>मराठी</span>
          <span>नमस्ते</span>
          <span>வணக்கம்</span>
        </div>
        <div className="chatbot-avatar">
          <img src={avatar} alt="AI Assistant" />
        </div>
        <input type="text" placeholder="Send a message" className="chat-input" />
      </section>

      <section className="practice-section">
        <div className="text">
          <h2>Practice your language skills with an AI assistant</h2>
          <p>Improve your skills in real-time conversations and receive instant feedback with our multilingual AI chatbot.</p>
          <button className="get-started">Get Started</button>
        </div>
        <div className="illustration">
          <img src={robot} alt="AI Bot" />
        </div>
      </section>

      <section className="features-section">
        <h2>Features</h2>
        <div className="features">
          <div>
            <span role="img" aria-label="chat">💬</span>
            <h3>Real-time Conversation</h3>
            <p>Chat with instant feedback on your pronunciation.</p>
          </div>
          <div>
            <span role="img" aria-label="feedback">🔊</span>
            <h3>Pronunciation Feedback</h3>
            <p>Get feedback so you can improve quickly.</p>
          </div>
          <div>
            <span role="img" aria-label="globe">🌐</span>
            <h3>Multilingual Support</h3>
            <p>Translations and phrase suggestions for new ways to speak.</p>
          </div>
        </div>
      </section>

      <section className="travel-form">
        <h2>Travel Purpose Form</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="purpose">Why are you traveling?</label>
          <input
            type="text"
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Business, Education, Tourism"
          />
          <button type="submit">Submit</button>
        </form>
      </section>
    </div>
  );
}

export default Home;
