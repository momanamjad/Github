import React, { useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import './ContributionGraph.css';

const ContributionGraph = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const years = [2026, 2025, 2024];

  const customData = [
    { date: '2024-10-12', count: 1 },
    { date: '2024-10-13', count: 4 },
    { date: '2024-12-25', count: 12 },
    { date: '2024-01-05', count: 7 },
  ];

  return (
    <div className="gh-contribution-wrapper">
      <div className="gh-main-content">
        <div className="gh-header">
          <span>{customData.length * 52} contributions in the last year</span>
          {/* <button className="gh-settings-btn">Contribution settings ▼</button> */}
        </div>

        <div className="gh-calendar-card">
          <CalendarHeatmap
            startDate={new Date(`${selectedYear}-01-01`)}
            endDate={new Date(`${selectedYear}-12-31`)}
            values={customData}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'lvl-0';
              if (value.count < 3) return 'lvl-1';
              if (value.count < 6) return 'lvl-2';
              if (value.count < 9) return 'lvl-3';
              return 'lvl-4';
            }}
          />
         <div className="gh-footer">
  <a href="#">Learn how we count contributions</a>
  <div className="gh-legend">
    <span>Less</span>
    <div className="legend-box lvl-0"></div>
    <div className="legend-box lvl-1"></div>
    <div className="legend-box lvl-2"></div>
    <div className="legend-box lvl-3"></div>
    <div className="legend-box lvl-4"></div>
    <span>More</span>
  </div>
</div>

        </div>
      </div>

      <aside className="gh-year-sidebar">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`year-btn ${year === selectedYear ? 'active' : ''}`}
          >
            {year}
          </button>
        ))}
      </aside>
    </div>
  );
};

export default ContributionGraph;
