"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiCheckCircle } from "react-icons/hi";

export default function LandingPage() {
  const features = [
    "Procure to Pay – Streamline your procurement and payment processes.",
    "Inventory – Real-time inventory tracking and alerts.",
    "Order to Cash – Manage your sales cycle from order to cash.",
    "Production – Optimize your production processes for better efficiency.",
    "CRM – Enhance customer relationships and support.",
    "Reports – Insightful reports for better decision making.",
  ];

  // Framer motion variants for text animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      }
    },
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        type: "spring",
        damping: 15,
      }
    },
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        delay: 1.5,
      }
    },
  };

  return (
    <main className="relative min-h-screen flex flex-col justify-between items-center bg-gradient-to-b from-white via-blue-50 to-amber-200 text-gray-800 px-4 sm:px-6 py-6 overflow-hidden">
      
      {/* Cloud Overlays - White/Orange soft clouds */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-200/30 via-transparent to-white/50 pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-64 h-32 bg-white/50 rounded-full blur-3xl"></div>
      <div className="absolute top-40 right-20 w-80 h-40 bg-white/40 rounded-full blur-3xl"></div>
      <div className="absolute top-60 left-1/4 w-96 h-48 bg-amber-200/20 rounded-full blur-3xl"></div>
      
      {/* Sun Glow - Half sun at bottom */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[300px] sm:w-[800px] sm:h-[400px] md:w-[1100px] md:h-[550px] rounded-t-full bg-gradient-to-t from-orange-300 via-amber-300 to-yellow-200 opacity-50 blur-3xl"></div>
      
      {/* Sun Middle Layer */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[450px] h-[225px] sm:w-[600px] sm:h-[300px] md:w-[800px] md:h-[400px] rounded-t-full bg-gradient-to-t from-amber-400 via-orange-300 to-yellow-200 opacity-70 blur-2xl"></div>
      
      {/* Sun Core - Bright Orange/Yellow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[300px] h-[150px] sm:w-[400px] sm:h-[200px] md:w-[550px] md:h-[275px] rounded-t-full bg-gradient-to-t from-orange-300 via-yellow-300 to-yellow-100 opacity-85 blur-xl"></div>
      
      {/* Sun Center - Bright Yellow/White */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[180px] h-[90px] sm:w-[250px] sm:h-[125px] md:w-[350px] md:h-[175px] rounded-t-full bg-gradient-to-t from-yellow-200 via-yellow-100 to-white blur-lg"></div>
      
      {/* Sun Highlight - Pure White hot center */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[100px] h-[50px] sm:w-[150px] sm:h-[75px] md:w-[200px] md:h-[100px] rounded-t-full bg-white/90 blur-md"></div>

      {/* Sun Rays */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[500px] h-[300px] sm:w-[700px] sm:h-[400px] md:w-[900px] md:h-[500px] bg-gradient-to-t from-yellow-200/40 via-orange-100/20 to-transparent blur-2xl pointer-events-none"></div>
      
      {/* Golden Hour Light Overlay - Subtle */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 via-yellow-200/5 to-transparent pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center w-full">
        <div className="relative w-full flex justify-center items-center mb-6">
          <img src="/aits_pig.png" alt="ERP Dashboard" className="h-20 sm:h-28 md:h-36 w-auto drop-shadow-2xl" />
          <img src="/aits_logo.png" alt="AITS ERP Logo" className="absolute right-2 top-0 h-20 sm:h-28 md:h-36 w-auto drop-shadow-2xl" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-5xl font-bold text-center mb-3 text-amber-800 drop-shadow-lg"
        >
          Welcome to <span className="text-amber-600 drop-shadow-md">Jaya Global Logistics</span>
        </motion.h1>
        
        {/* Description - Clean white text */}
        <motion.p
          variants={descriptionVariants}
          initial="hidden"
          animate="show"
          className="text-center text-sm sm:text-base md:text-lg max-w-2xl text-gray-700 drop-shadow-sm"
        >
          Manage your sales, purchases, inventory, and business operations from
          one centralized, modern ERP platform.
        </motion.p>
      </header>

      {/* Actions & Features */}
      <div className="relative z-10 flex flex-col items-center gap-6 mt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signin"
            className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition text-center shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 border-2 border-amber-500 text-amber-600 rounded-xl hover:bg-amber-50 transition text-center shadow-xl hover:shadow-lg"
          >
            Company Registration
          </Link>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-amber-800 drop-shadow-sm">
          Key Features
        </h2>
        
        {/* Features - Clean text */}
        <motion.ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {features.map((text, idx) => (
            <motion.li
              key={idx}
              className="flex items-start gap-2 text-sm sm:text-base text-gray-700 drop-shadow-sm"
              variants={itemVariants}
            >
              <HiCheckCircle className="text-amber-500 mt-0.5 shrink-0" />
              <span>{text}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Footer - Clean text */}
      <motion.footer
        variants={footerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center text-xs sm:text-sm text-gray-600 mt-6 drop-shadow-sm"
      >
        &copy; 2025 AITS ERP. All rights reserved.
      </motion.footer>
    </main>
  );
}
// "use client";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { HiCheckCircle } from "react-icons/hi";

// export default function LandingPage() {
//   const features = [
//     "Procure to Pay – Streamline your procurement and payment processes.",
//     "Inventory – Real‑time inventory tracking and alerts.",
//     "Order to Cash – Manage your sales cycle from order to cash.",
//     "Production – Optimize your production processes for better efficiency.",
//     "CRM – Enhance customer relationships and support.",
//     "Reports – Insightful reports for better decision making.",
//   ];

//   /* ✨ Framer‑motion variants for staggered reveal */
//   const listVariants = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: { staggerChildren: 0.15 },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     show: { opacity: 1, y: 0 },
//   };

//   return (
//     <main className="h-screen overflow-hidden flex flex-col justify-between items-center bg-gradient-to-br from-gray-500 via-white to-amber-400 text-gray-800 p-6">
//       {/* Header */}
//       <header className="flex flex-col items-center w-full">
//         {/* Logos — one centered, one fixed to the right edge */}
//         <div className="relative w-full h-36 mb-4">
//           {/* Center logo */}
//           <img
//             src="/aits_pig.png"
//             alt="ERP Dashboard"
//             className="absolute left-1/2 -translate-x-1/2 h-full w-auto"
//           />
          
//           {/* Right‑corner logo (flush with viewport edge) */}
//           <img
//             src="/aits_logo.png"
//             alt="AITS ERP Logo"
//             className="absolute right-0 h-72 w-auto p-6"
//           />
//         </div>

//         <motion.h1
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-4xl md:text-5xl font-bold text-center mb-3 text-neutral-700"
//         >
//           Welcome to <span className="text-amber-500">AITS ERP</span>
//         </motion.h1>
//         <p className="text-center text-base md:text-lg max-w-2xl">
//           Manage your sales, purchases, inventory, and business operations from one centralized, modern ERP platform.
//         </p>
//       </header>

//       {/* Actions & Features */}
//       <div className="flex flex-col items-center gap-6">
//         {/* Buttons */}
//         <div className="flex gap-4">
//           <Link
//             href="/signin"
//             className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition"
//           >
//             Sign In
//           </Link>
//           <Link
//             href="/signup"
//             className="px-6 py-3 border border-amber-500 text-amber-500 rounded-xl hover:bg-indigo-50 transition"
//           >
//             Company Registration
//           </Link>
//         </div>

//         {/* Animated checklist */}
//         <h2 className="text-2xl font-bold text-neutral-700">Key Features</h2>
//         <motion.ul
//           className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-4xl"
//           variants={listVariants}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true }}
//         >
//           {features.map((text, idx) => (
//             <motion.li
//               key={idx}
//               className="flex items-start gap-2 text-sm md:text-base"
//               variants={itemVariants}
//             >
//               <HiCheckCircle className="text-amber-500 mt-0.5" />
//               <span>{text}</span>
//             </motion.li>
//           ))}
//         </motion.ul>
//       </div>

//       {/* Footer */}
//       <footer className="text-center text-xs md:text-sm text-gray-600">
//         &copy; 2025 AITS ERP. All rights reserved.
//       </footer>
//     </main>
//   );
// }

