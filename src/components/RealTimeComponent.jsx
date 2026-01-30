import { useState, useEffect } from "react";

const RealTimeComponent = () => {
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const timeString = `${hours}:${minutes}`;

      const offset = -now.getTimezoneOffset() / 60;
      const sign = offset >= 0 ? "+" : "";
      const timezoneString = `(UTC ${sign}${offset})`;

      setTime(timeString);
      setTimezone(timezoneString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">🕐</span>
      <span>
        {time} {timezone}
      </span>
    </div>
  );
};

export default RealTimeComponent;
