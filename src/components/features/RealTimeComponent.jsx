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
      <span className="text-lg"><svg className="fill-[#59636E]" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path></svg></span>
      <span>
        {time} <span  className="text-[#59636E]" >{timezone}</span>
      </span>
    </div>
  );
};

export default RealTimeComponent;
