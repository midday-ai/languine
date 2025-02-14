import React from "react";

export function Team() {
  return (
    <section className="team">
      <h2>Meet Our Team</h2>
      <p className="subtitle">The passionate people behind our success</p>

      <div className="team-grid">
        <div className="team-member">
          <img src="/team/alex.jpg" alt="Alex Thompson" />
          <h3>Alex Thompson</h3>
          <p className="role">Chief Executive Officer</p>
          <p className="bio">
            With 15+ years of experience in tech leadership, Alex drives our
            vision and strategy forward.
          </p>
        </div>

        <div className="team-member">
          <img src="/team/maria.jpg" alt="Maria Garcia" />
          <h3>Maria Garcia</h3>
          <p className="role">Head of Product</p>
          <p className="bio">
            Maria brings 10 years of product development expertise from leading
            Silicon Valley companies.
          </p>
        </div>

        <div className="team-member">
          <img src="/team/james.jpg" alt="James Wilson" />
          <h3>James Wilson</h3>
          <p className="role">Lead Engineer</p>
          <p className="bio">
            James is a full-stack wizard with a passion for building scalable
            solutions.
          </p>
        </div>

        <div className="team-member">
          <img src="/team/sophie.jpg" alt="Sophie Chen" />
          <h3>Sophie Chen</h3>
          <p className="role">Customer Success Lead</p>
          <p className="bio">
            Sophie ensures our customers get the most value from our platform.
          </p>
        </div>
      </div>
    </section>
  );
}
