import React from "react";

const CaseStudies = () => {
  const cases = [
    {
      image: "/hero-bg.jpeg",
      tag: "Technology Campus",
      title: "TechHub IT Park",
      challenge:
        "Managing 15 tons of daily waste from 50+ companies with zero documentation and compliance issues.",
      solution:
        "Implemented segregated collection system with real-time tracking and monthly compliance reporting.",
      results: [
        "85% waste diverted from landfills",
        "100% compliance achieved",
        "₹2.5L annual cost savings",
      ],
    },
    {
      image: "/hero-bg.jpeg",
      tag: "Residential Complex",
      title: "Green Valley Apartments",
      challenge:
        "Inconsistent waste collection causing resident complaints and municipal violations.",
      solution:
        "Deployed GPS-tracked vehicles with scheduled pickups and resident education program.",
      results: [
        "Zero missed collections",
        "70% resident satisfaction increase",
        "Municipal compliance restored",
      ],
    },
    {
      image: "/hero-bg.jpeg",
      tag: "Healthcare Facility",
      title: "City Hospital Network",
      challenge:
        "Critical need for certified biomedical waste handling with complete audit trails.",
      solution:
        "Specialized biomedical waste management with color-coded segregation and digital documentation.",
      results: [
        "100% regulatory compliance",
        "Zero safety incidents",
        "Complete audit trail maintained",
      ],
    },
  ];

  return (
    <section className="py-6 px-6 bg-[#ffffff] -mt-32">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-4xl font-bold text-[#1e293b]">
          Measurable Environmental Impact
        </h2>
        <p className="text-gray-500 mt-3">
          Real success stories from businesses that transformed their waste management
          with EcoSphere's technology-driven solutions.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {cases.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-52 object-cover"
              />

              {/* Label */}
              <span className="absolute top-4 left-4 bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-md">
                {item.tag}
              </span>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>

              {/* Challenge */}
              <div className="mt-4">
                <p className="text-red-500 font-semibold">🔴 Challenge</p>
                <p className="text-gray-600 text-sm mt-1">{item.challenge}</p>
              </div>

              {/* Solution */}
              <div className="mt-4">
                <p className="text-yellow-600 font-semibold">💡 Solution</p>
                <p className="text-gray-600 text-sm mt-1">{item.solution}</p>
              </div>

              {/* Divider */}
              <hr className="my-4" />

              {/* Key Results */}
              <div>
                <p className="text-green-700 font-semibold mb-2">📊 Key Results</p>
                <ul className="space-y-1">
                  {item.results.map((r, i) => (
                    <li key={i} className="text-gray-700 text-sm flex items-center gap-2">
                      <span className="text-green-500 text-lg">✔</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CaseStudies;
