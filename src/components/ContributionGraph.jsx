import { useEffect, useState } from "react";
import { GitHubCalendar } from "react-github-calendar";

const ContributionGraph = ({ username = "momanamjad" }) => {
  const [allContributions, setAllContributions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    setLoading(true);

 fetch(`https://github-contributions-api.deno.dev/${username}.json`)


      .then((res) => res.json())
      .then((data) => {
        if (!data?.contributions) {
          setLoading(false);
          return;
        }

        setAllContributions(data.contributions);

        const years = new Set(
          data.contributions.map((item) => new Date(item.date).getFullYear()),
        );

        const sortedYears = Array.from(years).sort((a, b) => b - a);

        setAvailableYears(sortedYears);
        setSelectedYear(sortedYears[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contributions:", err);
        setLoading(false);
      });
  }, [username]);

  const filterDataBySelectedYear = (contributions) => {
    if (!selectedYear) return contributions;

    return contributions.filter(
      (activity) => new Date(activity.date).getFullYear() === selectedYear,
    );
  };

  if (loading) {
    return <div style={{ padding: 16 }}>Loading contributions…</div>;
  }
  const getTotalContributionsForYear = (data) => {
    return filterDataBySelectedYear(data).reduce(
      (sum, day) => sum + (day.contributionCount || 0),
      0,
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 72px",
        gap: "24px",
        padding: "16px 0",
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
      }}
    >
      {/* LEFT: GRAPH */}
      <section>
        {/* <h2
          style={{
            fontSize: "16px",
            fontWeight: 400,
            marginBottom: "8px",
            color: "#24292f",
          }}
        >
          {filterDataBySelectedYear(allContributions).length} contributions in{" "}
          {selectedYear}
        </h2> */}
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 400,
            marginBottom: "8px",
            color: "#24292f",
          }}
        >
          {getTotalContributionsForYear(allContributions)} contributions in{" "}
          {selectedYear}
        </h2>
        <div
          style={{
            border: "1px solid #d0d7de",
            borderRadius: "6px",
            padding: "16px",
            background: "#ffffff",
          }}
        >
          <GitHubCalendar
            username={username}
            transformData={filterDataBySelectedYear}
            showColorLegend
            blockSize={10}
            blockMargin={4}
            blockRadius={2}
            fontSize={12}
            tooltips
            theme={{
              light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
              dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
            }}
            labels={{
              totalCount: "{{count}} contributions in {{year}}",
            }}
          />
        </div>
      </section>

      {/* RIGHT: YEAR SELECTOR */}
      <aside>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {availableYears.map((year) => {
            const active = year === selectedYear;

            return (
              <li key={year} style={{ marginBottom: "4px" }}>
                <button
                  onClick={() => setSelectedYear(year)}
                  style={{
                    width: "100%",
                    padding: "4px 8px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    backgroundColor: active ? "#ddf4ff" : "transparent",
                    color: active ? "#0969da" : "#57606a",
                    fontWeight: active ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "#f6f8fa";
                  }}
                  onMouseLeave={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {year}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
};

export default ContributionGraph;
