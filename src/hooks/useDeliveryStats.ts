"use client";

import { useState, useEffect } from "react";

export interface DeliveryStats {
  total: number;
}

export function useDeliveryStats() {
  const [stats, setStats] = useState<DeliveryStats>({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "https://deliveryapi-ten.vercel.app/deliveries"
        );
        if (!response.ok)
          throw new Error("Failed to fetch delivery statistics");

        const data = await response.json();
        setStats({ total: data.deliveries?.length || 0 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
