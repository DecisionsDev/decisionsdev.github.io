import React from 'react';
import videos from '../data/videos.json';

const VideoGallery = () => {
  const formatRepoName = (repoName) => {
    return repoName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderVideo = (video) => {
    if (video.type === 'youtube') {
      return (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', marginBottom: '1rem' }}>
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
      return (
        <div style={{ marginBottom: '1rem' }}>
          <video
            controls
            style={{ width: '100%', maxHeight: '400px', borderRadius: '4px' }}
            preload="metadata"
          >
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {(video.fileName || video.filePath) && (
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              {video.filePath || video.fileName}
            </p>
          )}
        </div>
      );
    } else if (video.type === 'vimeo') {
      return (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', marginBottom: '1rem' }}>
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
      {videos.map((video, index) => (
        <div key={index} style={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '1.5rem',
          backgroundColor: '#fff'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
            {formatRepoName(video.repository)}
          </h3>
          
          {renderVideo(video)}
          
          <div style={{ marginTop: '1rem' }}>
            <a
              href={video.repositoryUrl}
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
  );
};

export default VideoGallery;

// Made with Bob