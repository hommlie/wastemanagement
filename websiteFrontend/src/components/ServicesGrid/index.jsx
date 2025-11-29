import React from 'react';
import './ServicesGrid.css';

const services = [
  {
    id: 1,
    title: 'Smart Collection',
    subtitle: 'Real-time route optimization and automated scheduling ensure timely, efficient waste collection from your facility.',
    img: '/service1.png',
    points: ['Real-Time Tracking', 'Certified Process', 'Full Documentation']
  },
  {
    id: 2,
    title: 'Segregation & Sorting',
    subtitle: 'Advanced sorting facilities with trained personnel and automated systems ensure waste streams are optimized for maximum recycling and proper disposal.',
    img: '/service2.jpeg',
    points: ['Real-Time Tracking', 'Certified Process', 'Full Documentation']
  },
  {
    id: 3,
    title: 'Processing & Recovery',
    subtitle: 'State-of-the-art recycling plants and composting facilities transform waste into valuable resources with complete environmental compliance.',
    img: '/service3.jpeg',
    points: ['Real-Time Tracking', 'Certified Process', 'Full Documentation']
  },
  {
    id: 4,
    title: 'Documentation & Reporting',
    subtitle: 'Comprehensive digital records, compliance certificates, and monthly sustainability reports provide complete transparency and audit trails.',
    img: '/service4.jpeg',
    points: ['Real-Time Tracking', 'Certified Process', 'Full Documentation']
  }
];

const ServicesGrid = () => {
  return (
    <section className="w-full bg-white py-20 md:py-24 lg:py-32 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {services.map((service, idx) => {
          const isReversed = idx % 2 === 1; 
          return (
            <article key={service.id} className={`service-card ${isReversed ? 'reversed' : ''} mb-16 lg:mb-24`}>
              <div className="img-col">
                <div className="service-img-wrap relative w-full shadow-lg rounded-xl overflow-hidden">
                  <img src={service.img} alt={service.title} className="w-full object-cover h-96 transition-transform duration-300" />
                  <div className="service-badge">{service.id}</div>
                </div>
              </div>

              <div className="content-col">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-700 text-white font-bold text-base mb-4">{service.id}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed mb-5">{service.subtitle}</p>
                <ul className="flex flex-wrap gap-2">
                  {service.points.map((point, i) => (
                    <li key={i} className="point-chip flex items-center gap-2 bg-emerald-50 text-emerald-900 px-4 py-2 rounded-full text-sm border border-emerald-200">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                        <path d="M20 6L9 17L4 12" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesGrid;
