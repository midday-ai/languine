import React from "react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li>
              <a href="/about">About Us</a>
            </li>
            <li>
              <a href="/careers">Careers</a>
            </li>
            <li>
              <a href="/press">Press</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Product</h3>
          <ul>
            <li>
              <a href="/features">Features</a>
            </li>
            <li>
              <a href="/pricing">Pricing</a>
            </li>
            <li>
              <a href="/security">Security</a>
            </li>
            <li>
              <a href="/enterprise">Enterprise</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li>
              <a href="/documentation">Documentation</a>
            </li>
            <li>
              <a href="/tutorials">Tutorials</a>
            </li>
            <li>
              <a href="/support">Support</a>
            </li>
            <li>
              <a href="/api">API</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Legal</h3>
          <ul>
            <li>
              <a href="/privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms">Terms of Service</a>
            </li>
            <li>
              <a href="/cookies">Cookie Policy</a>
            </li>
            <li>
              <a href="/compliance">Compliance</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Company Name. All rights reserved.</p>
        <div className="social-links">
          <a href="https://twitter.com/company" aria-label="Twitter">
            Twitter
          </a>
          <a href="https://linkedin.com/company" aria-label="LinkedIn">
            LinkedIn
          </a>
          <a href="https://github.com/company" aria-label="GitHub">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
