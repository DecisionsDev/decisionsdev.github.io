import React, { useState, useMemo, useEffect } from 'react';
import repositories from '../data/repositories.json';

// Define product tabs as a constant outside component
const productTabs = [
  { id: 'all', shortLabel: 'All', label: 'All', topic: null },
  { id: 'odm', shortLabel: 'ODM', label: 'Operational Decision Manager', topic: 'product-odm' },
  { id: 'decision-intelligence', shortLabel: 'DI', label: 'Decision Intelligence', topic: 'product-decision-intelligence' },
  { id: 'bai', shortLabel: 'BAI', label: 'Business Automation Insight', topic: 'product-bai' },
  { id: 'cp4ba', shortLabel: 'CP4BA', label: 'Cloud Pak for Business Automation', topic: 'product-cp4ba' }
];

const RepositoryBrowser = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Handle URL hash changes for navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && productTabs.find(tab => tab.id === hash)) {
        setActiveTab(hash);
        // Reset filters when changing tabs
        setComponentFilter('all');
        setTypeFilter('all');
        setSearchTerm('');
      } else if (!hash) {
        setActiveTab('all');
        // Reset filters when going to all
        setComponentFilter('all');
        setTypeFilter('all');
        setSearchTerm('');
      }
    };

    // Set initial tab from hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Also listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleHashChange);
    
    // Poll for hash changes (for Gatsby Link clicks that don't trigger hashchange)
    const pollInterval = setInterval(() => {
      const currentHash = window.location.hash.replace('#', '');
      const expectedHash = activeTab === 'all' ? '' : activeTab;
      if (currentHash !== expectedHash) {
        handleHashChange();
      }
    }, 100);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Update URL hash when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId === 'all' ? '' : tabId;
  };

  // Extract unique filter values
  const filters = useMemo(() => {
    const components = new Set();
    const types = new Set();

    repositories.forEach(repo => {
      repo.topics.forEach(topic => {
        if (topic.startsWith('comp-')) components.add(topic);
        if (topic.startsWith('type-')) types.add(topic);
      });
    });

    return {
      components: Array.from(components).sort(),
      types: Array.from(types).sort()
    };
  }, []);

  // Filter repositories
  const filteredRepos = useMemo(() => {
    return repositories.filter(repo => {
      const activeProduct = productTabs.find(tab => tab.id === activeTab);
      const matchesProduct = activeTab === 'all' || repo.topics.includes(activeProduct.topic);
      const matchesComponent = componentFilter === 'all' || repo.topics.includes(componentFilter);
      const matchesType = typeFilter === 'all' || repo.topics.includes(typeFilter);
      const matchesSearch = searchTerm === '' ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesProduct && matchesComponent && matchesType && matchesSearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, componentFilter, typeFilter, searchTerm]);

  // Count repos per product
  const productCounts = useMemo(() => {
    const counts = {};
    productTabs.forEach(tab => {
      if (tab.id === 'all') {
        counts[tab.id] = repositories.length;
      } else {
        counts[tab.id] = repositories.filter(repo => repo.topics.includes(tab.topic)).length;
      }
    });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTopicLabel = (topic) => {
    return topic.replace(/^(product|comp|type)-/, '').replace(/-/g, ' ').toUpperCase();
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Product Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #e0e0e0',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        {productTabs.map(tab => (
          <button
            key={tab.id}
            title={tab.label}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === tab.id ? '3px solid #0f62fe' : '3px solid transparent',
              color: activeTab === tab.id ? '#0f62fe' : '#666',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#0f62fe';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            {tab.shortLabel} ({productCounts[tab.id] || 0})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f4f4f4',
        borderRadius: '4px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories..."
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Component
          </label>
          <select
            value={componentFilter}
            onChange={(e) => setComponentFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="all">All Components</option>
            {filters.components.map(component => (
              <option key={component} value={component}>
                {formatTopicLabel(component)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="all">All Types</option>
            {filters.types.map(type => (
              <option key={type} value={type}>
                {formatTopicLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Showing {filteredRepos.length} of {repositories.length} repositories
      </p>

      {/* Repository list */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredRepos.map(repo => (
          <div
            key={repo.name}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1.5rem',
              backgroundColor: '#fff',
              transition: 'box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0f62fe', textDecoration: 'none' }}
              >
                {repo.name}
              </a>
            </h3>
            
            {repo.description && (
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                {repo.description}
              </p>
            )}

            {repo.topics.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {repo.topics.map(topic => {
                  const isStructured = topic.startsWith('product-') || 
                                      topic.startsWith('comp-') || 
                                      topic.startsWith('type-');
                  return (
                    <span
                      key={topic}
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: isStructured ? '#0f62fe' : '#e0e0e0',
                        color: isStructured ? '#fff' : '#333',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: isStructured ? 'bold' : 'normal'
                      }}
                    >
                      {topic}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#666',
          backgroundColor: '#f4f4f4',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No repositories found</p>
          <p>Try adjusting your filters or search term</p>
        </div>
      )}
    </div>
  );
};

export default RepositoryBrowser;

// Made with Bob
