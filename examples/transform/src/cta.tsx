import React from "react";

export function CTA() {
  return (
    <section className="cta">
      <div className="cta-content">
        <h2>Ready to Transform Your Business?</h2>
        <p className="subtitle">
          Join thousands of companies already using our platform to scale their
          operations
        </p>

        <div className="cta-stats">
          <div className="stat">
            <h3>10,000+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat">
            <h3>99.9%</h3>
            <p>Uptime</p>
          </div>
          <div className="stat">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
        </div>

        <div className="cta-actions">
          <button type="button" className="primary">
            Start Free Trial
          </button>
          <button type="button" className="secondary">
            Schedule Demo
          </button>
        </div>

        <p className="guarantee">
          30-day money-back guarantee • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
}
