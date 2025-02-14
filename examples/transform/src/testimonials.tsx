import React from "react";

export function Testimonials() {
  return (
    <section className="testimonials">
      <h2>What Our Customers Say</h2>
      <div className="testimonial-grid">
        <blockquote className="testimonial">
          <p>
            "This platform has completely transformed how we handle our
            workflow. The efficiency gains are incredible!"
          </p>
          <footer>
            <cite>Sarah Johnson</cite>
            <p>CTO at TechCorp</p>
          </footer>
        </blockquote>

        <blockquote className="testimonial">
          <p>
            "The customer support team is phenomenal. They went above and beyond
            to help us implement the solution."
          </p>
          <footer>
            <cite>Michael Chen</cite>
            <p>Product Manager at InnovateCo</p>
          </footer>
        </blockquote>

        <blockquote className="testimonial">
          <p>
            "We've seen a 200% increase in productivity since switching to this
            platform. It's been a game-changer."
          </p>
          <footer>
            <cite>Emma Rodriguez</cite>
            <p>Director of Operations at GrowthLabs</p>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
