"use client";

import { useEffect, useState } from "react";

export default function Time() {
  const [time, setTime] = useState(new Date("2022-01-01T00:00:00"));

  // Update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, []);

  // Format the date
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" }); // Full month name
    const year = date.getFullYear();
    const hour = date.getHours() % 12 || 12; // Convert to 12-hour format
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "pm" : "am";

    const daySuffix = (day: number) => {
      if (day % 10 === 1 && day !== 11) return "st";
      if (day % 10 === 2 && day !== 12) return "nd";
      if (day % 10 === 3 && day !== 13) return "rd";
      return "th";
    };

    return `${day}${daySuffix(day)} ${month} ${year} ${hour}:${minute}:${second} ${ampm}`;
  };

  return (
    <div className="flex items-center justify-center ">
      <h1 className="text-xl font-bold text-pepsiBlue">{formatDate(time)}</h1>
    </div>
  );
}
