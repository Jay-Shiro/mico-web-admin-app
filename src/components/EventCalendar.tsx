"use client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Image from "next/image";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

//TEMP DATA
const events = [
  {
    id: 1,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    title: "Lorem ipsum dolor",
    time: "12:00 PM - 2:00 PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(null);
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by setting initial date only on client
  useEffect(() => {
    setMounted(true);
    onChange(new Date());
  }, []);

  // Return minimal content during SSR to prevent hydration issues
  if (!mounted) {
    return (
      <div className="bg-white p-4 rounded-md">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold my-4">Schedule</h1>
          <Image src="/more.png" alt="" width={20} height={20} />
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading calendar...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white p-4 rounded-md">
      <Calendar onChange={onChange} value={value} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <div
            className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-color1lite even:border-t-color4"
            key={event.id}
          >
            <div className="flex items-center justify-between">
              <h1 className="font-semibold text-gray-600">{event.title}</h1>
              <span className="text-gray-400 text-xs">{event.time}</span>
            </div>
            <p className="mt-2 text-gray-500 text-sm">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
