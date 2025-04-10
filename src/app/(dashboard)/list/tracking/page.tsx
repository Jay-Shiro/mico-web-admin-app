"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

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
        setFilteredDeliveries(data.deliveries);
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
      (d) => d.status.deliverystatus.toLowerCase() === "completed"
    ).length;
    const inProgress = filteredDeliveries.filter(
      (d) => d.status.deliverystatus.toLowerCase() === "in progress"
    ).length;
    const pending = filteredDeliveries.filter(
      (d) => d.status.deliverystatus.toLowerCase() === "pending"
    ).length;
    const bikes = filteredDeliveries.filter(
      (d) => d.vehicletype.toLowerCase() === "bike"
    ).length;
    const cars = filteredDeliveries.filter(
      (d) => d.vehicletype.toLowerCase() === "car"
    ).length;

    return { total, completed, inProgress, pending, bikes, cars };
  }, [filteredDeliveries]);

  useEffect(() => {
    applyFilters();
  }, [searchInput, statusFilter, vehicleFilter, selectedDate]);

  const applyFilters = () => {
    let filtered = [...deliveriesData];

    // Search filter
    if (searchInput) {
      filtered = filtered.filter((delivery) =>
        `${delivery._id} ${delivery.vehicletype} ${delivery.packagesize} ${delivery.startpoint} ${delivery.distance} ${delivery.status.deliverystatus} ${delivery.endpoint}`
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (delivery) =>
          delivery.status.deliverystatus.toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    // Vehicle filter
    if (vehicleFilter !== "all") {
      filtered = filtered.filter(
        (delivery) =>
          delivery.vehicletype.toLowerCase() === vehicleFilter.toLowerCase()
      );
    }

    // Date filter could be implemented if the data included delivery dates
    // For now, we're just keeping the date selector for UI demonstration

    setFilteredDeliveries(filtered);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER WITH REALTIME DATE */}
      <header className="bg-gradient-to-r from-color1 to-color2 text-white py-5 px-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <p className="text-blue-100 mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" • "}
              {new Date().toLocaleTimeString("en-US")}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              Live Tracking
            </span>
          </div>
        </div>
      </header>

      {/* DASHBOARD METRICS */}
      <section className="container mx-auto mt-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* In Progress */}
          <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
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
      <section className="container mx-auto mt-6 px-4">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Left side controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex items-center w-full sm:w-auto">
                <Search className="absolute left-3 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by ID, vehicle type, location..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center py-2 px-4 rounded-lg border ${
                  isFilterOpen
                    ? "bg-color1lite text-color1 border-color1"
                    : "bg-white border-gray-300 text-gray-600"
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(statusFilter !== "all" || vehicleFilter !== "all") && (
                  <span className="ml-2 bg-color1lite text-color1 text-xs font-medium px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>

              <div className="sm:border-l border-gray-300 sm:pl-4 flex items-center space-x-3">
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

            {/* Right side controls */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Calendar className="absolute left-3 text-gray-400 h-5 w-5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <button
                onClick={() => exportAllDeliveriesToCSV(deliveriesData)}
                className="bg-blue-600 text-white p-2 rounded-lg shadow hover:bg-blue-700 transition"
                title="Export to CSV"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Expanded filters */}
          {isFilterOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                  <option value="in progress">In Progress</option>
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
          )}
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="container mx-auto mt-6 px-4 pb-10">
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
                                  delivery.vehicletype.toLowerCase() === "bike"
                                    ? "text-color1"
                                    : "text-color2"
                                }`}
                              />
                            ) : (
                              <FaCar
                                className={`text-xl ${
                                  delivery.vehicletype.toLowerCase() === "bike"
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
                              delivery.status.deliverystatus.toLowerCase() ===
                              "completed"
                                ? "bg-color2lite"
                                : delivery.status.deliverystatus.toLowerCase() ===
                                  "in progress"
                                ? "bg-color1lite"
                                : "bg-color3lite"
                            }`}
                          >
                            {delivery.status.deliverystatus.toLowerCase() ===
                            "completed" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : delivery.status.deliverystatus.toLowerCase() ===
                              "in progress" ? (
                              <Clock className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            )}
                            {delivery.status.deliverystatus}
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
                          <button
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                            title="Track Delivery"
                          >
                            <FaRoute className="w-5 h-5" />
                          </button>
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
            )}

            {activeView === "map" && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Delivery Map View
                </h2>
                <DeliveryMap deliveries={filteredDeliveries} />
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredDeliveries.slice(0, 3).map((delivery) => (
                    <div
                      key={delivery._id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition"
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
                            delivery.status.deliverystatus.toLowerCase() ===
                            "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {delivery.status.deliverystatus}
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
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Delivery Analytics
                </h2>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">
                    Analytics charts would be displayed here
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800">
                      Average Delivery Time
                    </h3>
                    <p className="text-2xl font-bold mt-2">32 min</p>
                    <p className="text-green-600 text-sm flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      5% faster than last week
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800">
                      Completion Rate
                    </h3>
                    <p className="text-2xl font-bold mt-2">94%</p>
                    <p className="text-green-600 text-sm flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      2% improvement
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800">
                      Average Distance
                    </h3>
                    <p className="text-2xl font-bold mt-2">8.7 km</p>
                    <p className="text-gray-500 text-sm mt-1">Per delivery</p>
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
