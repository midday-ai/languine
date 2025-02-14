import React from "react";

export function Hero() {
  return (
    <div>
      <h1>
        <h1>Welcome to our amazing startup</h1>
        <p>
          We are a team of experienced developers who are passionate about
          building amazing products.
        </p>
      </h1>

      <div>
        <button type="button">Get Started</button>
        <button type="button">Learn More</button>
      </div>

      <img src="/hero.png" alt="This is a great hero" />
    </div>
  );
}
