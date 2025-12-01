import React from "react";

export default function Footer() {
  return (
    // fixed footer: offset from left by sidebar width (w-72), spans to right edge
    <footer className="fixed left-72 right-0 bottom-0 z-40">
      <div className="h-16 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex items-center justify-center px-6 shadow-md">
        <div className="max-w-screen-xl w-full">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Waste Management Portal — All Rights Reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
