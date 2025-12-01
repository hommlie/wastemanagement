import React, { useEffect, useState } from "react";

const MainHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [activeMenu, setActiveMenu] = useState(null);

  // ⭐ MEGA MENU DATA
  const menus = {
    Residential: {
      image: "/hero-bg.png",
      desc: "EcoSpare provides cleaner, smarter residential waste pickup.",
      cols: [
        {
          head: "Residential Services",
          items: [
            "Trash & Recycling Pickup",
            "Bulk Trash Pickup",
            "Dumpster Bag Pickup",
            "Roll-Off Rentals",
            "Drop-Off Locations",
          ],
        },
        {
          head: "Communities",
          items: [
            "Service Areas",
            "Municipalities",
            "HOA Services",
            "Property Management",
          ],
        },
      ],
    },

    Commercial: {
      image: "/hero-bg.png",
      desc: "Reliable commercial waste & recycling services built for business.",
      cols: [
        {
          head: "Commercial Services",
          items: [
            "Commercial Pickup",
            "Roll-Off Dumpsters",
            "Compactors",
            "Shredding Services",
            "Drop-Off Locations",
          ],
        },
        {
          head: "Industries",
          items: ["Corporate", "IT Parks", "Malls", "Restaurants", "Factories"],
        },
        {
          head: "Enterprise",
          items: ["Analytics Platform", "National Accounts"],
        },
      ],
    },

    "Environmental Solutions": {
      image: "/hero-bg.png",
      desc: "EcoSpare supports sustainability and environmental compliance.",
      cols: [
        {
          head: "Environmental Services",
          items: [
            "Disposal Services",
            "Hazardous Waste",
            "Transportation",
            "Onsite Services",
          ],
        },
        {
          head: "Specialized",
          items: ["Organics", "Wet Waste", "Recycling Programs", "Consulting"],
        },
      ],
    },

    Healthcare: {
      image: "/hero-bg.png",
      desc: "Fully compliant biomedical waste collection and reporting.",
      cols: [
        {
          head: "Biomedical Waste",
          items: [
            "BMW Pickup",
            "Color Segregation",
            "Audit Trail",
            "Safety Compliance",
          ],
        },
        {
          head: "Industries",
          items: ["Hospitals", "Clinics", "Labs", "Diagnostics", "Pharma"],
        },
      ],
    },

    Sustainability: {
      image: "/hero-bg.png",
      desc: "EcoSpare’s sustainability programs help reduce ecological impact.",
      cols: [
        {
          head: "Sustainability",
          items: ["Reports", "Impact", "Recycling 101", "Awareness Programs"],
        },
        {
          head: "Recycling",
          items: [
            "Residential Recycling",
            "Commercial Recycling",
            "Recycle Right",
            "How Recycling Works",
          ],
        },
      ],
    },
  };

  // ⭐ SCROLL
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ⭐ MOBILE DETECT
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ⭐ underline hover style
  const underlineStyle = {
    position: "relative",
    paddingBottom: "4px",
  };

  const underlineHover = {
    position: "relative",
    paddingBottom: "4px",
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        left: 0,
        zIndex: 50,
        backgroundColor: isScrolled ? "white" : "transparent",
        boxShadow: isScrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.4s ease-in-out",
      }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      {/* ------------------------ TOP SMALL BAR ------------------------ */}
      <div
        style={{
          maxWidth: "1300px",
          margin: "20 auto",
          padding: isMobile ? "8px 20px" : "8px 40px",
          display: "flex",
          justifyContent: isMobile ? "space-between" : "center",
          gap: "14px",
          fontSize: isMobile ? "14px" : "15px",
          fontWeight: 700,
          color: isScrolled ? "#064e3b" : "white",
          alignItems: "center",
          transition: "color 0.3s",
          marginLeft: "20px",
        }}
      >
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", marginLeft: "500px", marginTop: "14px" }}>
          <a style={{ color: isScrolled ? "#064e3b" : "white" }}>Support</a>
          <a style={{ color: isScrolled ? "#064e3b" : "white" }}>Schedule & ETA</a>
          <a style={{ color: isScrolled ? "#064e3b" : "white" }}>Make a Payment</a>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", gap: 15, alignItems: "center", marginTop: "14px" }}>
            <a style={{ color: isScrolled ? "#064e3b" : "white" }}>Drop-Off Locations</a>
            <a style={{
              color: isScrolled ? "#064e3b" : "white",
              padding: "6px 10px",
              borderRadius: 4,
              background: isScrolled ? "rgba(4, 120, 87, 0.06)" : "transparent",
            }}>
              Log In ▾
            </a>
          </div>
        )}
      </div>

      {/* ------------------------ MAIN HEADER ------------------------ */}
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: isScrolled ? (isMobile ? "10px 20px" : "0px 40px")
            : (isMobile ? "12px 20px" : "16px 40px"),
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "padding 0.4s",
        }}
      >
        <img
          src="/ecospare-logo.png"
          style={{
            height: isScrolled ? "80px" : "88px",
            marginTop: "-40px",
            transition: "0.4s",
          }}
        />

        {!isMobile && (
          <nav
            style={{
              display: "flex",
              gap: "40px",
              fontSize: "16px",
              fontWeight: 800,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {Object.keys(menus).map((menu) => (
              <span
                key={menu}
                style={{
                  color: isScrolled ? "#1f2937" : "white",
                  cursor: "pointer",
                  ...underlineStyle,
                }}
                onMouseEnter={() => setActiveMenu(menu)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                {menu}
                {/* underline */}
                <span
                  style={{
                    content: '""',
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    height: "2px",
                    width: activeMenu === menu ? "100%" : "0%",
                    background: isScrolled ? "#064e3b" : "white",
                    transition: "0.3s",
                  }}
                ></span>
              </span>
            ))}

            {/* ⭐ PARTNER WITH US BUTTON */}
            <a
              style={{
                padding: "10px 18px",
                background: "#16a34a",
                color: "white",
                borderRadius: "6px",
                fontWeight: 700,
                cursor: "pointer",
                marginLeft: "10px",
                whiteSpace: "nowrap",
              }}
            >
              Partner With Us
            </a>
          </nav>
        )}
      </div>

      {/* ------------------------ MEGA MENU ------------------------ */}
      {!isMobile && activeMenu && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "white",
            padding: "40px 80px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            display: "flex",
            gap: "60px",
            animation: "fadeDown 0.3s ease-out",
          }}
        >
          {/* LEFT COLUMNS */}
          <div style={{ display: "flex", gap: "60px" }}>
            {menus[activeMenu].cols.map((col, i) => (
              <div key={i}>
                <h3 style={{ fontWeight: 700, marginBottom: 10 }}>{col.head}</h3>
                {col.items.map((txt, idx) => (
                  <p key={idx} style={{ margin: "6px 0", cursor: "pointer", color: "#444" }}>
                    {txt}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* RIGHT IMAGE CARD */}
          <div style={{ width: "350px" }}>
            <img
              src={menus[activeMenu].image}
              style={{
                width: "100%",
                height: "180px",
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />
            <p style={{ marginTop: 10, color: "#444" }}>
              {menus[activeMenu].desc}
            </p>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeDown {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </header>
  );
};

export default MainHeader;
