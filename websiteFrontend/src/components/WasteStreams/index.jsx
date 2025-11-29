import React, { useState } from "react";

const cards = [
  {
    title: "Dry Waste Management",
    desc: "Comprehensive recycling solutions for paper, plastic, metal, and glass with complete documentation and tracking.",
    points: ["Segregated Collection", "Recycling Certification", "Monthly Reports"],
    icon: "🗂️",
  },
  {
    title: "Wet Waste Processing",
    desc: "Organic waste composting and biogas generation with measurable environmental impact and compliance documentation.",
    points: ["Composting Solutions", "Biogas Generation", "Impact Tracking"],
    icon: "⚗️",
  },
  {
    title: "E-Waste Disposal",
    desc: "Certified electronic waste handling with secure data destruction and proper recycling of hazardous materials.",
    points: ["Data Security", "Certified Disposal", "Compliance Reports"],
    icon: "💻",
  },
  {
    title: "Biomedical Waste",
    desc: "Specialized handling of medical waste with complete regulatory compliance and safe disposal protocols.",
    points: ["Safe Handling", "Regulatory Compliance", "Traceable Disposal"],
    icon: "💚",
  },
  {
    title: "Construction Debris",
    desc: "Efficient removal and recycling of construction waste with proper segregation and disposal documentation.",
    points: ["Debris Segregation", "Recycling Pathways", "On-Site Coordination"],
    icon: "🏗️",
  },
  {
    title: "Hazardous Waste",
    desc: "Expert handling of industrial hazardous waste with complete safety protocols and regulatory compliance.",
    points: ["Safety Protocols", "Licensed Transport", "Regulatory Reporting"],
    icon: "⚠️",
  },
];

// group cards 3 per slide
const groupSize = 3;
const slides = Array.from({ length: Math.ceil(cards.length / groupSize) }, (_, i) =>
  cards.slice(i * groupSize, i * groupSize + groupSize)
);

const WasteStreams = () => {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const goTo = (index) => {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    setCurrent(index);
  };

  return (
    <section
      style={{
        width: "100%",
        backgroundColor: "#ffffff",
        padding: "12px 16px 82px",
        marginLeft: "-10px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "32px",
              lineHeight: "1.2",
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: "12px",
            }}
          >
            Comprehensive Waste Stream Solutions
          </h2>
          <p
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              fontSize: "15px",
              color: "#64748b",
              lineHeight: "1.6",
            }}
          >
            From organic waste to hazardous materials, we provide certified and
            transparent waste-management solutions for every business need.
          </p>
        </div>

        {/* Slider Wrapper */}
        <div style={{ position: "relative" }}>
          
          {/* LEFT ARROW (always visible) */}
          <button
            onClick={() => goTo(current - 1)}
            aria-label="Previous slide"
            style={{
              position: "absolute",
              left: "-50px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "20px",
              color: "#0f172a",
              zIndex: 10,
            }}
          >
            ←
          </button>

          {/* RIGHT ARROW (always visible) */}
          <button
            onClick={() => goTo(current + 1)}
            aria-label="Next slide"
            style={{
              position: "absolute",
              right: "-50px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              border: "1px solid #d1d5db",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "20px",
              color: "#0f172a",
              zIndex: 10,
            }}
          >
            →
          </button>

          {/* Viewport */}
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                transition: "transform 0.4s ease",
                transform: `translateX(-${current * 100}%)`,
              }}
            >
              {slides.map((slideCards, slideIndex) => (
                <div
                  key={slideIndex}
                  style={{
                    minWidth: "100%",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "24px",
                  }}
                >
                  {slideCards.map((card) => (
                    <article
                      key={card.title}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "18px",
                        border: "1px solid #e5e7eb",
                        padding: "22px",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          backgroundColor: "#ecfdf5",
                          color: "#047857",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          marginBottom: "12px",
                        }}
                      >
                        {card.icon}
                      </div>

                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "8px",
                        }}
                      >
                        {card.title}
                      </h3>

                      <p
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          lineHeight: 1.7,
                          marginBottom: "12px",
                        }}
                      >
                        {card.desc}
                      </p>

                      <ul style={{ marginBottom: "14px", padding: 0, listStyle: "none" }}>
                        {card.points.map((p) => (
                          <li
                            key={p}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginBottom: "4px",
                              fontSize: "13px",
                              color: "#475569",
                            }}
                          >
                            <span
                              style={{
                                border: "1px solid #6ee7b7",
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                color: "#047857",
                                fontSize: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ✓
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>

                      <button
                        style={{
                          marginTop: "auto",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#047857",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        Learn More →
                      </button>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div
          style={{
            marginTop: "22px",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Slide ${index + 1}`}
              style={{
                height: "10px",
                width: current === index ? "26px" : "10px",
                backgroundColor: current === index ? "#10b981" : "#cbd5e1",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WasteStreams;
