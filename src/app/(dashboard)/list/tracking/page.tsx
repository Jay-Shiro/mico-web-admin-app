"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
// import { deliveriesData } from "@/lib/data";
import {
  Eye,
  Search,
  Download,
  Filter,
  MapPin,
  Clock,
  Package,
  TrendingUp,
  Truck,
  Calendar,
  BarChart2,
  X,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { DetailsModal } from "./DetailsModal";
import { DeliveryType } from "./deliveryType";
import { Rider } from "@/app/(dashboard)/list/riders/riderType";
import { exportAllDeliveriesToCSV } from "@/lib/exportCSV";
import {
  FaMotorcycle,
  FaCar,
  FaMapMarkerAlt,
  FaRoute,
  FaExclamationTriangle,
} from "react-icons/fa";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Dynamic import for the map component to prevent SSR issues
const DeliveryMap = dynamic(() => import("./DeliveryMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center">
      Loading map...
    </div>
  ),
});

const DeliveriesListPage = () => {
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryType | null>(
    null
  );
  const [searchInput, setSearchInput] = useState<string>("");
  const [ridersData, setRidersData] = useState<Rider[]>([]);
  const [deliveriesData, setDeliveriesData] = useState<DeliveryType[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"list" | "map" | "analytics">(
    "list"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [trackingDeliveryId, setTrackingDeliveryId] = useState<string | null>(
    null
  );
  const [trackableDeliveries, setTrackableDeliveries] = useState<Set<string>>(
    new Set()
  );

  // Fetch deliveries data from API
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/deliveries", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch deliveries data");

      const data = await response.json();
      if (data.status === "success") {
        setDeliveriesData(data.deliveries);
        setFilteredDeliveries(data.deliveries); // Set directly without filters
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      setError(
        "Failed to load deliveries. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics for dashboard
  const metrics = useMemo(() => {
    const total = filteredDeliveries.length;
    const completed = filteredDeliveries.filter(
      (d) => d.status.current.toLowerCase() === "completed"
    ).length;
    const inProgress = filteredDeliveries.filter(
      (d) => d.status.current.toLowerCase() === "inprogress"
    ).length;
    const pending = filteredDeliveries.filter(
      (d) => d.status.current.toLowerCase() === "pending"
    ).length;
    const ongoing = filteredDeliveries.filter(
      (d) => d.status.current.toLowerCase() === "ongoing"
    ).length;
    const bikes = filteredDeliveries.filter(
      (d) => d.vehicletype.toLowerCase() === "bike"
    ).length;
    const cars = filteredDeliveries.filter(
      (d) => d.vehicletype.toLowerCase() === "car"
    ).length;

    return { total, completed, inProgress, pending, ongoing, bikes, cars };
  }, [filteredDeliveries]);

  const applyFilters = useCallback(() => {
    let filtered = [...deliveriesData];

    // Date range filter
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((delivery) => {
        const deliveryDate = new Date(
          delivery.last_updated || delivery.transaction_info.last_updated
        );
        return deliveryDate >= fromDate && deliveryDate <= toDate;
      });
    }

    // Search filter with date support
    if (searchInput) {
      filtered = filtered.filter((delivery) => {
        const searchDate =
          delivery.last_updated || delivery.transaction_info.last_updated;
        const formattedDate = new Date(searchDate).toLocaleDateString();
        const searchString =
          `${delivery._id} ${delivery.vehicletype} ${delivery.packagesize} ${delivery.startpoint} ${delivery.distance} ${delivery.status.current} ${delivery.endpoint} ${formattedDate}`.toLowerCase();

        return searchString.includes(searchInput.toLowerCase());
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (delivery) =>
          delivery.status.current.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Vehicle filter
    if (vehicleFilter !== "all") {
      filtered = filtered.filter(
        (delivery) =>
          delivery.vehicletype.toLowerCase() === vehicleFilter.toLowerCase()
      );
    }

    setFilteredDeliveries(filtered);
  }, [deliveriesData, searchInput, statusFilter, vehicleFilter, dateRange]);

  useEffect(() => {
    applyFilters();
  }, [searchInput, statusFilter, vehicleFilter, dateRange, applyFilters]);

  // fetch riders data from API
  const fetchRiders = async () => {
    try {
      const response = await fetch("/api/riders", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch riders data");

      const data = await response.json();
      if (Array.isArray(data.riders)) {
        setRidersData(data.riders);
      }
    } catch (error) {
      console.error("Error fetching riders:", error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
    fetchRiders();
  }, []);

  const handleDeliveryClick = (delivery: DeliveryType) => {
    setSelectedDelivery(delivery);
  };

  // Add function to check if delivery is trackable
  const checkTrackableDelivery = async (deliveryId: string) => {
    try {
      const response = await fetch(
        `/api/deliveries/${deliveryId}/rider-location`
      );
      // Only returns true if we can successfully get location data
      return response.ok && (await response.json()).location_data;
    } catch {
      return false;
    }
  };

  // Add this useEffect to automatically check which deliveries are trackable
  useEffect(() => {
    const checkTrackableDeliveries = async () => {
      const trackable = new Set<string>();

      // Only check deliveries that are "inprogress" or "ongoing"
      const inProgressDeliveries = filteredDeliveries.filter(
        (delivery) =>
          delivery.status.current.toLowerCase() === "inprogress" ||
          delivery.status.current.toLowerCase() === "ongoing"
      );

      // Check each in-progress delivery in parallel
      const checks = await Promise.all(
        inProgressDeliveries.map(async (delivery) => {
          const isTrackable = await checkTrackableDelivery(delivery._id);
          if (isTrackable) {
            trackable.add(delivery._id);
          }
          return { id: delivery._id, trackable: isTrackable };
        })
      );

      setTrackableDeliveries(trackable);
    };

    checkTrackableDeliveries();
  }, [filteredDeliveries]); // Re-run when deliveries list changes

  // Function to handle track button click
  const handleTrackDelivery = async (delivery: DeliveryType) => {
    // If already tracking this delivery, stop tracking
    if (trackingDeliveryId === delivery._id) {
      setTrackingDeliveryId(null);
      setActiveView("list");
      return;
    }

    // Check if delivery is trackable
    const isTrackable = await checkTrackableDelivery(delivery._id);
    if (isTrackable) {
      setTrackingDeliveryId(delivery._id);
      setActiveView("map");
    }
  };

  // Reusable track button component that handles the disabled state
  const TrackButton = ({ delivery }: { delivery: DeliveryType }) => {
    const isTrackable = trackableDeliveries.has(delivery._id);
    const isTracking = trackingDeliveryId === delivery._id;

    return (
      <button
        className={`p-2 rounded-full transition ${
          isTrackable
            ? isTracking
              ? "bg-color1lite text-color1" // Currently tracking
              : "text-gray-500 hover:bg-gray-100" // Trackable but not tracking
            : "text-gray-300 cursor-not-allowed" // Not trackable
        }`}
        onClick={() => isTrackable && handleTrackDelivery(delivery)}
        disabled={!isTrackable}
        title={
          isTrackable
            ? isTracking
              ? "Stop Tracking"
              : "Track Delivery"
            : "Delivery not trackable"
        }
      >
        <FaRoute className="w-5 h-5" />
      </button>
    );
  };

  // Add new analytics calculations
  const analyticsData = useMemo(() => {
    const totalDeliveries = deliveriesData.length;
    if (totalDeliveries === 0) return null;

    // Calculate average delivery time (assuming we have timestamps)
    const completedDeliveries = deliveriesData.filter(
      (d) => d.status.current.toLowerCase() === "completed"
    );

    // Calculate delivery counts by status
    const statusCounts = deliveriesData.reduce((acc, delivery) => {
      const status = delivery.status.current.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate vehicle type distribution
    const vehicleCounts = deliveriesData.reduce((acc, delivery) => {
      const type = delivery.vehicletype.toLowerCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average distance
    const totalDistance = deliveriesData.reduce((sum, delivery) => {
      const distance = parseFloat(delivery.distance) || 0;
      return sum + distance;
    }, 0);
    const avgDistance = totalDistance / totalDeliveries;

    // Create data for status trend chart
    const statusData = [
      { name: "Completed", value: statusCounts.completed || 0 },
      { name: "In Progress", value: statusCounts.inprogress || 0 },
      { name: "Ongoing", value: statusCounts.ongoing || 0 },
      { name: "Pending", value: statusCounts.pending || 0 },
    ];

    // Create data for vehicle distribution chart
    const vehicleData = [
      { name: "Bikes", value: vehicleCounts.bike || 0 },
      { name: "Cars", value: vehicleCounts.car || 0 },
    ];

    return {
      averageDistance: avgDistance.toFixed(1),
      completionRate: (
        ((statusCounts.completed || 0) / totalDeliveries) *
        100
      ).toFixed(1),
      statusData,
      vehicleData,
    };
  }, [deliveriesData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER WITH REALTIME DATE */}
      <header className="bg-gradient-to-r from-color1 to-color2 text-white py-3 sm:py-5 px-4 sm:px-6 shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div>
            <p className="text-color1 text-sm sm:text-base">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" • "}
              <span className="hidden sm:inline">
                {new Date().toLocaleTimeString("en-US")}
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-green-500 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-1.5 sm:mr-2 animate-pulse"></span>
              Live Tracking
            </span>
          </div>
        </div>
      </header>

      {/* DASHBOARD METRICS */}
      <section className="container mx-auto mt-4 sm:mt-6 px-3 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Deliveries */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Deliveries
                </p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {metrics.total}
                </h2>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">12% increase</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-600 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Completed</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {metrics.completed}
                </h2>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{
                    width: `${(metrics.completed / metrics.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                {Math.round((metrics.completed / metrics.total) * 100)}%
                completion rate
              </p>
            </div>
          </div>

          {/* Ongoing */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Ongoing</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {metrics.ongoing}
                </h2>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Truck className="h-7 w-7 text-orange-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-orange-500 h-2.5 rounded-full animate-pulse"
                  style={{
                    width: `${Math.max(
                      10,
                      (metrics.ongoing / Math.max(metrics.total, 1)) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <div className="flex items-center"></div>
                <span className="text-orange-600 font-medium flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-1.5 animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-blue-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">In Progress</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {metrics.inProgress}
                </h2>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Truck className="h-7 w-7 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-gray-500">Avg time: 32 min</span>
              </div>
              <span className="text-yellow-600 font-medium">Active</span>
            </div>
          </div>

          {/* Vehicle Distribution */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-color2 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Vehicles</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {metrics.bikes + metrics.cars}
                </h2>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaMotorcycle className="h-7 w-7 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <FaMotorcycle className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-gray-600">{metrics.bikes} Bikes</span>
              </div>
              <div className="flex items-center">
                <FaCar className="h-4 w-4 text-color2 mr-1" />
                <span className="text-gray-600">{metrics.cars} Cars</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS AND CONTROLS */}
      <section className="container mx-auto mt-4 sm:mt-6 px-3 sm:px-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            {/* Top controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              {/* Search and primary filters */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="relative flex-grow sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                  <input
                    type="text"
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color1"
                    placeholder="Search deliveries..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center px-3 py-2 rounded-lg border text-sm ${
                      isFilterOpen
                        ? "bg-color1lite text-color1 border-color1"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    <Filter className="h-4 w-4 mr-1.5" />
                    Filters
                  </button>

                  {/* View toggles */}
                  <div className="flex items-center border-l border-gray-300 pl-2 sm:pl-3">
                    <button
                      onClick={() => setActiveView("list")}
                      className={`p-2 rounded-md ${
                        activeView === "list"
                          ? "bg-color1lite text-color1"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      title="List View"
                    >
                      <BarChart2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setActiveView("map")}
                      className={`p-2 rounded-md ${
                        activeView === "map"
                          ? "bg-color1lite text-color1"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      title="Map View"
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setActiveView("analytics")}
                      className={`p-2 rounded-md ${
                        activeView === "analytics"
                          ? "bg-color1lite text-color1"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                      title="Analytics View"
                    >
                      <TrendingUp className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Date and export */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="flex space-x-2">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                    <input
                      type="date"
                      className="w-full sm:w-auto pl-9 sm:pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color1"
                      value={dateRange.from}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <span className="relative top-3 px-3">to</span>
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                    <input
                      type="date"
                      className="w-full sm:w-auto pl-9 sm:pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-color1"
                      value={dateRange.to}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={() => exportAllDeliveriesToCSV(deliveriesData)}
                  className="p-2 bg-color1 text-white rounded-lg shadow hover:bg-color2 transition-colors"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Expanded filters */}
            {isFilterOpen && (
              <div className="pt-3 sm:pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-1.5 text-sm bg-white border border-color1/20 
                        rounded-lg shadow-sm outline-none hover:border-color1 
                        focus:border-color1 focus:ring-1 focus:ring-color1/50 
                        cursor-pointer appearance-none bg-[url('/chevron-down.png')] 
                        bg-no-repeat bg-[center_right_0.5rem] bg-[length:1rem] 
                        pr-8 transition-all"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="inprogress">In Progress</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      className="w-full px-3 py-1.5 text-sm bg-white border border-color1/20 
                        rounded-lg shadow-sm outline-none hover:border-color1 
                        focus:border-color1 focus:ring-1 focus:ring-color1/50 
                        cursor-pointer appearance-none bg-[url('/chevron-down.png')] 
                        bg-no-repeat bg-[center_right_0.5rem] bg-[length:1rem] 
                        pr-8 transition-all"
                      value={vehicleFilter}
                      onChange={(e) => setVehicleFilter(e.target.value)}
                    >
                      <option value="all">All Vehicles</option>
                      <option value="bike">Bikes</option>
                      <option value="car">Cars</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Size
                    </label>
                    <select
                      className="w-full px-3 py-1.5 text-sm bg-white border border-color1/20 
                        rounded-lg shadow-sm outline-none hover:border-color1 
                        focus:border-color1 focus:ring-1 focus:ring-color1/50 
                        cursor-pointer appearance-none bg-[url('/chevron-down.png')] 
                        bg-no-repeat bg-[center_right_0.5rem] bg-[length:1rem] 
                        pr-8 transition-all"
                    >
                      <option>All Sizes</option>
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort By
                    </label>
                    <select
                      className="w-full px-3 py-1.5 text-sm bg-white border border-color1/20 
                        rounded-lg shadow-sm outline-none hover:border-color1 
                        focus:border-color1 focus:ring-1 focus:ring-color1/50 
                        cursor-pointer appearance-none bg-[url('/chevron-down.png')] 
                        bg-no-repeat bg-[center_right_0.5rem] bg-[length:1rem] 
                        pr-8 transition-all"
                    >
                      <option>Newest First</option>
                      <option>Oldest First</option>
                      <option>Distance: Low to High</option>
                      <option>Distance: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="container mx-auto mt-4 sm:mt-6 px-3 sm:px-4 pb-6 sm:pb-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-color1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading deliveries...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={fetchDeliveries}
              className="mt-4 px-4 py-2 bg-color1 text-white rounded-lg hover:bg-color2 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeView === "list" && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Mobile list view */}
                <div className="block sm:hidden">
                  {filteredDeliveries.map((delivery) => (
                    <div
                      key={delivery._id}
                      className="p-4 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-lg ${
                              delivery.vehicletype.toLowerCase() === "bike"
                                ? "bg-color1lite"
                                : "bg-color2lite"
                            }`}
                          >
                            {delivery.vehicletype.toLowerCase() === "bike" ? (
                              <FaMotorcycle className="text-lg text-color1" />
                            ) : (
                              <FaCar className="text-lg text-color2" />
                            )}
                          </div>
                          <span className="ml-2 text-sm font-medium">
                            {`#${delivery._id.slice(-4)}`}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            delivery.status.current.toLowerCase() ===
                            "completed"
                              ? "bg-color2lite text-color2"
                              : "bg-color1lite text-color1"
                          }`}
                        >
                          {delivery.status.current}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-red-500 w-4 h-4 mr-2" />
                          <span className="text-gray-600 truncate">
                            {delivery.startpoint}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-blue-500 w-4 h-4 mr-2" />
                          <span className="text-gray-600 truncate">
                            {delivery.endpoint}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {delivery.distance}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {delivery.packagesize}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-color1 hover:bg-color1lite rounded-full transition"
                            onClick={() => setSelectedDelivery(delivery)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <TrackButton delivery={delivery} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop list view */}
                <div className="hidden sm:block">
                  {/* List view header */}
                  <div className="grid grid-cols-7 bg-gray-50 text-gray-700 font-semibold py-4 px-6 border-b">
                    <span>Vehicle</span>
                    <span>Size</span>
                    <span>Origin</span>
                    <span>Distance</span>
                    <span>Status</span>
                    <span>Destination</span>
                    <span className="text-center">Actions</span>
                  </div>

                  {/* Delivery items */}
                  <div className="divide-y divide-gray-100">
                    {filteredDeliveries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <FaExclamationTriangle className="text-4xl text-gray-400 mb-3" />
                        <h3 className="text-xl font-medium text-gray-700">
                          No deliveries found
                        </h3>
                        <p className="text-gray-500 max-w-md mt-2">
                          No deliveries match your current search and filter
                          criteria. Try adjusting your filters or search term.
                        </p>
                        <button
                          className="mt-4 px-4 py-2 bg-color1 text-white rounded-lg hover:bg-color2 transition"
                          onClick={() => {
                            setSearchInput("");
                            setStatusFilter("all");
                            setVehicleFilter("all");
                            setDateRange({
                              from: "",
                              to: "",
                            });
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    ) : (
                      filteredDeliveries.map((delivery) => (
                        <div
                          key={delivery._id}
                          className="grid grid-cols-7 items-center py-4 px-6 hover:bg-color1lite/10 transition-colors"
                        >
                          {/* VEHICLE TYPE */}
                          <div className="flex items-center">
                            <div
                              className={`p-2 rounded-lg ${
                                delivery.vehicletype.toLowerCase() === "bike"
                                  ? "bg-color1lite"
                                  : "bg-color2lite"
                              }`}
                            >
                              {delivery.vehicletype.toLowerCase() === "bike" ? (
                                <FaMotorcycle
                                  className={`text-xl ${
                                    delivery.vehicletype.toLowerCase() ===
                                    "bike"
                                      ? "text-color1"
                                      : "text-color2"
                                  }`}
                                />
                              ) : (
                                <FaCar
                                  className={`text-xl ${
                                    delivery.vehicletype.toLowerCase() ===
                                    "bike"
                                      ? "text-color1"
                                      : "text-color2"
                                  }`}
                                />
                              )}
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-800">
                              {delivery.vehicletype}
                            </span>
                          </div>

                          {/* PACKAGE SIZE */}
                          <span className="text-sm font-medium text-gray-800">
                            {delivery.packagesize}
                          </span>

                          {/* START POINT */}
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-red-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {delivery.startpoint}
                            </span>
                          </div>

                          {/* DISTANCE */}
                          <div className="flex items-center">
                            <FaRoute className="text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              {delivery.distance}
                            </span>
                          </div>

                          {/* STATUS */}
                          <div>
                            <span
                              className={`inline-flex items-center text-color1 text-xs font-medium px-2.5 py-1 rounded-full ${
                                delivery.status.current.toLowerCase() ===
                                "completed"
                                  ? "bg-color2lite"
                                  : delivery.status.current.toLowerCase() ===
                                    "inprogress"
                                  ? "bg-color1lite"
                                  : "bg-color3lite"
                              }`}
                            >
                              {delivery.status.current.toLowerCase() ===
                              "completed" ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : delivery.status.current.toLowerCase() ===
                                "inprogress" ? (
                                <Clock className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {delivery.status.current}
                            </span>
                          </div>

                          {/* END POINT */}
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-blue-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {delivery.endpoint}
                            </span>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              className="p-2 text-color1 hover:bg-color1lite rounded-full transition"
                              onClick={() => setSelectedDelivery(delivery)}
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <TrackButton delivery={delivery} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 bg-gray-50">
                    <div className="flex items-center text-sm text-gray-500">
                      Showing{" "}
                      <span className="font-medium mx-1">
                        {filteredDeliveries.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium mx-1">
                        {deliveriesData.length}
                      </span>{" "}
                      deliveries
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100">
                        Previous
                      </button>
                      <button className="px-3 py-1 bg-color1 text-white rounded">
                        1
                      </button>
                      <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100">
                        2
                      </button>
                      <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100">
                        3
                      </button>
                      <button className="px-3 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-100">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "map" && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Delivery Map View
                </h2>
                <DeliveryMap
                  deliveries={filteredDeliveries}
                  onDeliveryClick={handleDeliveryClick}
                  trackingDeliveryId={trackingDeliveryId}
                />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredDeliveries.map((delivery) => (
                    <div
                      key={delivery._id}
                      onClick={() => handleDeliveryClick(delivery)}
                      className={`bg-gray-50 rounded-lg p-4 border-2 transition-all cursor-pointer
                        ${
                          selectedDelivery?._id === delivery._id
                            ? "border-blue-500 shadow-lg"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {delivery.vehicletype.toLowerCase() === "bike" ? (
                            <FaMotorcycle className="text-xl text-blue-600" />
                          ) : (
                            <FaCar className="text-xl text-purple-600" />
                          )}
                          <span className="ml-2 font-medium">{`Delivery #${delivery._id.slice(
                            -4
                          )}`}</span>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            delivery.status.current.toLowerCase() ===
                            "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {delivery.status.current}
                        </span>
                      </div>
                      <div className="mt-3 text-sm">
                        <div className="flex items-center mb-1">
                          <FaMapMarkerAlt className="text-red-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 truncate">
                            {delivery.startpoint}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-blue-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600 truncate">
                            {delivery.endpoint}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === "analytics" && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Delivery Analytics Overview
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Delivery Status Chart */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-4">
                      Delivery Status Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData?.statusData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#001F3E" />{" "}
                          {/* Changed to color1 */}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Vehicle Type Distribution */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-4">
                      Vehicle Type Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData?.vehicleData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#7EA852" />{" "}
                          {/* Changed to color2 */}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800">
                      Average Distance
                    </h3>
                    <p className="text-2xl font-bold mt-2 text-color1">
                      {" "}
                      {/* Added text color */}
                      {analyticsData?.averageDistance || "0"} km
                    </p>
                    <p className="text-gray-500 text-sm mt-1">Per delivery</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800">
                      Completion Rate
                    </h3>
                    <p className="text-2xl font-bold mt-2 text-color2">
                      {" "}
                      {/* Added text color */}
                      {analyticsData?.completionRate || "0"}%
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Of total deliveries
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800">
                      Active Deliveries
                    </h3>
                    <p className="text-2xl font-bold mt-2 text-color1">
                      {" "}
                      {/* Added text color */}
                      {analyticsData?.statusData.find(
                        (s) => s.name === "In Progress"
                      )?.value || 0}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Currently in progress
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* DETAILS MODAL */}
      {selectedDelivery && (
        <DetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onStatusToggle={(id, updateStatus) => {
            console.log(`updated delivery ${id} to ${updateStatus}`);
          }}
          deliveriesData={deliveriesData}
          ridersData={ridersData}
          rider={
            selectedDelivery.rider
              ? ridersData.find(
                  (rider) => rider._id === selectedDelivery.rider?._id
                )
              : undefined
          }
        />
      )}
    </div>
  );
};

interface SearchInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
}

const SearchInput = ({ input, setInput }: SearchInputProps) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
        placeholder="Search deliveries by vehicle, size, location or status..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
};

export default DeliveriesListPage;
