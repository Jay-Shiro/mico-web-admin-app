import { useEffect, useRef, useState } from "react";
import { DeliveryType } from "./deliveryType";
import { Loader } from "@googlemaps/js-api-loader";

interface DeliveryMapProps {
  deliveries: DeliveryType[];
  onDeliveryClick?: (delivery: DeliveryType) => void;
  trackingDeliveryId?: string | null; // Add this prop
}

interface LocationData {
  latitude: number;
  longitude: number;
  last_updated: string;
  eta_minutes: number | null;
  eta_time: string | null;
}

const DeliveryMap = ({
  deliveries,
  onDeliveryClick,
  trackingDeliveryId,
}: DeliveryMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInfoWindow, setActiveInfoWindow] =
    useState<google.maps.InfoWindow | null>(null);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 6.5244, lng: 3.3792 }, // Default to Lagos, Nigeria
          zoom: 10,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          zoomControl: true,
          zoomControlOptions: {
            position:
              window.innerWidth < 768
                ? google.maps.ControlPosition.RIGHT_BOTTOM
                : google.maps.ControlPosition.RIGHT_CENTER,
          },
          streetViewControl: false, // Disable street view
          mapTypeControl: false, // Disable map type control on mobile
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
          },
          gestureHandling: "greedy", // Allows one-finger zooming on mobile
        });
        setMap(map);
        setLoading(false);

        // Add resize listener to adjust control positions
        const resizeListener = () => {
          map.setOptions({
            zoomControlOptions: {
              position:
                window.innerWidth < 768
                  ? google.maps.ControlPosition.RIGHT_BOTTOM
                  : google.maps.ControlPosition.RIGHT_CENTER,
            },
          });
        };
        window.addEventListener("resize", resizeListener);
        return () => window.removeEventListener("resize", resizeListener);
      }
    });
  }, []);

  const focusDelivery = (delivery: DeliveryType, location: LocationData) => {
    if (!map) return;

    const position = { lat: location.latitude, lng: location.longitude };
    map.panTo(position);
    map.setZoom(15);

    if (activeInfoWindow) {
      activeInfoWindow.close();
    }

    markers.forEach((marker) => {
      if (marker.get("deliveryId") === delivery._id) {
        google.maps.event.trigger(marker, "click");
      }
    });

    setSelectedDeliveryId(delivery._id);
  };

  useEffect(() => {
    if (!map || !deliveries.length) return;

    markers.forEach((marker) => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    const fetchLocations = async () => {
      for (const delivery of deliveries) {
        try {
          const response = await fetch(
            `/api/deliveries/${delivery._id}/rider-location`
          );
          const data = await response.json();

          // Skip if not tracking all deliveries and this isn't the tracked one
          if (trackingDeliveryId && delivery._id !== trackingDeliveryId) {
            continue;
          }

          if (response.status === 404) continue;
          if (!response.ok || !data.location_data) continue;

          const location: LocationData = data.location_data;
          const position = { lat: location.latitude, lng: location.longitude };

          const marker = new google.maps.Marker({
            position,
            map,
            title: `${delivery.status.current} - ${delivery._id}`,
            icon: {
              url:
                delivery.status.current.toLowerCase() === "completed"
                  ? "/images/markers/marker-green.svg"
                  : delivery.status.current.toLowerCase() === "inprogress"
                  ? "/images/markers/marker-yellow.svg"
                  : "/images/markers/marker-red.svg",
              scaledSize: new google.maps.Size(30, 30),
            },
          });

          marker.set("deliveryId", delivery._id);

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-3 md:p-4 max-w-[280px] md:max-w-xs">
                <h3 class="font-bold text-sm md:text-base mb-2">Delivery #${delivery._id.slice(
                  -4
                )}</h3>
                <div class="text-xs md:text-sm space-y-1">
                  <p><strong>Status:</strong> <span class="ml-1">${
                    delivery.status.current
                  }</span></p>
                  <p><strong>From:</strong> <span class="ml-1 break-words">${
                    delivery.startpoint
                  }</span></p>
                  <p><strong>To:</strong> <span class="ml-1 break-words">${
                    delivery.endpoint
                  }</span></p>
                  <p><strong>Last Update:</strong> <span class="ml-1">${new Date(
                    location.last_updated
                  ).toLocaleString()}</span></p>
                  ${
                    location.eta_time
                      ? `<p><strong>ETA:</strong> <span class="ml-1">${location.eta_time}</span></p>`
                      : ""
                  }
                </div>
                ${
                  delivery.rider
                    ? `
                  <div class="mt-2 md:mt-3 pt-2 md:pt-3 border-t">
                    <p class="font-semibold text-xs md:text-sm">Rider Information</p>
                    <p class="text-xs md:text-sm">${delivery.rider.firstname} ${delivery.rider.lastname}</p>
                    <p class="text-xs md:text-sm">${delivery.rider.phone}</p>
                  </div>
                `
                    : ""
                }
              </div>
            `,
            maxWidth: window.innerWidth < 768 ? 280 : 320,
          });

          marker.addListener("click", () => {
            if (activeInfoWindow) {
              activeInfoWindow.close();
            }
            infoWindow.open(map, marker);
            setActiveInfoWindow(infoWindow);
            setSelectedDeliveryId(delivery._id);
            onDeliveryClick?.(delivery);
          });

          bounds.extend(position);
          newMarkers.push(marker);

          // If this is the tracked delivery, focus on it
          if (delivery._id === trackingDeliveryId) {
            focusDelivery(delivery, location);
          }
        } catch (error) {
          console.error(
            `Error fetching location for delivery ${delivery._id}:`,
            error
          );
        }
      }

      // Only fit bounds if not tracking a specific delivery
      if (newMarkers.length > 0 && !trackingDeliveryId) {
        map.fitBounds(bounds);
      }
    };

    fetchLocations();
    setMarkers(newMarkers);

    const intervalId = setInterval(fetchLocations, 30000);
    return () => {
      clearInterval(intervalId);
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [map, deliveries, selectedDeliveryId, trackingDeliveryId]);

  return (
    <div className="relative w-full h-[50vh] md:h-[400px] bg-gray-100 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="animate-pulse text-base md:text-lg text-gray-500">
            Loading map...
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;
