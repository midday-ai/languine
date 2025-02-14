import React from "react";

export function FAQ() {
  return (
    <section className="faq">
      <h2>Frequently Asked Questions</h2>
      <p className="subtitle">
        Find answers to common questions about our service
      </p>

      <div className="faq-list">
        <div className="faq-item">
          <h3>How does the free trial work?</h3>
          <p>
            Our 14-day free trial gives you full access to all features. No
            credit card required until you decide to upgrade.
          </p>
        </div>

        <div className="faq-item">
          <h3>Can I cancel my subscription anytime?</h3>
          <p>
            Yes, you can cancel your subscription at any time. We offer a
            hassle-free cancellation process with no hidden fees.
          </p>
        </div>

        <div className="faq-item">
          <h3>What kind of support do you offer?</h3>
          <p>
            We provide 24/7 email support for all customers. Premium plans
            include priority phone and video support.
          </p>
        </div>

        <div className="faq-item">
          <h3>Is my data secure?</h3>
          <p>
            We use industry-leading encryption and security measures to protect
            your data. All information is stored in SOC 2 compliant data
            centers.
          </p>
        </div>
      </div>
    </section>
  );
}
