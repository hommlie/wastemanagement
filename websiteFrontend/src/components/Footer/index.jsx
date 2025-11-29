import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        width: "100%",
        backgroundColor: "#f5f5f8ff", // slate-950-ish
        color: "#e5e7eb",
        padding: "52px 16px 40px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        {/* TOP ROW */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "40px",
            justifyContent: "space-between",
          }}
        >
          {/* Brand + Description */}
          <div style={{ flex: "1 1 260px", maxWidth: "420px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}
                >
                <img
                    src="/ecospare-logo.png"
                    alt="EcoSphere"
                    style={{
                    height: "78px",      // nice clean size
                    width: "auto",
                    objectFit: "contain",
                    }}
                />
                </div>

            </div>

            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#9ca3af",
                marginBottom: "20px",
              }}
            >
              Technology-driven waste management solutions that combine regulatory
              compliance, environmental responsibility, and complete transparency for
              sustainable business operations.
            </p>

            {/* Social icons */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                marginTop: "8px",
              }}
            >
              {[
                { title: "Website", icon: "🔗" },
                { title: "Instagram", icon: "📸" },
                { title: "Community", icon: "👥" },
                { title: "Gallery", icon: "📷" },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  title={item.title}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "999px",
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#e5e7eb",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  <span aria-hidden="true">{item.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Services / Company / Resources */}
          <div
            style={{
              flex: "2 1 420px",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "32px",
              minWidth: "320px",
            }}
          >
            {/* Services */}
            <div>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#0780f9ff",
                  marginBottom: "14px",
                }}
              >
                Services
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "14px",
                  color: "#9ca3af",
                  lineHeight: 1.9,
                }}
              >
                <li>Dry Waste Management</li>
                <li>Wet Waste Processing</li>
                <li>E-Waste Disposal</li>
                <li>Biomedical Waste</li>
                <li>Construction Debris</li>
                <li>Hazardous Waste</li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#0b7cedff",
                  marginBottom: "14px",
                }}
              >
                Company
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "14px",
                  color: "#9ca3af",
                  lineHeight: 1.9,
                }}
              >
                <li>About Us</li>
                <li>Technology</li>
                <li>Infrastructure</li>
                <li>Compliance</li>
                <li>Client Portal</li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#0a7cefff",
                  marginBottom: "14px",
                }}
              >
                Resources
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  fontSize: "14px",
                  color: "#9ca3af",
                  lineHeight: 1.9,
                }}
              >
                <li>Waste Management Guide</li>
                <li>Compliance Checklist</li>
                <li>Sustainability Reports</li>
                <li>Case Studies</li>
                <li>Industry Insights</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid #1f2937",
            marginTop: "32px",
            marginBottom: "24px",
          }}
        />

        {/* BOTTOM ROW: Head Office / Contact / Business Hours */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "32px",
            fontSize: "14px",
            color: "#9ca3af",
          }}
        >
          {/* Head Office */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  backgroundColor: "#022c22",
                  color: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                }}
              >
                ⬤
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#0b57eeff",
                  fontSize: "15px",
                }}
              >
                Head Office
              </div>
            </div>
            <p style={{ margin: 0, lineHeight: 1.7 }}>
              123 Green Avenue, Koramangala
              <br />
              Bangalore, Karnataka 560034
            </p>
          </div>

          {/* Contact */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  backgroundColor: "#022c22",
                  color: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                }}
              >
                ☎
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#0e55e4ff",
                  fontSize: "15px",
                }}
              >
                Contact
              </div>
            </div>
            <p style={{ margin: 0, lineHeight: 1.7 }}>
              +91 80 1234 5678
              <br />
              quotes@ecosphere.com
            </p>
          </div>

          {/* Business Hours */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  backgroundColor: "#022c22",
                  color: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                }}
              >
                ⏱
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#105df6ff",
                  fontSize: "15px",
                }}
              >
                Business Hours
              </div>
            </div>
            <p style={{ margin: 0, lineHeight: 1.7 }}>
              Mon&nbsp;–&nbsp;Sat: 8:00 AM&nbsp;–&nbsp;8:00 PM
              <br />
              24/7 Emergency Support
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
