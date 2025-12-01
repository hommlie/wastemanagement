import React from "react";
import QuoteForm from "../QuoteForm";
import { FiFileText } from "react-icons/fi"; // icon for certifications

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

          {/* ⭐ NEW BUTTONS BELOW TEXT */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
            <button
              className="px-8 py-3 rounded-xl text-white font-semibold text-lg shadow-lg hover:opacity-90 transition"
              style={{ backgroundColor: "#22c55e" }}  // green button
            >
              Get Instant Quote →
            </button>

            <button
              className="px-8 py-3 rounded-xl text-white font-semibold text-lg flex items-center gap-2 border border-white/30 hover:bg-white/10 transition"
              style={{ color: "#ffffff" }}
            >
              View Certifications <FiFileText size={20} />
            </button>
          </div>
        </div>
      </section>

      <div id="quote-form" className="relative z-0">
        <QuoteForm />
      </div>
    </>
  );
};

export default HomeScreen;
