import React, { useState, useMemo, useEffect, useCallback } from 'react';
import repositories from '../data/repositories.json';

// GitHub token from environment (optional, for higher rate limits)
const GITHUB_TOKEN = process.env.GATSBY_GITHUB_TOKEN;

// Define product tabs as a constant outside component
const productTabs = [
  { id: 'all', shortLabel: 'All', label: 'All', category: null },
  { id: 'odm', shortLabel: 'ODM', label: 'Operational Decision Manager', category: 'odm' },
  { id: 'decision-intelligence', shortLabel: 'DI', label: 'Decision Intelligence', category: 'decision-intelligence' },
  { id: 'bai', shortLabel: 'BAI', label: 'Business Automation Insight', category: 'bai' },
  { id: 'cp4ba', shortLabel: 'CP4BA', label: 'Cloud Pak for Business Automation', category: 'cp4ba' },
  { id: 'other', shortLabel: 'Other', label: 'Other', category: 'other' }
];

const RepositoryBrowser = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState([]); // Changed to array for multiple selection
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByStars, setSortByStars] = useState(false); // Toggle for star sorting
  const [expandedRepo, setExpandedRepo] = useState(null); // Track which repo is expanded
  const [readmeCache, setReadmeCache] = useState({}); // Cache README content
  const [loadingReadme, setLoadingReadme] = useState(null); // Track loading state
  const [copiedRepo, setCopiedRepo] = useState(null); // Track which repo link was copied

  // Helper function to extract repository name from GitHub URL
  const getRepoId = (url) => {
    const match = url.match(/github\.com\/[^/]+\/([^/]+)/);
    return match ? match[1] : null;
  };

  // Helper function to copy link to clipboard
  const copyRepoLink = useCallback((repo, e) => {
    e.stopPropagation();
    const repoId = getRepoId(repo.url);
    if (repoId) {
      const url = `${window.location.origin}${window.location.pathname}#${repoId}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedRepo(repoId);
        setTimeout(() => setCopiedRepo(null), 2000);
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    }
  }, []);

  // Handle URL hash changes for navigation (both product tabs and repository deep links)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      // Check if hash is a product tab
      if (hash && productTabs.find(tab => tab.id === hash)) {
        setActiveTab(hash);
        // Reset filters when changing tabs
        setComponentFilter('all');
        setTopicFilter([]);
        setSearchTerm('');
      } else if (!hash) {
        setActiveTab('all');
        // Reset filters when going to all
        setComponentFilter('all');
        setTopicFilter([]);
        setSearchTerm('');
      } else if (hash) {
        // Check if hash is a repository ID
        const repo = repositories.find(r => getRepoId(r.url) === hash);
        if (repo) {
          // Expand the repository
          setExpandedRepo(repo.name);
          // Scroll to the repository after a short delay to ensure it's rendered
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Add a temporary highlight effect
              element.style.transition = 'background-color 0.5s';
              element.style.backgroundColor = '#e8f4fd';
              setTimeout(() => {
                element.style.backgroundColor = '';
              }, 2000);
            }
          }, 100);
        }
      }
    };

    // Set initial tab/repo from hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Also listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleHashChange);
    
    // Poll for hash changes (for Gatsby Link clicks that don't trigger hashchange)
    const pollInterval = setInterval(() => {
      const currentHash = window.location.hash.replace('#', '');
      const expectedHash = activeTab === 'all' ? '' : activeTab;
      if (currentHash !== expectedHash && !repositories.find(r => getRepoId(r.url) === currentHash)) {
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

  // Extract unique filter values from categories and topics based on current filters
  const filters = useMemo(() => {
    const components = new Set();
    const topics = new Set();

    // Filter repositories based on active product tab and current filters
    const activeProduct = productTabs.find(tab => tab.id === activeTab);
    const dynamicFilteredRepos = repositories.filter(repo => {
      // Product filter
      let matchesProduct = false;
      if (activeTab === 'all') {
        matchesProduct = true;
      } else if (activeTab === 'other') {
        matchesProduct = !repo.categories || repo.categories.products.length === 0;
      } else if (repo.categories && repo.categories.products) {
        matchesProduct = repo.categories.products.includes(activeProduct.category);
      }

      // Component filter (only apply if not 'all')
      const matchesComponent = componentFilter === 'all' ||
        (repo.categories && repo.categories.components.includes(componentFilter));

      // Topic filter (only apply if array is not empty) - must have ALL selected topics
      const matchesTopic = topicFilter.length === 0 ||
        (repo.topics && topicFilter.every(topic => repo.topics.includes(topic)));

      // Search filter
      const matchesSearch = searchTerm === '' ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesProduct && matchesComponent && matchesTopic && matchesSearch;
    });

    // Extract components and topics from dynamically filtered repositories
    dynamicFilteredRepos.forEach(repo => {
      if (repo.categories) {
        repo.categories.components.forEach(comp => components.add(comp));
      }
      if (repo.topics) {
        repo.topics.forEach(topic => topics.add(topic));
      }
    });

    return {
      components: Array.from(components).sort(),
      topics: Array.from(topics).sort()
    };
  }, [activeTab, componentFilter, topicFilter, searchTerm]);

  // Filter and sort repositories
  const filteredRepos = useMemo(() => {
    const filtered = repositories.filter(repo => {
      const activeProduct = productTabs.find(tab => tab.id === activeTab);
      
      // Handle product filtering with categories
      let matchesProduct = false;
      if (activeTab === 'all') {
        matchesProduct = true;
      } else if (activeTab === 'other') {
        // "Other" tab shows repos without any product categorization
        matchesProduct = !repo.categories || repo.categories.products.length === 0;
      } else if (repo.categories && repo.categories.products) {
        matchesProduct = repo.categories.products.includes(activeProduct.category);
      }
      
      // Handle component and topic filtering
      const matchesComponent = componentFilter === 'all' ||
        (repo.categories && repo.categories.components.includes(componentFilter));
      const matchesTopic = topicFilter.length === 0 ||
        (repo.topics && topicFilter.every(topic => repo.topics.includes(topic)));
      
      const matchesSearch = searchTerm === '' ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesProduct && matchesComponent && matchesTopic && matchesSearch;
    });

    // Sort repositories
    const sorted = [...filtered].sort((a, b) => {
      if (sortByStars) {
        // Sort by stars (descending), then by name
        const starDiff = (b.stars || 0) - (a.stars || 0);
        return starDiff !== 0 ? starDiff : a.name.localeCompare(b.name);
      } else {
        // Sort alphabetically
        return a.name.localeCompare(b.name);
      }
    });

    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, componentFilter, topicFilter, searchTerm, sortByStars]);

  // Count repos per product
  const productCounts = useMemo(() => {
    const counts = {};
    productTabs.forEach(tab => {
      if (tab.id === 'all') {
        counts[tab.id] = repositories.length;
      } else if (tab.id === 'other') {
        // Count repos without any product categorization
        counts[tab.id] = repositories.filter(repo =>
          !repo.categories || repo.categories.products.length === 0
        ).length;
      } else {
        counts[tab.id] = repositories.filter(repo =>
          repo.categories && repo.categories.products.includes(tab.category)
        ).length;
      }
    });
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCategoryLabel = (category) => {
    return category.replace(/-/g, ' ');
  };

  // Fetch README content from GitHub (HTML version for better rendering)
  const fetchReadme = useCallback(async (repoName) => {
    // Check cache first
    if (readmeCache[repoName]) {
      return readmeCache[repoName];
    }

    setLoadingReadme(repoName);
    
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3.html' // Get HTML version
      };
      
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/DecisionsDev/${repoName}/readme`,
        { headers }
      );

      if (response.ok) {
        const htmlContent = await response.text();
        
        // Create a temporary div to parse HTML and get text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Get first several elements or up to 2500 characters
        const elements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, ul, ol, pre, blockquote, table');
        let preview = '';
        let charCount = 0;
        const maxChars = 2500;
        const maxElements = 15;
        
        for (let i = 0; i < Math.min(elements.length, maxElements) && charCount < maxChars; i++) {
          const element = elements[i];
          preview += element.outerHTML;
          charCount += element.textContent.length;
        }
        
        if (charCount >= maxChars || elements.length > maxElements) {
          preview += '<p style="color: #666; font-style: italic;">...</p>';
        }
        
        setReadmeCache(prev => ({
          ...prev,
          [repoName]: preview
        }));
        
        setLoadingReadme(null);
        return preview;
      } else {
        setLoadingReadme(null);
        // Return null for failed fetches (403, 404, etc.) so we don't show empty section
        setReadmeCache(prev => ({
          ...prev,
          [repoName]: null
        }));
        return null;
      }
    } catch (error) {
      console.error('Error fetching README:', error);
      setLoadingReadme(null);
      // Return null for errors so we don't show empty section
      setReadmeCache(prev => ({
        ...prev,
        [repoName]: null
      }));
      return null;
    }
  }, [readmeCache]);

  // Toggle README preview and update URL hash
  const toggleReadme = async (repoName) => {
    const repo = repositories.find(r => r.name === repoName);
    const repoId = repo ? getRepoId(repo.url) : null;
    
    if (expandedRepo === repoName) {
      setExpandedRepo(null);
      // Remove hash when collapsing
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    } else {
      // Try to fetch README if not in cache
      if (!readmeCache[repoName]) {
        const readmeContent = await fetchReadme(repoName);
        // Only expand if README was successfully fetched
        if (readmeContent !== null) {
          setExpandedRepo(repoName);
          // Update hash when expanding
          if (repoId) {
            window.history.pushState(null, '', `#${repoId}`);
          }
        }
        // If README fetch failed (null), don't expand
      } else if (readmeCache[repoName] !== null) {
        // Only expand if cached README is not null (meaning it was successful)
        setExpandedRepo(repoName);
        // Update hash when expanding
        if (repoId) {
          window.history.pushState(null, '', `#${repoId}`);
        }
      }
      // If cached README is null, don't expand
    }
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
        {productTabs
          .filter(tab => (productCounts[tab.id] || 0) > 0)
          .map(tab => (
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
                {formatCategoryLabel(component)}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Topic badges filter */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1rem' }}>
          Topics {topicFilter.length > 0 && <span style={{ color: '#666', fontWeight: 'normal' }}>({topicFilter.length} selected)</span>}
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => setTopicFilter([])}
            style={{
              padding: '0.25rem 0.75rem',
              border: topicFilter.length === 0 ? '2px solid #0f62fe' : '1px solid #ccc',
              backgroundColor: topicFilter.length === 0 ? '#0f62fe' : '#fff',
              color: topicFilter.length === 0 ? '#fff' : '#333',
              borderRadius: '16px',
              fontSize: '0.8rem',
              fontWeight: topicFilter.length === 0 ? 'bold' : 'normal',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (topicFilter.length !== 0) {
                e.currentTarget.style.backgroundColor = '#f4f4f4';
              }
            }}
            onMouseLeave={(e) => {
              if (topicFilter.length !== 0) {
                e.currentTarget.style.backgroundColor = '#fff';
              }
            }}
          >
            All Topics
          </button>
          {filters.topics.map(topic => {
            const isSelected = topicFilter.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => {
                  if (isSelected) {
                    setTopicFilter(topicFilter.filter(t => t !== topic));
                  } else {
                    setTopicFilter([...topicFilter, topic]);
                  }
                }}
                style={{
                  padding: '0.25rem 0.75rem',
                  border: isSelected ? '2px solid #24a148' : '1px solid #ccc',
                  backgroundColor: isSelected ? '#24a148' : '#fff',
                  color: isSelected ? '#fff' : '#333',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f4f4f4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }
                }}
              >
                {formatCategoryLabel(topic)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count and sort toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ margin: 0, color: '#666' }}>
          Showing {filteredRepos.length} of {productCounts[activeTab] || 0} repositories
        </p>
        <button
          onClick={() => setSortByStars(!sortByStars)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #0f62fe',
            backgroundColor: sortByStars ? '#0f62fe' : '#fff',
            color: sortByStars ? '#fff' : '#0f62fe',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!sortByStars) {
              e.currentTarget.style.backgroundColor = '#f4f4f4';
            }
          }}
          onMouseLeave={(e) => {
            if (!sortByStars) {
              e.currentTarget.style.backgroundColor = '#fff';
            }
          }}
        >
          {sortByStars ? '⭐ Sorted by Stars' : '🔤 Sorted A-Z'}
        </button>
      </div>

      {/* Repository list */}
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredRepos.map(repo => {
          const repoId = getRepoId(repo.url);
          const isCopied = copiedRepo === repoId;
          
          return (
            <div
              key={repo.name}
              id={repoId}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#fff',
                transition: 'box-shadow 0.2s, background-color 0.5s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', cursor: 'pointer' }}
                 onClick={() => toggleReadme(repo.name)}>
              <h3 style={{ margin: 0, flex: 1 }}>
                <span style={{ color: '#0f62fe' }}>
                  {repo.name}
                </span>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  {expandedRepo === repo.name ? '▼' : '▶'}
                </span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {repo.stars > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: '#666',
                    fontSize: '0.875rem'
                  }}>
                    <span style={{ fontSize: '1rem' }}>⭐</span>
                    <span>{repo.stars}</span>
                  </div>
                )}
                <button
                  onClick={(e) => copyRepoLink(repo, e)}
                  title="Copy link to this repository"
                  style={{
                    color: isCopied ? '#24a148' : '#0f62fe',
                    backgroundColor: 'transparent',
                    border: `1px solid ${isCopied ? '#24a148' : '#0f62fe'}`,
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCopied) {
                      e.currentTarget.style.backgroundColor = '#f4f4f4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {isCopied ? '✓ Copied!' : '📋 Share'}
                </button>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: '#0f62fe',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    padding: '0.25rem 0.5rem',
                    border: '1px solid #0f62fe',
                    borderRadius: '4px'
                  }}
                >
                  View on GitHub →
                </a>
              </div>
            </div>
            
            {repo.description && (
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                {repo.description}
              </p>
            )}

            {/* README Preview */}
            {expandedRepo === repo.name && (
              <div style={{
                marginTop: '1rem',
                padding: '1.5rem',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderLeft: '4px solid #0f62fe',
                borderRadius: '4px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                {loadingReadme === repo.name ? (
                  <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>Loading README preview...</p>
                ) : readmeCache[repo.name] ? (
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{
                        margin: 0,
                        marginBottom: '1rem',
                        color: '#333',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        paddingBottom: '0.5rem',
                        borderBottom: '2px solid #e0e0e0'
                      }}>
                        README Preview
                      </h4>
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        color: '#333'
                      }}
                      dangerouslySetInnerHTML={{ __html: readmeCache[repo.name] }}
                    />
                    <div style={{
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e0e0e0'
                    }}>
                      <a
                        href={`${repo.url}#readme`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#0f62fe',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          textDecoration: 'none'
                        }}
                      >
                        Read full README on GitHub →
                      </a>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {repo.topics.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {repo.topics.map(topic => {
                  // Structured topics (without prefixes)
                  const structuredTopics = [
                    // Products
                    'odm', 'decision-intelligence', 'bai', 'cp4ba',
                    // Components
                    'decisioncenter', 'ruleexecutionserver', 'dsi', 'container', 'ai', 'designer', 'analytics', 'events'
                  ];
                  const isStructured = structuredTopics.includes(topic);
                  const isSelected = topicFilter.includes(topic);
                  return (
                    <span
                      key={topic}
                      style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        backgroundColor: isSelected ? '#24a148' : (isStructured ? '#0f62fe' : '#e0e0e0'),
                        color: (isSelected || isStructured) ? '#fff' : '#333',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: (isSelected || isStructured) ? 'bold' : 'normal',
                        border: isSelected ? '2px solid #1e8e3e' : 'none'
                      }}
                    >
                      {topic}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
        })}
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
