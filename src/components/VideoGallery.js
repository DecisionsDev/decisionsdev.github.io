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
    return repoName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderVideo = (video) => {
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
            {(video.fileName || video.filePath) && (
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', marginBottom: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {video.filePath || video.fileName}
              </p>
            )}
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
            {(video.fileName || video.filePath) && (
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', marginBottom: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {video.filePath || video.fileName}
              </p>
            )}
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
                {renderVideo(video)}
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

  return (
    <div>
      {Object.entries(videosByRepo).map(([repoName, repoVideos]) => (
        <VideoCarousel
          key={repoName}
          videos={repoVideos}
          repoName={repoName}
          repoUrl={repoVideos[0].repositoryUrl}
        />
      ))}
    </div>
  );
};

export default VideoGallery;

// Made with Bob