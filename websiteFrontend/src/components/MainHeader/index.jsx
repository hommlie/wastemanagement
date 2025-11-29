import React, { useEffect, useState } from "react";

const MainHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 50,
        backgroundColor: isScrolled ? "white" : "transparent",
        boxShadow: isScrolled ? "0 2px 12px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.4s ease-in-out",
        borderBottom: isScrolled ? "1px solid #f0f0f0" : "none"
      }}
    >

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
          background: "transparent",
          transition: "color 0.3s",
          marginLeft: "20px"
        }}
      >
        <div style={{ display: "flex", gap: 20, alignItems: "flex-end", marginLeft: "500px", marginTop: "14px" }}>
          <a href="#support" style={{ color: isScrolled ? "#064e3b" : "white", textDecoration: "none" }}>Support</a>
          <a href="#schedule" style={{ color: isScrolled ? "#064e3b" : "white", textDecoration: "none" }}>Schedule & ETA</a>
          <a href="#payment" style={{ color: isScrolled ? "#064e3b" : "white", textDecoration: "none" }}>Make a Payment</a>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 15, alignItems: "center", marginTop: "14px" }}>
            <a href="#dropoff" style={{ color: isScrolled ? "#064e3b" : "white", textDecoration: "none" }}>Drop-Off Locations</a>
            <a href="#login" style={{ color: isScrolled ? "#064e3b" : "white", textDecoration: "none", padding: "6px 10px", borderRadius: 4, background: isScrolled ? "rgba(4, 120, 87, 0.06)" : "transparent" }}>Log In ▾</a>
          </div>
        )}

      </div>

      <div 
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: isScrolled ? (isMobile ? "10px 20px" : "0px 40px") : (isMobile ? "12px 20px" : "16px 40px"),
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "padding 0.4s ease-in-out"
        }}
      >

        <div style={{ flexShrink: 0 }}>
          <img 
            src="/ecospare-logo.png" 
            alt="Ecosphere Logo"
            style={{ 
              height: isScrolled ? "80px" : "88px", 
              width: "auto",
              transition: "height 0.4s ease-in-out",
              filter: !isScrolled ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" : "none",
              marginTop: "-40px"
            }}
          />
        </div>

        {!isMobile && (
          <nav 
            style={{
              display: "flex",
              gap: "40px",
              fontSize: "16px",
              fontWeight: 800,
              alignItems: "center",
              flex: 1,
              justifyContent: "center",
              transition: "color 0.3s"
            }}
          >
            <a href="#residential" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", transition: "color 0.3s" }}>
              Bulk Trash
            </a>
            <a href="#commercial" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", transition: "color 0.3s" }}>
              Commercial
            </a>
            <a href="#environmental" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", transition: "color 0.3s" }}>
              Environmental Solutions
            </a>
            <a href="#healthcare" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", transition: "color 0.3s" }}>
              Healthcare
            </a>
            <a href="#sustainability" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", transition: "color 0.3s" }}>
              Sustainability
            </a>
            <a href="#about" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", transition: "color 0.3s" }}>
              About Us
            </a>
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>

          <button style={{ background: "none", border: "none", color: isScrolled ? "#064e3b" : "white", cursor: "pointer", padding: 0, transition: "color 0.3s" }} aria-label="Search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ 
              display: isMobile ? "block" : "none",
              background: "none", 
              border: "none", 
              color: isScrolled ? "#1f2937" : "white", 
              cursor: "pointer",
              padding: "8px",
              transition: "color 0.3s"
            }}
            aria-label="Menu"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav 
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: isScrolled ? "white" : "rgba(0,0,0,0.95)",
            borderTop: isScrolled ? "1px solid #f0f0f0" : "1px solid rgba(229, 231, 235, 0.2)",
            padding: "16px 40px",
            gap: "12px"
          }}
        >
          <a href="#residential" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", padding: "10px 0", fontSize: "14px", fontWeight: "600" }}>
            Residential
          </a>
          <a href="#commercial" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", padding: "10px 0", fontSize: "14px", fontWeight: "600" }}>
            Commercial
          </a>
          <a href="#environmental" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", padding: "10px 0", fontSize: "14px", fontWeight: "600" }}>
            Environmental Solutions
          </a>
          <a href="#healthcare" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", padding: "10px 0", fontSize: "14px", fontWeight: "600" }}>
            Healthcare
          </a>
          <a href="#sustainability" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", padding: "10px 0", fontSize: "14px", fontWeight: "600" }}>
            Sustainability
          </a>
          <a href="#about" style={{ color: isScrolled ? "#1f2937" : "white", textDecoration: "none", padding: "10px 0", fontSize: "14px", fontWeight: "600" }}>
            About Us
          </a>
        </nav>
      )}
    </header>
  );
};

export default MainHeader;
