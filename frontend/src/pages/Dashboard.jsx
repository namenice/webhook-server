import React, { useState, useEffect } from 'react';

// Helper function to format ISO date strings
const formatDateTime = (isoString) => {
  if (isoString === '0001-01-01T00:00:00Z' || !isoString) {
    return '-';
  }
  const date = new Date(isoString);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
  return date.toLocaleString('en-US', options);
};

// API base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:4000';

// Dashboard Component: Displays a summary of firing and resolved alerts.
function Dashboard() {
  const [counts, setCounts] = useState({ firing: 0, resolved: 0 });
  const [clusterCounts, setClusterCounts] = useState([]); // New state for cluster counts
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch overall counts
        const countsResponse = await fetch(`${API_BASE_URL}/api/alerts/history/counts`);
        if (!countsResponse.ok) {
          throw new Error(`HTTP error! status: ${countsResponse.status} for counts`);
        }
        const countsData = await countsResponse.json();
        setCounts(countsData);

        // Fetch cluster counts
        const clusterResponse = await fetch(`${API_BASE_URL}/api/alerts/history/cluster-counts`); // NEW API Endpoint
        if (!clusterResponse.ok) {
          throw new Error(`HTTP error! status: ${clusterResponse.status} for cluster-counts`);
        }
        const clusterData = await clusterResponse.json();
        setClusterCounts(clusterData);

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(`Failed to load dashboard data: ${err.message}. Please check your backend.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]); // Dependency on API_BASE_URL

  if (isLoading) {
    return (
      <section className="dashboard-section loading">
        <div className="loading-indicator">
          <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="loading-text">Loading Dashboard...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-section error">
        <p className="error-message">{error}</p>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      {/* Overall Alert Counts */}
      <div className="overall-counts-container"> {/* New div to group overall counts */}
        <div className="alert-card firing">
          <p className="alert-card-title">Firing Alerts</p>
          <p className="alert-card-count">{counts.firing}</p>
        </div>
        <div className="alert-card resolved">
          <p className="alert-card-title">Resolved Alerts</p>
          <p className="alert-card-count">{counts.resolved}</p>
        </div>
      </div>

      {/* Cluster Alert Counts Table */}
      <div className="cluster-counts-container">
        <h3 className="cluster-counts-title">Alerts by Cluster</h3>
        {clusterCounts.length > 0 ? (
          <div className="table-wrapper"> {/* Reusing table-wrapper for styling */}
            <table className="cluster-alert-table">
              <thead>
                <tr>
                  <th className="cluster-table-header">Cluster</th>
                  <th className="cluster-table-header text-center">Firing</th>
                  <th className="cluster-table-header text-center">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {clusterCounts.map((cluster, index) => (
                  <tr key={index}>
                    <td className="cluster-table-cell cluster-name-cell">{cluster.cluster || 'Unknown Cluster'}</td>
                    <td className="cluster-table-cell text-center">
                      <span className="cluster-firing-count">{cluster.firingCount || 0}</span>
                    </td>
                    <td className="cluster-table-cell text-center">
                      <span className="cluster-resolved-count">{cluster.resolvedCount || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-cluster-data">No cluster data available.</p>
        )}
      </div>
    </section>
  );
}

export default Dashboard;

