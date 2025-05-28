import { motion } from "framer-motion";
import React, { useState } from "react";
import { DeliveryType } from "@/app/(dashboard)/list/tracking/deliveryType";
import { FaCreditCard, FaMoneyBill, FaCheckCircle } from "react-icons/fa";
import { exportTransactionToCSV } from "@/lib/exportCSV";

interface DetailsModalProps {
  transaction: DeliveryType;
  onClose: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  transaction,
  onClose,
}) => {
  // Add states for status update
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>(
    transaction.transaction_info?.payment_status || "pending"
  );

  // Function to update transaction status
  const updateTransactionStatus = async (newStatus: string) => {
    if (newStatus === paymentStatus) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const response = await fetch(
        `/api/deliveries/${transaction._id}/transaction`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_status: newStatus,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok && !responseData.warning) {
        throw new Error(
          responseData.error ||
            `Failed to update payment status (${response.status})`
        );
      }

      // Update local state on success
      setPaymentStatus(newStatus);

      // Update the transaction object as well
      if (transaction.transaction_info) {
        transaction.transaction_info.payment_status = newStatus;
      }

      // Show appropriate success message based on response
      if (responseData.warning) {
        setUpdateSuccess(`Status updated locally. ${responseData.warning}`);
      } else {
        setUpdateSuccess(`Payment status successfully updated to ${newStatus}`);
      }

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => setUpdateSuccess(null), 5000);
    } catch (error) {
      setUpdateError(
        error instanceof Error
          ? error.message
          : "An error occurred when updating the payment status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

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
              paymentStatus === "paid"
                ? "bg-green-100 text-green-800"
                : paymentStatus === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Payment Status: {paymentStatus}
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

          {/* Payment Status Update */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">
              Update Payment Status
            </h3>

            {/* Success message */}
            {updateSuccess && (
              <div className="mb-3 text-sm text-green-600 p-2 bg-green-50 rounded flex items-center">
                <FaCheckCircle className="mr-2" />
                {updateSuccess}
              </div>
            )}

            {/* Error message */}
            {updateError && (
              <div className="mb-3 text-sm text-red-500 p-2 bg-red-50 rounded">
                {updateError}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => updateTransactionStatus("pending")}
                disabled={isUpdating || paymentStatus === "pending"}
                className={`px-4 py-2 rounded-md ${
                  paymentStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
                    : "bg-gray-100 text-gray-800 hover:bg-yellow-50"
                } disabled:opacity-50`}
              >
                Pending
              </button>
              <button
                onClick={() => updateTransactionStatus("paid")}
                disabled={isUpdating || paymentStatus === "paid"}
                className={`px-4 py-2 rounded-md ${
                  paymentStatus === "paid"
                    ? "bg-green-100 text-green-800 border-2 border-green-300"
                    : "bg-gray-100 text-gray-800 hover:bg-green-50"
                } disabled:opacity-50`}
              >
                Paid
              </button>
              {isUpdating && (
                <span className="text-sm text-gray-500 flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              )}
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
