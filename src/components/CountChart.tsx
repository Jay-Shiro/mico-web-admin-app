"use client";

import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import Link from "next/link";

interface RiderStats {
  total: number;
  active: number;
  inactive: number;
}

const CountChart = () => {
  const [stats, setStats] = useState<RiderStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const response = await fetch("/api/riders");
        if (!response.ok) throw new Error("Failed to fetch riders");
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
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiders();
  }, []);

  const data = [
    {
      name: "Total",
      count: stats.total,
      fill: "white",
    },
    {
      name: "Active",
      count: stats.active,
      fill: "#001F3E",
    },
    {
      name: "Inactive",
      count: stats.inactive,
      fill: "#FAE27C",
    },
  ];

  const activePercentage = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;
  const inactivePercentage = 100 - activePercentage;

  return (
    <div className="bg-white rounded-xl w-full h-full p-4">
      {/*TITLE*/}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Riders</h1>
        <Link href="/list/riders">
        <Image src="/more.png" alt="" width={20} height={20}/>
        </Link>
      </div>
      {/*CHART*/}
      <div className="relative w-full h-[75%]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Loading...
          </div>
        ) : (
          <>
            <ResponsiveContainer>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="100%"
                barSize={32}
                data={data}
              >
                <RadialBar background dataKey="count" />
              </RadialBarChart>
            </ResponsiveContainer>
            <Image
              src="/active_inactive.png"
              alt=""
              width={120}
              height={120}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </>
        )}
      </div>
      {/*BOTTOM*/}
      <div className="flex justify-center gap-16">
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-color1 rounded-full"></div>
          <h1 className="font-bold">{stats.active}</h1>
          <h2 className="text-xs text-gray-400">
            Active ({activePercentage}%)
          </h2>
        </div>
        <div className="flex flex-col gap-1">
          <div className="w-5 h-5 bg-color3 rounded-full"></div>
          <h1 className="font-bold">{stats.inactive}</h1>
          <h2 className="text-xs text-gray-400">
            Inactive ({inactivePercentage}%)
          </h2>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
