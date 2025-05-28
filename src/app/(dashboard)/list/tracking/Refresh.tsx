import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";

type RefreshProps = {
  onRefresh: () => void;
};

export const Refresh: React.FC<RefreshProps> = ({ onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [pullDelta, setPullDelta] = useState(0);

  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    setTimeout(() => {
      onRefresh();
      setIsRefreshing(false);
      setPullDelta(0);
    }, 1500);
  }, [isRefreshing, onRefresh]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchStartY(e.touches[0].screenY);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (window.scrollY > 0) return;

      const touchY = e.touches[0].screenY;
      const delta = touchY - touchStartY;

      if (delta > 0) {
        setPullDelta(Math.min(delta, 150));

        if (delta > 100 && !isRefreshing) {
          handleRefresh();
        }
      }
    },
    [touchStartY, isRefreshing, handleRefresh]
  );

  const handleTouchEnd = useCallback(() => {
    setPullDelta(0);
    setTouchStartY(0);
  }, []);

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Refresh Anim */}

      {/* MOBILE */}
      <motion.div
        className="md:hidden"
        animate={{ y: pullDelta }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center justify-center gap-2">
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 0 24 24"
            animate={{ rotate: isRefreshing ? 360 : pullDelta > 0 ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path
              fill="currentColor"
              d="M17 13l-4 4m0 0l-4-4m4 4V3m5 4H6.2c-1.15 0-2.08.93-2.08 2.07 0 1.09.88 1.98 1.98 1.98H19"
            />
          </motion.svg>
          <span className="text-sm text-gray-400">
            {pullDelta > 50 ? "Release to refresh" : "Pull to refresh"}
          </span>
        </div>
      </motion.div>

      {/* Desktop Refresh */}
      <motion.button
        onClick={handleRefresh}
        className="hidden items-center gap-2 px-4 py-2 text-color1/40 transition-colors hover:text-color1/60 md:flex"
        animate={{ opacity: isRefreshing ? 0 : 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiRefreshCw className="text-lg" />
        Refresh
      </motion.button>

      {/* Animate Loading Indicator */}

      <AnimatePresence>
        {isRefreshing ? (
          <motion.div
            key="loading-indication"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1"
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="h-2 w-2 bg-color1/60 rounded-sm"
                animate={{
                  y: [-5, 5, -5, 5],
                  backgroundColor: ["#f1f1f1", "#9CA3AF", "#3B82F6", "#9CA3AF"],
                }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
