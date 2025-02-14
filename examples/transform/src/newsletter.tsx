import React from "react";

export function Newsletter() {
  return (
    <section className="newsletter">
      <div className="newsletter-content">
        <h2>Stay Updated</h2>
        <p className="subtitle">
          Subscribe to our newsletter for the latest updates, industry insights,
          and exclusive offers.
        </p>

        <form className="newsletter-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address for newsletter"
            />
            <button type="submit">Subscribe Now</button>
          </div>
          <p className="privacy-note">
            We respect your privacy. Unsubscribe at any time. Read our Privacy
            Policy for more information.
          </p>
        </form>

        <div className="benefits">
          <div className="benefit">
            <h4>Weekly Updates</h4>
            <p>
              Get the latest news and product updates straight to your inbox
            </p>
          </div>
          <div className="benefit">
            <h4>Exclusive Content</h4>
            <p>Access to subscriber-only articles and resources</p>
          </div>
        </div>
      </div>
    </section>
  );
}
