import { useState, useEffect } from "react";

interface DistanceDisplayProps {
  from: string;
  to: string;
  distance: string;
}

export const DistanceDisplay: React.FC<DistanceDisplayProps> = ({
  from,
  to,
  distance,
}) => {
  const [showFullFrom, setShowFullFrom] = useState(false);
  const [showFullTo, setShowFullTo] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Extract number from distance string (e.g., "15 km" -> 15)
    const distanceValue = parseInt(distance.split(" ")[0]);

    // Calculate progress (assuming max distance is 30km)
    // Lower distance = higher progress
    const maxDistance = 30;
    const calculatedProgress = Math.max(
      0,
      Math.min(100, ((maxDistance - distanceValue) / maxDistance) * 100)
    );
    setProgress(calculatedProgress);
  }, [distance]);

  const FirstThreeWords = (text: string) =>
    text.split(" ").slice(0, 3).join(" ");

  const getProgressColor = () => {
    if (progress >= 75) return "bg-green-500"; // Close to destination
    if (progress >= 40) return "bg-yellow-500"; // Mid-way
    return "bg-red-500"; // Far from destination
  };

  return (
    <div className="flex flex-col items-center space-y-2 w-full max-w-md mx-auto">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-color2/70">
          Distance: {distance}
        </span>
        <span className="text-xs text-color2/60">
          {progress >= 75
            ? "Near destination"
            : progress >= 40
            ? "En route"
            : "Starting journey"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center w-full justify-between space-x-4">
        <div
          className="flex-1 p-2 bg-color2/20 text-color2 text-sm rounded-md cursor-pointer hover:bg-color2/30 transition-colors text-center truncate"
          onClick={() => {
            setShowFullTo(false);
            setShowFullFrom((prev) => !prev);
          }}
          title={from}
        >
          {showFullFrom ? from : FirstThreeWords(from)}
        </div>

        <div className="flex items-center space-x-2">
          <div className="h-[2px] w-12 bg-color2/50" />
          <svg
            className={`w-4 h-4 ${getProgressColor()} transition-colors`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <div className="h-[2px] w-12 bg-color2/50" />
        </div>

        <div
          className="flex-1 p-2 bg-color2/20 text-color2 text-sm rounded-md cursor-pointer hover:bg-color2/30 transition-colors text-center truncate"
          onClick={() => {
            setShowFullFrom(false);
            setShowFullTo((prev) => !prev);
          }}
          title={to}
        >
          {showFullTo ? to : FirstThreeWords(to)}
        </div>
      </div>

      <div className="text-center text-sm text-color1/60">
        {showFullFrom && <div className="mt-2">From: {from}</div>}
        {showFullTo && <div className="mt-2">To: {to}</div>}
      </div>
    </div>
  );
};
