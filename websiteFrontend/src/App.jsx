import React from "react";
import MainHeader from "./components/MainHeader";
import HomeScreen from "./components/HomeScreen";
import ServicesGrid from "./components/ServicesGrid";
import WasteStreams from "./components/WasteStreams";
import Footer from "./components/Footer";
import Advertisement from "./components/Advertisement"
import CaseStudies from "./components/CaseStudies";
import Certifications from "./components/Certifications";

function App() {
  return (
    <div className="relative min-h-screen">
      <MainHeader />
      <main style={{ paddingTop: "0px" }}>
        <HomeScreen />
        <Advertisement />
        <ServicesGrid />
        <CaseStudies />
        <Certifications />
        <WasteStreams />
        <Footer />
      </main>
    </div>
  );
}

export default App;
