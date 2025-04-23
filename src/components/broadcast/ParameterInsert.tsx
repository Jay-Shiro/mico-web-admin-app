"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const RIDER_PARAMETERS = [
  { key: "name", description: "Rider's full name" },
  { key: "email", description: "Email address" },
  { key: "phone", description: "Phone number" },
  { key: "deliveries", description: "Total deliveries" },
  { key: "rating", description: "Current rating" },
  { key: "status", description: "Account status" },
];

const CUSTOMER_PARAMETERS = [
  { key: "name", description: "Customer's full name" },
  { key: "email", description: "Email address" },
  { key: "phone", description: "Phone number" },
  { key: "orders", description: "Number of orders" },
  { key: "lastOrder", description: "Last order date" },
  { key: "status", description: "Account status" },
];

type ParameterInsertProps = {
  onInsertParameter: (param: string) => void;
  recipientType: "rider" | "customer";
};

export default function ParameterInsert({
  onInsertParameter,
  recipientType,
}: ParameterInsertProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const parameters =
    recipientType === "rider" ? RIDER_PARAMETERS : CUSTOMER_PARAMETERS;

  const filteredParameters = searchTerm
    ? parameters.filter(
        (p) =>
          p.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : parameters;

  return (
    <div className="border rounded-lg bg-gray-50 w-full">
      <div className="p-3 border-b">
        <h3 className="text-sm font-medium text-color1 mb-1">
          Insert Parameters
        </h3>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search parameters..."
          className="w-full px-2 py-1 text-sm border rounded"
        />
      </div>

      <div className="max-h-60 overflow-y-auto">
        {filteredParameters.map((param, index) => (
          <motion.div
            key={param.key}
            className="p-2 border-b last:border-b-0 hover:bg-color3lite/30 cursor-pointer"
            onClick={() => onInsertParameter(param.key)}
            whileHover={{ x: 3 }}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-color1 text-sm">{`{${param.key}}`}</span>
              <motion.button
                className="text-xs bg-color2 text-white px-2 py-0.5 rounded"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Insert
              </motion.button>
            </div>
            <p className="text-xs text-gray-500">{param.description}</p>
          </motion.div>
        ))}

        {filteredParameters.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No parameters found
          </div>
        )}
      </div>

      <div className="p-2 border-t bg-gray-100 text-xs text-gray-500">
        Parameters are automatically replaced with recipient data
      </div>
    </div>
  );
}
