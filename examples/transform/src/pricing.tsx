import React from "react";

export function Pricing() {
  return (
    <section className="pricing">
      <h2>Simple, Transparent Pricing</h2>
      <p className="subtitle">Choose the plan that works best for your needs</p>

      <div className="pricing-tiers">
        <div className="tier">
          <h3>Starter</h3>
          <p className="price">$9/month</p>
          <ul>
            <li>Up to 1,000 users</li>
            <li>Basic analytics</li>
            <li>Email support</li>
          </ul>
          <button type="button">Start Free Trial</button>
        </div>

        <div className="tier popular">
          <h3>Professional</h3>
          <p className="price">$29/month</p>
          <ul>
            <li>Up to 10,000 users</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
          </ul>
          <button type="button">Get Started</button>
        </div>
      </div>
    </section>
  );
}
