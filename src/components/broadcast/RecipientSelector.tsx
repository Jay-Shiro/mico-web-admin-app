"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/ui/SearchBar";
import Checkbox from "@/components/ui/Checkbox";

// To support grouping of recipients
const groupBy = (array: any[], key: string) => {
  return array.reduce((result, item) => {
    // Create key if it doesn't exist
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
};

interface RecipientSelectorProps {
  selectedRecipients: any[];
  setSelectedRecipients: React.Dispatch<React.SetStateAction<any[]>>;
  onContinue: () => void;
  isActive: boolean;
}

export default function RecipientSelector({
  selectedRecipients,
  setSelectedRecipients,
  onContinue,
  isActive,
}: RecipientSelectorProps) {
  const [activeTab, setActiveTab] = useState<"riders" | "customers">("riders");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [groups, setGroups] = useState<Record<string, any[]>>({});
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientsData, setRecipientsData] = useState<{
    riders: any[];
    users: any[];
  }>({ riders: [], users: [] });

  // Fetch real data from API
  useEffect(() => {
    const fetchRecipients = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/broadcast/recipients");
        if (!response.ok) {
          throw new Error(`Failed to fetch recipients: ${response.statusText}`);
        }
        const data = await response.json();
        setRecipientsData({
          riders: data.riders || [],
          users: data.users || [],
        });
      } catch (err) {
        console.error("Error fetching recipients:", err);
        setError("Failed to load recipients. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, []);

  // Initialize data based on active tab
  useEffect(() => {
    const data =
      activeTab === "riders" ? recipientsData.riders : recipientsData.users;
    setFilteredData(data);

    const groupedData = groupBy(data, "status");
    setGroups(groupedData);

    // Initially expand all groups
    setExpandedGroups(Object.keys(groupedData));
  }, [activeTab, recipientsData]);

  // Handle search
  useEffect(() => {
    const data =
      activeTab === "riders" ? recipientsData.riders : recipientsData.users;

    if (searchTerm.trim() === "") {
      setFilteredData(data);
      const groupedData = groupBy(data, "status");
      setGroups(groupedData);
      setExpandedGroups(Object.keys(groupedData));
      return;
    }

    const filtered = data.filter((item) => {
      const searchFields = [
        item.name,
        item.email,
        item.phone,
        item.status,
        activeTab === "riders" ? item.vehicle || "" : "",
      ]
        .join(" ")
        .toLowerCase();

      return searchFields.includes(searchTerm.toLowerCase());
    });

    setFilteredData(filtered);
    const groupedData = groupBy(filtered, "status");
    setGroups(groupedData);
    setExpandedGroups(Object.keys(groupedData));
  }, [searchTerm, activeTab, recipientsData]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const isRecipientSelected = (recipient: any) => {
    return selectedRecipients.some((r) => r.id === recipient.id);
  };

  const toggleRecipient = (recipient: any) => {
    setSelectedRecipients((prev) =>
      isRecipientSelected(recipient)
        ? prev.filter((r) => r.id !== recipient.id)
        : [...prev, recipient]
    );
  };

  const selectAll = (group: any[]) => {
    setSelectedRecipients((prev) => {
      // Filter out any from this group that are already selected
      const filteredPrev = prev.filter(
        (r) => !group.some((gr) => gr.id === r.id)
      );
      // Add all from the group
      return [...filteredPrev, ...group];
    });
  };

  const unselectAll = (group: any[]) => {
    setSelectedRecipients((prev) =>
      prev.filter((r) => !group.some((gr) => gr.id === r.id))
    );
  };

  const isAllSelected = (group: any[]) => {
    return group.every((r) => isRecipientSelected(r));
  };

  const selectedCount = selectedRecipients.length;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-color1 text-white">
        <h2 className="text-xl font-bold mb-2">Select Recipients</h2>
        <p className="text-sm text-color1lite">
          Choose riders or customers to receive your broadcast
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {["riders", "customers"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "riders" | "customers")}
            className={`flex-1 py-3 text-center transition-all relative
              ${
                activeTab === tab
                  ? "text-color2 font-medium"
                  : "text-gray-500 hover:text-color1"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-color2"
                layoutId="activeTab"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring focus:ring-color1/30 focus:border-color1"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Loading, Error, or Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-color1 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {activeTab}...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-color1 text-white rounded-md hover:bg-color1/80 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Recipients List */}
          <div className="flex-1 overflow-y-auto p-2">
            {Object.keys(groups).length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No {activeTab} found matching your search
              </div>
            ) : (
              Object.entries(groups).map(([groupName, groupItems]) => (
                <div key={groupName} className="mb-4">
                  {/* Group Header */}
                  <div
                    className="flex items-center bg-gray-100 p-2 rounded cursor-pointer"
                    onClick={() => toggleGroup(groupName)}
                  >
                    <svg
                      className={`w-5 h-5 mr-2 transition-transform ${
                        expandedGroups.includes(groupName) ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="font-medium capitalize">{groupName}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({groupItems.length})
                    </span>
                    <div className="ml-auto flex items-center space-x-2">
                      <button
                        className={`text-xs py-1 px-2 rounded ${
                          isAllSelected(groupItems)
                            ? "bg-color1 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          isAllSelected(groupItems)
                            ? unselectAll(groupItems)
                            : selectAll(groupItems);
                        }}
                      >
                        {isAllSelected(groupItems)
                          ? "Unselect All"
                          : "Select All"}
                      </button>
                    </div>
                  </div>

                  {/* Group Items */}
                  <AnimatePresence>
                    {expandedGroups.includes(groupName) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        {groupItems.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                              isRecipientSelected(item)
                                ? "bg-color1/5 border-l-4 border-l-color1"
                                : ""
                            }`}
                          >
                            <div className="mr-3">
                              <Checkbox
                                checked={isRecipientSelected(item)}
                                onChange={() => toggleRecipient(item)}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {item.name}{" "}
                                {item.branding &&
                                  item.branding.toLowerCase() === "yes" && (
                                    <span
                                      className="inline-flex ml-3 items-center justify-center w-4 h-4 bg-color2 text-white text-[10px] font-bold rounded-full"
                                      title="Accepts branding"
                                    >
                                      B
                                    </span>
                                  )}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {item.email}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {activeTab === "customers" && item.phone && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`tel:${item.phone}`, "_self");
                                  }}
                                  className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                                  title={`Call ${item.name}`}
                                >
                                  <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
                                </button>
                              )}
                              <div className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                                {activeTab === "riders" && item.vehicle
                                  ? item.vehicle
                                  : item.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedCount} recipient{selectedCount !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <motion.button
                className={`px-4 py-2 rounded-lg ${
                  selectedCount > 0
                    ? "bg-color2 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                whileHover={
                  selectedCount > 0
                    ? {
                        scale: 1.02,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }
                    : {}
                }
                whileTap={selectedCount > 0 ? { scale: 0.98 } : {}}
                onClick={selectedCount > 0 ? onContinue : undefined}
              >
                Continue
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
