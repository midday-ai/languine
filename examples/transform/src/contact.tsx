import React from "react";

export function Contact() {
  return (
    <section className="contact">
      <h2>Get in Touch</h2>
      <p className="subtitle">
        We'd love to hear from you. Send us a message and we'll respond as soon
        as possible.
      </p>

      <div className="contact-container">
        <div className="contact-info">
          <h3>Contact Information</h3>
          <p>Email: hello@company.com</p>
          <p>Phone: (555) 123-4567</p>
          <p>Address: 123 Innovation Street, Tech City, TC 12345</p>

          <div className="office-hours">
            <h4>Office Hours</h4>
            <p>Monday - Friday: 9:00 AM - 6:00 PM EST</p>
            <p>Saturday - Sunday: Closed</p>
          </div>
        </div>

        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" placeholder="Enter your name" />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" placeholder="How can we help you?" />
          </div>

          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>
  );
}
