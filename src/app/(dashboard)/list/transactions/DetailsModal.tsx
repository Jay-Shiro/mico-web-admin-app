import { motion } from "framer-motion";
import React from "react";
import { DeliveryType } from "@/app/(dashboard)/list/tracking/deliveryType";
import { FaCreditCard, FaMoneyBill } from "react-icons/fa";
import { exportTransactionToCSV } from "@/lib/exportCSV";

interface DetailsModalProps {
  transaction: DeliveryType;
  onClose: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  transaction,
  onClose,
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 bg-color1/5 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-color1">
              Delivery Details
            </h2>
            <p className="text-sm text-gray-500">ID: {transaction._id}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              transaction.transaction_info?.payment_status === "completed"
                ? "bg-green-100 text-green-800"
                : transaction.transaction_info?.payment_status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Payment Status: {transaction.transaction_info?.payment_status}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Info */}
          <div className="bg-color2/5 p-4 rounded-lg flex items-center space-x-4">
            {transaction.transactiontype === "card" ? (
              <FaCreditCard className="text-4xl text-color2" />
            ) : (
              <FaMoneyBill className="text-4xl text-color2" />
            )}
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="text-lg font-semibold text-color1 capitalize">
                {transaction.transactiontype}
              </p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-lg font-semibold text-color1">
                ₦{transaction.price?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="text-base font-medium text-color1">
                {transaction.user
                  ? `${transaction.user.firstname} ${transaction.user.lastname}`
                  : "Unknown Customer"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rider</p>
              <p className="text-base font-medium text-color1">
                {transaction.rider
                  ? `${transaction.rider.firstname} ${transaction.rider.lastname}`
                  : "Unassigned"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-base font-medium text-color1">
                {new Date(
                  transaction.transaction_info?.payment_date || ""
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={() => exportTransactionToCSV(transaction)}
            className="px-4 py-2 bg-color2/80 text-white rounded-md hover:bg-color2"
          >
            Export CSV
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-color1/40 text-white rounded-md hover:bg-color1/50"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
