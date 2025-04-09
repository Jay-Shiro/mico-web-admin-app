import { useEffect, useRef } from "react";
import { DeliveryType } from "./deliveryType";
import { MapIcon } from "lucide-react";

interface DeliveryMapProps {
  deliveries: DeliveryType[];
}

const DeliveryMap = ({ deliveries }: DeliveryMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is a placeholder for where you would initialize a map library
    // like Google Maps, Mapbox, Leaflet, etc.
    if (mapRef.current) {
      // For now, we're just rendering a placeholder
      const mapPlaceholder = document.createElement("div");
      mapPlaceholder.className =
        "flex items-center justify-center h-full bg-blue-50 rounded-lg";
      mapPlaceholder.innerHTML = `
        <div class="text-center p-6">
          <div class="bg-blue-100 p-3 rounded-full inline-block mb-3">
            <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-blue-800 mb-2">Interactive Delivery Map</h3>
          <p class="text-blue-600">Showing ${deliveries.length} active deliveries</p>
          <div class="mt-4 grid grid-cols-3 gap-3">
            <div class="bg-white p-2 rounded-md shadow-sm flex items-center justify-center">
              <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span class="text-xs">Completed</span>
            </div>
            <div class="bg-white p-2 rounded-md shadow-sm flex items-center justify-center">
              <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              <span class="text-xs">In Progress</span>
            </div>
            <div class="bg-white p-2 rounded-md shadow-sm flex items-center justify-center">
              <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span class="text-xs">Pending</span>
            </div>
          </div>
        </div>
      `;

      // Clear any existing content and append the placeholder
      mapRef.current.innerHTML = "";
      mapRef.current.appendChild(mapPlaceholder);
    }

    // Clean up function would remove map instance
    return () => {
      if (mapRef.current) {
        // Clean up map resources
      }
    };
  }, [deliveries]);

  return (
    <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full"></div>
      {/* Overlay controls that would typically be used with a real map */}
      <div className="absolute top-3 right-3 bg-white rounded-lg shadow-md p-2 flex space-x-2">
        <button className="p-1 hover:bg-gray-100 rounded">
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <button className="p-1 hover:bg-gray-100 rounded">
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DeliveryMap;
