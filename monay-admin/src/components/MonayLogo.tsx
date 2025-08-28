import React from 'react';
import { motion } from 'framer-motion';

interface MonayLogoProps {
  collapsed?: boolean;
  className?: string;
}

const MonayLogo: React.FC<MonayLogoProps> = ({ collapsed = false, className = "" }) => {
  if (collapsed) {
    return (
      <motion.div 
        className={`flex items-center justify-center ${className}`}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative w-10 h-10">
          {/* M Letter with modern design */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-xl">M</span>
          </div>
          {/* Accent dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative">
        {/* Logo Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
          <span className="text-white font-black text-2xl">M</span>
        </div>
        {/* Accent dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg border-2 border-white"></div>
      </div>
      
      {/* Logo Text */}
      <div className="flex flex-col">
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-2xl font-bold leading-none">
          Monay
        </span>
        <span className="text-blue-300/80 text-xs font-medium tracking-wider uppercase">
          Wallet
        </span>
      </div>
    </motion.div>
  );
};

export default MonayLogo;