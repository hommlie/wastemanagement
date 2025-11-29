import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
// import DownloadHommlieApp from '../DownloadHommlieApp';

const tasks = [
  { title: 'Pest Control', image: '/images/pest-control.webp', link: '/category/pest-control-services' },
  { title: 'Deep Cleaning', image: '/images/deep-cleaning.webp', link: '/category/cleaning-services' },
  { title: 'Mosquito & Safety Net', image: '/images/mosquito-mesh.webp', link: '/services/laundry' },
  { title: 'Disinfection', image: '/images/disinfectionsnap.webp', link: '/subcategory/disinfection-services-near-you-in-bangalore' },
  { title: 'Scrap', image: '/images/scrapsnap.webp', link: '/services/kitchen-prep' },
  { title: 'AC Services', image: '/images/ac-services.webp', link: '/services/window-cleaning' },
  { title: 'Plumbing', image: '/images/bird-netting.webp', link: '/services/bathroom-cleaning' },
];

export default function QuickHeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const duplicatedTasks = [...tasks, ...tasks];

  const [phoneRef, phoneInView] = useInView({ threshold: 0.3 });
  const [cardsRef, cardsInView] = useInView({ threshold: 0.2 });

  const phoneScale = useTransform(scrollYProgress, [0, 0.4], [1.3, 1]);
  const phoneY = useTransform(scrollYProgress, [0, 0.4], ['20%', '104%']);

  return (
    <div ref={containerRef} className="hidden sm:block relative overflow-hidden mr-2 bg-white" >
      {/* Hero Section */}
      <section className="relative pb-12 text-center overflow-hidden" >
        <div className="text-center relative py-2">
          {/* Sparkles */}
          <div className="absolute top-4 left-4 text-[#133215] text-5xl animate-pulse">✦</div>
          <div className="absolute top-4 right-4 text-[#133215] text-5xl animate-pulse">✦</div>
          <div className="absolute bottom-4 left-1/3 text-[#133215] text-3xl animate-pulse">✦</div>
          <div className="absolute bottom-4 right-1/3 text-[#133215] text-3xl animate-pulse">✦</div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2a0014] leading-tight mb-3 uppercase">
            INDIA'S FIRST <br />
          </h2>

          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2a0014] leading-tight mb-3 uppercase">
            <span className="text-3xl md:text-5xl italic font-extrabold text-[#92B775] leading-tight mb-4 uppercase">
              HOME
            </span>{' '}
            SERVICE APP
          </h2>

          {/* Subtext */}
          <p className="text-sm md:text-base text-[#133215] font-medium mt-2 mb-3">
            On-demand home services to empower <br /> urban households
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-16">
          <a href="https://play.google.com/store/apps/details?id=com.hommlie.user&pcampaignid=web_share">
            <img src="/playstore.svg" alt="Download on Google Play" className="h-10 md:h-12" />
          </a>
          <a href="https://apps.apple.com/in/app/hommile/id6744694127">
            <img src="/appstore.svg" alt="Download on App Store" className="h-10 md:h-12" />
          </a>
        </div>

        <div className="flex justify-center items-end gap-8 md:gap-36 z-10 relative">
          <img src="/images/image3.webp" alt="" className="h-[240px] md:h-[320px] object-contain mr-20" />
          <img src="/images/image1.webp" alt="" className="h-[240px] md:h-[320px] object-contain ml-20" />
        </div>
      </section>

      {/* Phone Mockup */}
      <motion.div
        ref={phoneRef}
        className="absolute top-[24%] left-[39%] transform -translate-x-1/2 z-10 w-[260px] h-[500px]"
        style={{ scale: phoneScale, y: phoneY }}
      >
        <div className="rounded-[40px] shadow-2xl border-8 border-black bg-[#F3E8D3] relative overflow-hidden">
          <div className="w-20 h-4 rounded-full bg-black mt-2 mb-2 mx-auto"></div>
          <div className="flex flex-col items-center justify-center space-y-0 h-[420px]">
            {/* Hommlie Logo */}
            <img
              src="/ecospare-logo.png"
              alt="Hommlie Logo"
              className="w-40 -mt-20 h-auto"
            />

            {/* QR Code */}
            <img
              src="/assets/logo/qr.png"
              alt="Scan to download Hommlie App"
              className="w-40 h-auto ml-1"
            />
          </div>
        </div>
      </motion.div>

      {/* Scrolling Cards Section */}
      <section
        ref={cardsRef}
        className="text-black min-h-[650px] pt-[15px] pb-[120px] relative z-0"
        
      >
        <div className="flex flex-col items-center px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2a0014] leading-tight mb-3">
            Instant Home Services, <br />
          </h2>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2a0014] leading-tight mb-3">
            <span className="text-3xl md:text-5xl italic font-extrabold text-[#92b876] leading-tight mb-4">
              Right at Your Doorstep
            </span>{' '}
          </h2>
          <motion.p
            className="text-xl text-[#483fa1] mt-4 mb-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: cardsInView ? 1 : 0, y: cardsInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          {/* Scroll Track positioned above phone */}
          <div className="w-full max-w-6xl mx-auto relative h-[320px] overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" />

            <motion.div
              className="flex absolute top-0 left-1/2 -translate-x-1/2 h-full items-center"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {duplicatedTasks.map((task, index) => {
                const delay = (index % tasks.length) * 0.2;
                return (
                  <a
                    key={`${task.title}-${index}`}
                    href={task.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-48 h-64 flex-shrink-0 mx-6 group"
                  >
                    <motion.div
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: 'mirror',
                        delay,
                        ease: 'easeInOut',
                      }}
                      className="h-full"
                    >
                      <div className="bg-white text-black rounded-xl overflow-hidden shadow-lg flex flex-col border-2 border-transparent group-hover:border-[#F3E8D3] transition-all duration-300 h-full">
                        <div className="h-40 bg-gray-100 overflow-hidden relative">
                          <img
                            src={task.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4 text-center font-medium bg-white group-hover:bg-[#F3E8D3] group-hover:text-black flex-1 flex items-center justify-center transition-all duration-300">
                          {task.title}
                        </div>
                      </div>
                    </motion.div>
                  </a>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
