import React from "react";

export function About() {
  return (
    <section className="about">
      <div className="about-header">
        <h2>Our Story</h2>
        <p className="subtitle">Building the future of technology since 2015</p>
      </div>

      <div className="about-content">
        <div className="mission">
          <h3>Our Mission</h3>
          <p>
            We're on a mission to revolutionize how businesses handle their
            digital transformation. Through innovative solutions and
            cutting-edge technology, we empower organizations to achieve their
            full potential.
          </p>
        </div>

        <div className="values">
          <h3>Core Values</h3>
          <ul>
            <li>
              <h4>Innovation First</h4>
              <p>We constantly push boundaries and explore new possibilities</p>
            </li>
            <li>
              <h4>Customer Success</h4>
              <p>
                Your success is our success - we're committed to your growth
              </p>
            </li>
            <li>
              <h4>Transparency</h4>
              <p>We believe in open communication and honest relationships</p>
            </li>
          </ul>
        </div>

        <div className="milestones">
          <h3>Key Milestones</h3>
          <div className="timeline">
            <div className="milestone">
              <h4>2015</h4>
              <p>
                Founded in San Francisco with a team of 5 passionate developers
              </p>
            </div>
            <div className="milestone">
              <h4>2018</h4>
              <p>Expanded to 100+ enterprise clients across 20 countries</p>
            </div>
            <div className="milestone">
              <h4>2021</h4>
              <p>Launched revolutionary AI-powered platform features</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
