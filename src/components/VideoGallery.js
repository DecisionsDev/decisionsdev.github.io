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
              style={{ width: '100%', maxHeight: '400px', borderRadius: '4px', objectFit: 'contain' }}
            />
            {(video.fileName || video.filePath) && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem', marginBottom: 0 }}>
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
              style={{ width: '100%', maxHeight: '400px', borderRadius: '4px' }}
              preload="metadata"
            >
              <source src={video.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {(video.fileName || video.filePath) && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem', marginBottom: 0 }}>
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
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    const goToPrevious = () => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
    };

    const goToSlide = (index) => {
      setCurrentIndex(index);
    };

    return (
      <div style={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px', 
        padding: '1.5rem',
        backgroundColor: '#fff',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
          {formatRepoName(repoName)}
        </h3>
        
        <div style={{ position: 'relative' }}>
          {/* Video Display */}
          <div style={{ marginBottom: '1rem' }}>
            {renderVideo(videos[currentIndex])}
          </div>

          {/* Navigation Arrows (only show if more than 1 video) */}
          {videos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                aria-label="Previous video"
              >
                ‹
              </button>
              <button
                onClick={goToNext}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}
                aria-label="Next video"
              >
                ›
              </button>
            </>
          )}

          {/* Dots Indicator (only show if more than 1 video) */}
          {videos.length > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px',
              marginTop: '1rem'
            }}>
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: currentIndex === index ? '#0f62fe' : '#d0d0d0',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  aria-label={`Go to video ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Video Counter (only show if more than 1 video) */}
          {videos.length > 1 && (
            <p style={{ 
              textAlign: 'center', 
              fontSize: '0.875rem', 
              color: '#666',
              marginTop: '0.5rem',
              marginBottom: '1rem'
            }}>
              {currentIndex + 1} / {videos.length}
            </p>
          )}
        </div>
        
        <div style={{ marginTop: '1rem' }}>
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