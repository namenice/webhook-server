import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import './History.css';

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

function History() {
  const [openDetailsIndex, setOpenDetailsIndex] = useState(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const dropdownRef = useRef(null);

  // New filter states
  const [filterField, setFilterField] = useState('labels.alertname'); // Default filter field
  const [filterValue, setFilterValue] = useState(''); // User input for filter

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // State for error messages

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState(null);

  const [alerts, setAlerts] = useState([]); // Initialize alerts as an empty array

  const actionButtonRefs = useRef([]); // Ref to store action buttons for dropdown positioning

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/alerts/history/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Parse JSON strings back to objects for 'labels', 'annotations' and 'channelNoti'
      const parsedAlerts = data.map(alert => ({
        ...alert,
        labels: alert.labels ? JSON.parse(alert.labels) : {},
        annotations: alert.annotations ? JSON.parse(alert.annotations) : {},
        // Parse channelNoti string back to an array of objects
        channelNoti: alert.channelNoti ? JSON.parse(alert.channelNoti) : []
      }));
      setAlerts(parsedAlerts);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError(`Failed to load alerts: ${err.message}. Please check your backend.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []); // Fetch alerts on component mount

  const toggleDetails = (index) => {
    setOpenDetailsIndex(openDetailsIndex === index ? null : index);
  };

  const toggleDropdown = (event, index) => {
    event.stopPropagation(); // Prevent row click from firing
    
    const newOpenDropdownIndex = openDropdownIndex === index ? null : index;
    setOpenDropdownIndex(newOpenDropdownIndex);

    // If opening, calculate position
    if (newOpenDropdownIndex === index && actionButtonRefs.current[index]) {
      const buttonRect = actionButtonRefs.current[index].getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 90; // Approximate height of the dropdown menu (e.g., 2 items * ~40px + padding)
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      let topPosition = buttonRect.height + 8; // Default: 8px below button
      let transformOrigin = 'top center'; // Default origin for animation

      // Check if there's enough space below, otherwise open upwards
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        topPosition = -(dropdownHeight + 8); // Position above the button
        transformOrigin = 'bottom center';
      }

      // Calculate left position for centering
      // Dropdown width is 12rem (192px) from styles.css
      const dropdownWidth = 192; 
      const leftPosition = (buttonRect.width / 2) - (dropdownWidth / 2);

      setDropdownStyle({
        top: `${topPosition}px`,
        left: `${leftPosition}px`,
        transformOrigin: transformOrigin
      });
    } else {
      setDropdownStyle({}); // Reset style when closing
    }
  };

  const handleResolveAlertClick = (event, alertId) => {
    event.stopPropagation();
    setAlertToResolve(alertId);
    setShowConfirmModal(true);
    setOpenDropdownIndex(null); // Close dropdown
  };

  const [dropdownStyle, setDropdownStyle] = useState({}); // State for dropdown position

  // This function now sends a request to the backend to resolve the alert
  const confirmResolve = async () => {
    if (alertToResolve) {
      setIsLoading(true); // Show Loading indicator
      setError(null); // Clear previous error
      try {
        const resolveUrl = `${API_BASE_URL}/api/alerts/history/resolve/${alertToResolve}`;
        
        const response = await fetch(resolveUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to resolve alert: ${response.status} ${response.statusText} - ${errorText}`);
        }

        await fetchAlerts(); // Re-fetch alerts to update UI
        
        setAlertToResolve(null);
        setShowConfirmModal(false);

      } catch (err) {
        console.error("Error resolving alert:", err);
        setError(`Failed to resolve alert: ${err.message || 'Network error'}. Please try again.`);
        await fetchAlerts(); // Even on error, try to refresh data in case of partial update
      } finally {
        setIsLoading(false); // Hide Loading indicator
      }
    }
  };

  const cancelResolve = () => {
    setAlertToResolve(null);
    setShowConfirmModal(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const filteredAlerts = useMemo(() => {
    if (!Array.isArray(alerts)) {
      return [];
    }

    if (!filterValue) { // If no filter value, return all alerts
      return alerts;
    }

    const lowerCaseFilterValue = filterValue.toLowerCase();

    return alerts.filter(alert => {
      let valueToMatch = '';

      switch (filterField) {
        case 'labels.alertname':
          valueToMatch = alert.labels?.alertname || '';
          break;
        case 'labels.instance':
          valueToMatch = alert.labels?.instance || '';
          break;
        case 'labels.cluster':
          valueToMatch = alert.labels?.cluster || 'unknown'; // Default for cluster
          break;
        case 'labels.severity':
          valueToMatch = alert.labels?.severity || '';
          break;
        case 'status':
          valueToMatch = alert.status || '';
          break;
        case 'annotations.summary':
          valueToMatch = alert.annotations?.summary || '';
          break;
        case 'startsAt':
        case 'endsAt':
          // For dates, try to match the formatted string or ISO string
          const dateValue = alert[filterField];
          if (dateValue && dateValue !== '0001-01-01T00:00:00Z') {
            const dateObj = new Date(dateValue);
            // Match against both locale string (e.g., "Jul 29, 2025, 16:01") and original ISO string
            valueToMatch = dateObj.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + ' ' + dateValue;
          } else {
            valueToMatch = '-'; // Match placeholder for empty/invalid dates
          }
          break;
        default:
          valueToMatch = ''; // Should not happen with defined filter fields
      }
      
      return String(valueToMatch).toLowerCase().includes(lowerCaseFilterValue);
    });
  }, [alerts, filterField, filterValue]); // Dependencies adjusted

  const sortedAlerts = useMemo(() => {
    let sortableItems = [...filteredAlerts];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;
        // Handle nested properties for sorting
        if (sortConfig.key.includes('.')) {
          const [prop1, prop2] = sortConfig.key.split('.');
          aValue = a[prop1]?.[prop2];
          bValue = b[prop1]?.[prop2];
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        // Specific handling for 'labels.cluster' to treat 'unknown' consistently
        if (sortConfig.key === 'labels.cluster') {
          aValue = String(aValue || 'unknown').toLowerCase();
          bValue = String(bValue || 'unknown').toLowerCase();
        } else {
          // General handling for undefined/null values by treating them as empty strings for comparison
          aValue = String(aValue || '').toLowerCase(); // Convert to string and handle null/undefined
          bValue = String(bValue || '').toLowerCase(); // Convert to string and handle null/undefined
        }
        
        if (sortConfig.key === 'startsAt' || sortConfig.key === 'endsAt') {
          // Parse dates for accurate comparison, handle invalid dates by setting them to a min/max value
          aValue = (aValue && aValue !== '0001-01-01T00:00:00Z') ? new Date(aValue) : new Date(0); // Epoch or min date
          bValue = (bValue && bValue !== '0001-01-01T00:00:00Z') ? new Date(bValue) : new Date(0);

          if (isNaN(aValue.getTime())) aValue = new Date(0); // If parsing failed, treat as epoch
          if (isNaN(bValue.getTime())) bValue = new Date(0); // If parsing failed, treat as epoch
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredAlerts, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  useEffect(() => {
    // Only show loading spinner on initial fetch or when filters/sort change, not just data update
    if (alerts.length === 0 && !error) { // Only set isLoading if no alerts and no previous error
       setIsLoading(true);
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Simulate loading delay
    return () => clearTimeout(timer);
  }, [filterField, filterValue, sortConfig, alerts]); // Keep alerts in dependency for re-sort/filter on data change


  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    return null;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAlerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAlerts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search/filters change
  }, [filterField, filterValue]); // Reset page when filter field or value changes

  // Function to format filter field name for placeholder
  const getFilterPlaceholder = (field) => {
    // Convert field name like 'labels.alertname' to 'Alert Name'
    const parts = field.split('.');
    let name = parts[parts.length - 1]; // Get last part (e.g., alertname)
    name = name.replace(/([A-Z])/g, ' $1'); // Add space before capital letters
    name = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize first letter
    if (name === 'Alertname') return 'Alert Name'; // Specific override for 'alertname'
    if (name === 'Instance') return 'Instance';
    if (name === 'Severity') return 'Severity';
    if (name === 'Status') return 'Status';
    if (name === 'Cluster') return 'Cluster';
    if (name === 'Summary') return 'Summary';
    if (name === 'Starts At') return 'Starts At';
    if (name === 'Ends At') return 'Ends At';
    return name;
  };


  return (
    <section className="history-section">
      <h2 className="header-title">
        {/* No fixed header here */}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="filter-controls">
        {/* New Select for Filter Field */}
        <select
          className="filter-select"
          value={filterField}
          onChange={(e) => {
            setFilterField(e.target.value);
            setFilterValue(''); // Clear filter value when field changes
          }}
        >
          <option value="labels.alertname">Alert Name</option>
          <option value="labels.instance">Instance</option>
          <option value="labels.cluster">Cluster</option>
          <option value="labels.severity">Severity</option>
          <option value="status">Status</option>
          <option value="startsAt">Starts At</option>
          <option value="endsAt">Ends At</option>
          <option value="annotations.summary">Summary</option>
        </select>

        {/* New Input for Filter Value */}
        <input
          type="text"
          placeholder={`Search by ${getFilterPlaceholder(filterField)}`}
          className="filter-input"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        
        <select
          className="filter-select"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
      </div>

      <div className="table-wrapper">
        {isLoading ? (
          <div className="loading-indicator">
            <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="loading-text">Loading Alerts...</p>
          </div>
        ) : (
          <table className="alert-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell" onClick={() => requestSort('labels.alertname')}>
                  Alert Name <span className="sort-arrow">{getSortArrow('labels.alertname')}</span>
                </th>
                <th className="table-header-cell" onClick={() => requestSort('labels.instance')}>
                  Instance <span className="sort-arrow">{getSortArrow('labels.instance')}</span>
                </th>
                {/* NEW: Cluster Header */}
                <th className="table-header-cell" onClick={() => requestSort('labels.cluster')}>
                  Cluster <span className="sort-arrow">{getSortArrow('labels.cluster')}</span>
                </th>
                <th className="table-header-cell" onClick={() => requestSort('labels.severity')}>
                  Severity <span className="sort-arrow">{getSortArrow('labels.severity')}</span>
                </th>
                <th className="table-header-cell" onClick={() => requestSort('status')}>
                  Status <span className="sort-arrow">{getSortArrow('status')}</span>
                </th>
                <th className="table-header-cell" onClick={() => requestSort('startsAt')}>
                  Starts At <span className="sort-arrow">{getSortArrow('startsAt')}</span>
                </th>
                <th className="table-header-cell" onClick={() => requestSort('endsAt')}>
                  Ends At <span className="sort-arrow">{getSortArrow('endsAt')}</span>
                </th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-alerts-message">No alerts found matching your criteria.</td> {/* Updated colspan */}
                </tr>
              ) : (
                currentItems.map((alert, index) => (
                  <React.Fragment key={alert.id || index}>
                    <tr
                      className="table-row-clickable"
                      onClick={() => toggleDetails(index)}
                    >
                      <td className="table-cell">{alert.labels?.alertname || '-'}</td>
                      <td className="table-cell">{alert.labels?.instance || '-'}</td>
                      {/* NEW: Cluster Cell */}
                      <td className="table-cell">{alert.labels?.cluster || 'unknown'}</td>
                      <td className="table-cell">
                        <span className={`severity-badge ${alert.labels?.severity || 'info'}`}>
                          {alert.labels?.severity || 'unknown'}
                        </span>
                      </td>
                      <td className={`table-cell ${alert.status === 'firing' ? 'status-firing' : 'status-resolved'}`}>
                        {alert.status === 'firing' ? 'Firing' : 'Resolved'}
                      </td>
                      <td className="table-cell">{formatDateTime(alert.startsAt)}</td>
                      <td className="table-cell">{formatDateTime(alert.endsAt)}</td>
                      <td className="table-cell action-cell" ref={openDropdownIndex === index ? dropdownRef : null}>
                        <button
                          onClick={(e) => toggleDropdown(e, index)}
                          ref={el => actionButtonRefs.current[index] = el}
                          className="action-button"
                        >
                          Actions
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {openDropdownIndex === index && (
                          <div className="dropdown-menu" style={dropdownStyle}>
                            <div className="py-1">
                              {alert.status === 'firing' && (
                                <button
                                  onClick={(e) => handleResolveAlertClick(e, alert.id)}
                                  className="dropdown-item"
                                >
                                  Resolve Alert
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                    {openDetailsIndex === index && (
                      <tr className="bg-gray-50 border-t border-gray-200 details-row">
                        <td colSpan="8"> {/* Updated colspan */}
                          <div className="details-content">
                            {/* Labels Section */}
                            {alert.labels && Object.keys(alert.labels).length > 0 && (
                            <div>
                              <p className="title">Labels:</p>
                              <ul>
                                {Object.entries(alert.labels).map(([key, value]) => (
                                  <li key={key}><strong>{key}:</strong> {String(value)}</li>
                                ))}
                              </ul>
                            </div>
                            )}
                            {/* Annotations Section */}
                            {alert.annotations && Object.keys(alert.annotations).length > 0 && (
                            <div>
                              <p className="title">Annotations:</p>
                              <ul>
                                {Object.entries(alert.annotations).map(([key, value]) => (
                                  <li key={key}><strong>{key}:</strong> {String(value)}</li>
                                ))}
                              </ul>
                            </div>
                            )}
                            {/* Generator URL Section */}
                            {alert.generatorURL && alert.generatorURL !== '#' && alert.generatorURL !== 'N/A' && (
                            <div>
                              <p className="title">Generator URL:</p>
                              <a href={alert.generatorURL} target="_blank" rel="noopener noreferrer">
                                {alert.generatorURL}
                              </a>
                            </div>
                            )}
                            {/* Channel Notification Section */}
                            {alert.channelNoti && alert.channelNoti.length > 0 && (
                              <div>
                                <p className="title">Channel Notifications:</p>
                                <ul>
                                  {alert.channelNoti.map((channel, idx) => (
                                    <li key={idx}>
                                      <strong>{channel.notifier || 'Unknown'}:</strong>{' '}
                                      <span className={channel.success ? 'text-green-600' : 'text-red-600'}>
                                        {channel.success ? 'Success' : 'Failed'}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && sortedAlerts.length > 0 && (
        <div className="pagination-controls">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <div className="pagination-pages">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`page-number-button ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirm Alert Resolution</h3>
            <p className="modal-message">Are you sure you want to manually resolve this alert? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={cancelResolve}
                className="modal-button cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmResolve}
                className="modal-button resolve"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default History;

