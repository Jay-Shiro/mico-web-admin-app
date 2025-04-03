"use client";

import { useState, useEffect } from "react";

export interface RiderStats {
  total: number;
  active: number;
  inactive: number;
}

export function useRiderStats() {
  const [stats, setStats] = useState<RiderStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          "https://deliveryapi-ten.vercel.app/riders"
        );
        if (!response.ok) throw new Error("Failed to fetch rider statistics");

        const data = await response.json();
        const activeCount =
          data.riders?.filter((rider: any) => rider.status === "active")
            .length || 0;
        const totalCount = data.riders?.length || 0;

        setStats({
          total: totalCount,
          active: activeCount,
          inactive: totalCount - activeCount,
        });
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
