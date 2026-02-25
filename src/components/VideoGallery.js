import React, { useState } from 'react';
import videos from '../data/videos.json';

const VideoGallery = () => {
  // Group videos by repository
  const videosByRepo = videos.reduce((acc, video) => {
    if (!acc[video.repository]) {
      acc[video.repository] = [];
    }
    acc[video.repository].push(video);
    return acc;
  }, {});

  const formatRepoName = (repoName) => {
    const acronyms = ['ibm', 'odm', 'di', 'bai', 'cp4ba'];
    const words = repoName.split('-');
    return words
      .map((word, index) => {
        const lowerWord = word.toLowerCase();
        // Keep acronyms uppercase
        if (acronyms.includes(lowerWord)) {
          return word.toUpperCase();
        }
        // Capitalize only the first word
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        // All other words lowercase
        return word.toLowerCase();
      })
      .join(' ');
  };

  const formatVideoTitle = (video) => {
    // Extract filename without extension
    const fileName = video.fileName || video.filePath?.split('/').pop() || 'Video';
    const nameWithoutExt = fileName.replace(/\.(mp4|webm|mov|gif)$/i, '');
    
    // Convert underscores and hyphens to spaces, capitalize only first letter
    const formatted = nameWithoutExt.replace(/[_-]/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const renderVideo = (video, showFullPath = false) => {
    if (video.type === 'youtube') {
      return (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe
            src={video.embedUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`Video from ${video.repository}`}
          />
        </div>
      );
    } else if (video.type === 'github' || video.type === 'file') {
      // Check if it's a GIF file
      const isGif = video.fileName?.toLowerCase().endsWith('.gif') || video.filePath?.toLowerCase().endsWith('.gif');
      
      if (isGif) {
        return (
          <div>
            <img
              src={video.url}
              alt={video.fileName || 'Video'}
              style={{ width: '100%', maxHeight: '200px', borderRadius: '4px', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
            />
          </div>
        );
      } else {
        return (
          <div>
            <video
              controls
              style={{ width: '100%', maxHeight: '200px', borderRadius: '4px', backgroundColor: '#000' }}
              preload="metadata"
            >
              <source src={video.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }
    } else if (video.type === 'vimeo') {
      return (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe
            src={video.embedUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`Video from ${video.repository}`}
          />
        </div>
      );
    }
    return null;
  };

  const VideoCarousel = ({ videos, repoName, repoUrl }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const videosPerPage = 3;
    const totalPages = Math.ceil(videos.length / videosPerPage);

    const goToNext = () => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    };

    const goToPrevious = () => {
      setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages);
    };

    const goToPage = (page) => {
      setCurrentPage(page);
    };

    // Get videos for current page
    const startIndex = currentPage * videosPerPage;
    const currentVideos = videos.slice(startIndex, startIndex + videosPerPage);

    return (
      <div style={{ 
        marginBottom: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
            {formatRepoName(repoName)}
          </h3>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#0f62fe',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            View Repository →
          </a>
        </div>
        
        <div style={{ position: 'relative' }}>
          {/* Videos Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {currentVideos.map((video, index) => (
              <div key={startIndex + index} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#fff'
              }}>
                <h4 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '500' }}>
                  {formatVideoTitle(video)}
                </h4>
                {renderVideo(video, videos.length === 1)}
              </div>
            ))}
          </div>

          {/* Navigation Controls (only show if more than 3 videos) */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <button
                onClick={goToPrevious}
                style={{
                  backgroundColor: '#0f62fe',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
                aria-label="Previous page"
              >
                ← Previous
              </button>

              {/* Page Dots */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: currentPage === index ? '#0f62fe' : '#d0d0d0',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                style={{
                  backgroundColor: '#0f62fe',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}

          {/* Page Counter (only show if more than 3 videos) */}
          {totalPages > 1 && (
            <p style={{ 
              textAlign: 'center', 
              fontSize: '0.875rem', 
              color: '#666',
              marginTop: '0.5rem',
              marginBottom: 0
            }}>
              Page {currentPage + 1} of {totalPages} ({videos.length} video{videos.length !== 1 ? 's' : ''} total)
            </p>
          )}
        </div>
      </div>
    );
  };

  // Separate single-video repos from multi-video repos
  const singleVideoRepos = [];
  const multiVideoRepos = [];

  Object.entries(videosByRepo).forEach(([repoName, repoVideos]) => {
    if (repoVideos.length === 1) {
      singleVideoRepos.push({ repoName, videos: repoVideos });
    } else {
      multiVideoRepos.push({ repoName, videos: repoVideos });
    }
  });

  return (
    <div>
      {/* Multi-video repositories with carousels */}
      {multiVideoRepos.map(({ repoName, videos }) => (
        <VideoCarousel
          key={repoName}
          videos={videos}
          repoName={repoName}
          repoUrl={videos[0].repositoryUrl}
        />
      ))}

      {/* Single-video repositories in a 3-column grid */}
      {singleVideoRepos.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {singleVideoRepos.map(({ repoName, videos }) => (
            <div key={repoName} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#fff'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>
                {formatRepoName(repoName)}
              </h3>
              {renderVideo(videos[0], false)}
              <div style={{ marginTop: '1rem' }}>
                <a
                  href={videos[0].repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#0f62fe',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  View Repository →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGallery;

// Made with Bob