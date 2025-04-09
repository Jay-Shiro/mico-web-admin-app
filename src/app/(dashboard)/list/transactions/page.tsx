"use client";

import React, { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import { motion, AnimatePresence } from "framer-motion";
import { CSVLink } from "react-csv";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
} from "recharts";
import { DetailsModal } from "./DetailsModal";
import { BsThreeDots } from "react-icons/bs";
import { DeliveryType } from "@/app/(dashboard)/list/tracking/deliveryType";

// ─── Types ────────────────────────────────────────────────────────────────

type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

// ─── Component ───────────────────────────────────────────────────────────

export default function TransactionsPage() {
  // Add loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update state to use DeliveryType
  const [transactions, setTransactions] = useState<DeliveryType[]>([]);

  // Fetch transactions and transform the data
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions");

      const data = await response.json();

      if (!data.deliveries) {
        console.error("No deliveries in response:", data);
        throw new Error("Invalid response format");
      }

      setTransactions(data.deliveries);
      setError(null);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Add effect debug
  useEffect(() => {}, [transactions]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ─── State ─────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRider, setSelectedRider] = useState<string>("");
  const [selectedType, setSelectedType] = useState<
    "" | "completed" | "pending"
  >("");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const itemsPerPage = 10;
  const [page, setPage] = useState<number>(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<DeliveryType | null>(null);

  // ─── Derived Data ──────────────────────────────────────────────────────

  // Updated Fuse.js configuration with more searchable fields
  const fuse = useMemo(
    () =>
      new Fuse<DeliveryType>(transactions, {
        keys: [
          { name: "_id", weight: 2 }, // Higher weight for ID matches
          { name: "user.firstname", weight: 1.5 },
          { name: "user.lastname", weight: 1.5 },
          { name: "rider.firstname", weight: 1.5 },
          { name: "rider.lastname", weight: 1.5 },
          { name: "status.deliverystatus", weight: 1 },
          { name: "price", weight: 1 },
          {
            name: "transaction_info.payment_date",
            weight: 1,
            getFn: (transaction) => {
              const date = new Date(
                transaction.transaction_info?.payment_date ||
                  transaction.last_updated ||
                  ""
              );
              return (
                date.toLocaleDateString() + " " + date.toLocaleTimeString()
              );
            },
          },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
        shouldSort: true,
        findAllMatches: true,
      }),
    [transactions]
  );

  // Improved search with better type handling
  const searched = useMemo<DeliveryType[]>(() => {
    if (!searchQuery.trim()) return transactions;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, transactions]);

  // Enhanced filter logic
  const filtered = useMemo<DeliveryType[]>(() => {
    const { startDate, endDate } = dateRange;

    return searched.filter((t) => {
      // Date handling
      const transactionDate = new Date(
        t.transaction_info?.payment_date || t.last_updated || new Date()
      );

      const dateFilter =
        (!startDate || transactionDate >= new Date(startDate)) &&
        (!endDate || transactionDate <= new Date(endDate));

      // Status filter handling
      const statusFilter =
        !selectedType ||
        t.status?.deliverystatus?.toLowerCase() === selectedType.toLowerCase();

      // Rider filter handling
      const riderFilter = !selectedRider || t.rider?._id === selectedRider;

      return dateFilter && statusFilter && riderFilter;
    });
  }, [searched, selectedRider, selectedType, dateRange]);

  // Updated riders list to show names instead of IDs
  const riders = useMemo(() => {
    const uniqueRiders = Array.from(
      new Set(
        transactions
          .filter((t) => t.rider)
          .map((t) => ({
            id: t.rider?._id,
            name: t.rider
              ? `${t.rider.firstname} ${t.rider.lastname}`
              : "Unassigned",
          }))
      )
    );
    return uniqueRiders;
  }, [transactions]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo<DeliveryType[]>(() => {
    const start = (page - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, page]);

  // Summary metrics - based on delivery status
  const total = filtered.length;
  const completed = filtered.filter(
    (t) => t.status?.deliverystatus === "completed"
  ).length;
  const pending = filtered.filter(
    (t) => t.status?.deliverystatus === "pending"
  ).length;

  // Chart data: daily volume
  const chartData = useMemo(() => {
    const byDate: Record<string, number> = {};
    filtered.forEach((t) => {
      const day = new Date(
        t.transaction_info?.payment_date || t.last_updated || ""
      ).toLocaleDateString();
      byDate[day] = (byDate[day] || 0) + (t.price || 0);
    });
    return Object.entries(byDate).map(([date, amount]) => ({ date, amount }));
  }, [filtered]);

  // Animation variants
  const cardVar = {
    hidden: { opacity: 0, y: -20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, type: "spring", stiffness: 120 },
    }),
  };
  const rowVar = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.02, type: "spring", stiffness: 140 },
    }),
  };

  // Add loading state UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-color1"></div>
      </div>
    );
  }

  // Add error state UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-color1 text-white rounded hover:bg-color1/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <motion.h1
        className="text-4xl font-extrabold text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Transaction Dashboard
      </motion.h1>

      {/* Summary + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Deliveries", value: total },
          {
            label: "Total Amount ₦",
            value: filtered
              .reduce((sum, t) => sum + (t.price || 0), 0)
              .toFixed(2),
          },
          { label: "Completed", value: completed },
          { label: "Pending", value: pending },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            className="p-4 bg-white rounded-lg shadow"
            custom={i}
            variants={cardVar}
            initial="hidden"
            animate="visible"
          >
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-semibold text-gray-800">{c.value}</p>
          </motion.div>
        ))}
        <motion.div
          className="col-span-1 lg:col-span-2 p-4 bg-white rounded-lg shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-gray-500 mb-2">Daily Volume</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <RechartTooltip />
              <Bar dataKey="amount" fill="#7EA852" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <motion.input
          type="text"
          placeholder="Search by ID, Customer, Rider, Status, Amount, or Date..."
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-color1"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        />

        <motion.select
          className="p-2 border rounded focus:ring-2 focus:ring-color1"
          value={selectedRider}
          onChange={(e) => {
            setSelectedRider(e.target.value);
            setPage(1);
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
        >
          <option value="">All Riders</option>
          {riders.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </motion.select>

        <motion.select
          className="p-2 text-sm bg-white border border-color1/20 
                        rounded-lg shadow-sm outline-none hover:border-color1 
                        focus:border-color1 focus:ring-1 focus:ring-color1/50 
                        cursor-pointer appearance-none bg-[url('/chevron-down.png')] 
                        bg-no-repeat bg-[center_right_0.5rem] bg-[length:1rem] 
                        pr-8 transition-all "
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value as "" | "completed" | "pending");
            setPage(1);
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </motion.select>

        <motion.div
          className="flex gap-2 items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55 }}
        >
          <input
            type="date"
            className="p-2 border rounded focus:ring-2 focus:ring-color1"
            value={dateRange.startDate || ""}
            onChange={(e) => {
              setDateRange((prev) => ({
                ...prev,
                startDate: e.target.value,
              }));
              setPage(1);
            }}
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            className="p-2 border rounded focus:ring-2 focus:ring-color1"
            value={dateRange.endDate || ""}
            onChange={(e) => {
              setDateRange((prev) => ({
                ...prev,
                endDate: e.target.value,
              }));
              setPage(1);
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CSVLink
            data={filtered}
            filename={`transactions_${Date.now()}.csv`}
            className="px-4 py-2 bg-color1 text-white rounded hover:bg-color1 hover:text-white transition"
          >
            Export CSV
          </CSVLink>
        </motion.div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-color1">
            <tr>
              {[
                "Delivery ID",
                "Date",
                "Amount",
                "Status",
                "Rider",
                "Customer",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2 text-left text-xs font-semibold text-white"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <AnimatePresence>
            <tbody>
              {paginated.map((delivery, i) => (
                <motion.tr
                  key={delivery._id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={rowVar}
                  layout
                  className="border-b hover:bg-color1 hover:text-white cursor-pointer"
                >
                  <td className="px-4 py-2 text-xs">{delivery._id}</td>
                  <td className="px-4 py-2 text-xs">
                    {new Date(
                      delivery.transaction_info?.payment_date ||
                        delivery.last_updated ||
                        ""
                    ).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    ₦{(delivery.price ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-xs capitalize">
                    {delivery.status?.deliverystatus}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {delivery.rider
                      ? `${delivery.rider.firstname} ${delivery.rider.lastname}`
                      : "Unassigned"}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {delivery.user
                      ? `${delivery.user.firstname} ${delivery.user.lastname}`
                      : "Unknown Customer"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedTransaction(delivery)}
                      className="p-1 hover:bg-color1 hover:text-white rounded-full"
                      title="View Details"
                    >
                      <BsThreeDots className="text-color1" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </AnimatePresence>
        </table>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <DetailsModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </AnimatePresence>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
