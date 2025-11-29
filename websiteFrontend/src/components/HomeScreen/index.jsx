import React from "react";
import QuoteForm from "../QuoteForm";

const HomeScreen = () => {
  return (
    <>
      <section
        id="residential"
        className="relative h-[600px] md:h-screen bg-cover bg-center flex items-center justify-center pb-32 md:pb-48"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      >
        {/* dark overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(15,23,42,0.6)" }}
        />

        {/* hero text */}
        <div className="relative text-center max-w-5xl px-6">
          <h1
            style={{
              color: "#ffffff",
              fontSize: "3.5rem",
              lineHeight: 1.15,
              fontWeight: 800,
              marginBottom: "2rem",
              marginTop: "12rem",
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Waste Management That
            <br />
            Works For Your Business{" "}
            <span style={{ color: "#22c55e" }}>And</span>
            <br />
            <span style={{ color: "#22c55e" }}>The Environment</span>
          </h1>

        </div>
      </section>

      <div id="quote-form" className="relative z-0">
        <QuoteForm />
      </div>
    </>
  );
};

export default HomeScreen;
