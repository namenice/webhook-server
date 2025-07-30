import React, { useState } from 'react';
import './styles.css'; // Import the main CSS file

// Import the page components
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ResourcesPage from './pages/ResourcesPage';

// App Component: The main container for the dashboard and navigation.
export default function App() {
  const [currentPage, setCurrentPage] = useState('overview');

  // Function to render the current page based on state
  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Dashboard />;
      case 'history':
        return <History />;
      case 'resources':
        return <ResourcesPage />;
      default:
        return <Dashboard />; // Default to Dashboard if an unknown page is set
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* Adjusted Alert Dashboard title styling */}
        <div className="sidebar-title">
          {/* Using a more prominent icon and a different color scheme */}
          <svg xmlns="http://www.w3.org/2000/svg" className="icon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-blue">Alert</span> <br />
          <span className="text-yellow">Dashboard</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                onClick={() => setCurrentPage('overview')}
                className={`sidebar-nav-button ${currentPage === 'overview' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Alert Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage('history')}
                className={`sidebar-nav-button ${currentPage === 'history' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2-3-.895-3-2 1.343-2 3-2zM12 18h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                </svg>
                Alert History
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage('resources')}
                className={`sidebar-nav-button ${currentPage === 'resources' ? 'active' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Resources
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="header-section">
          <h1 className="header-title">
            {/* Dynamic header text based on currentPage */}
            {currentPage === 'overview' && 'Alert Overview'}
            {currentPage === 'history' && 'Alert History'}
            {currentPage === 'resources' && 'System Resources'}
          </h1>
          {/* Buttons or user info can go here */}
          <div className="header-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        {renderPage()} {/* Render the current page */}
      </main>
    </div>
  );
}

