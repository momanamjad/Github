import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { getUser } from '../../services/GithubApi';
import './ContributionGraph.css';

const ContributionGraph = ({ username, contributions: initialContributions }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [registrationYear, setRegistrationYear] = useState(currentYear);
  const [contributions, setContributions] = useState(initialContributions || []);
  const [loading, setLoading] = useState(!initialContributions);

  useEffect(() => {
    if (initialContributions) {
      setContributions(initialContributions);
      setLoading(false);
      return;
    }

    const fetchContribs = async () => {
      try {
        setLoading(true);
        const userData = await getUser(username);
        setContributions(userData.contributions || []);
        if (userData.created_at) {
          setRegistrationYear(new Date(userData.created_at).getFullYear());
        }
      } catch (err) {
        console.error('Error fetching contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchContribs();
    }
  }, [username, initialContributions]);

  const years = [];
  for (let y = currentYear; y >= registrationYear; y--) {
    years.push(y);
  }

  const filteredData = contributions.filter((item) => {
    if (!item.date) return false;
    const itemYear = parseInt(item.date.split('-')[0], 10);
    return itemYear === selectedYear;
  });

  const totalContributions = filteredData.reduce((acc, curr) => acc + curr.count, 0);

  if (loading) {
    return (
      <div className="gh-contribution-wrapper" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
        <span>Loading contribution data...</span>
      </div>
    );
  }

  return (
    <div className="gh-contribution-wrapper">
      <div className="gh-main-content">
        <div className="gh-header">
          <span>{totalContributions} contributions in {selectedYear}</span>
        </div>

        <div className="gh-calendar-card">
          <CalendarHeatmap
            startDate={new Date(`${selectedYear}-01-01`)}
            endDate={new Date(`${selectedYear}-12-31`)}
            values={filteredData}
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
