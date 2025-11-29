import React from "react";
import MainHeader from "./components/MainHeader";
import HomeScreen from "./components/HomeScreen";
import ServicesGrid from "./components/ServicesGrid";
import WasteStreams from "./components/WasteStreams";
import Footer from "./components/Footer";
import Advertisement from "./components/Advertisement"

function App() {
  return (
    <div className="relative min-h-screen">
      <MainHeader />
      <main style={{ paddingTop: "0px" }}>
        <HomeScreen />
        <Advertisement />
        <ServicesGrid />
        <WasteStreams />
        <Footer />
      </main>
    </div>
  );
}

export default App;
