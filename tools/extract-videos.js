const https = require('https');
const fs = require('fs');
const path = require('path');

// Load repositories
const repositories = require('../src/data/repositories.json');

// GitHub token from environment (optional, for higher rate limits)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Regular expressions to match video links
const VIDEO_PATTERNS = {
  youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,
  vimeo: /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/g,
  // GitHub user-attachments videos
  githubVideo: /https:\/\/github\.com\/user-attachments\/assets\/([a-f0-9-]+)/g,
  // Markdown image with video link
  markdownVideo: /!\[([^\]]*)\]\(([^)]+\.(?:mp4|webm|ogg|gif))\)/g,
  // HTML video tags
  htmlVideo: /<video[^>]*src=["']([^"']+)["'][^>]*>/g,
  // Embedded iframes
  iframe: /<iframe[^>]*src=["']([^"']+)["'][^>]*>/g
};

/**
 * Fetch README content from GitHub
 */
function fetchReadme(repoName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/DecisionsDev/${repoName}/readme`,
      method: 'GET',
      headers: {
        'User-Agent': 'DecisionsDev-Video-Extractor',
        'Accept': 'application/vnd.github.v3.raw'
      }
    };

    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else if (res.statusCode === 404) {
          resolve(null); // No README
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Fetch contents of a folder from GitHub
 */
function fetchFolderContents(repoName, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/DecisionsDev/${repoName}/contents/${path}`,
      method: 'GET',
      headers: {
        'User-Agent': 'DecisionsDev-Video-Extractor',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else if (res.statusCode === 404) {
          resolve(null); // Folder not found
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Recursively fetch all video files from a folder and its subfolders
 */
async function fetchVideosRecursively(repoName, folderPath, repoUrl) {
  const videos = [];
  
  try {
    const contents = await fetchFolderContents(repoName, folderPath);
    
    if (!contents || !Array.isArray(contents)) return videos;

    for (const item of contents) {
      if (item.type === 'file') {
        const fileName = item.name.toLowerCase();
        
        // Check for video file extensions (including animated GIFs)
        if (fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.mov') || fileName.endsWith('.gif')) {
          videos.push({
            type: 'file',
            id: item.sha,
            url: item.download_url,
            embedUrl: item.download_url,
            fileName: item.name,
            filePath: item.path,
            repository: repoName,
            repositoryUrl: repoUrl,
            source: 'videos-folder'
          });
        }
      } else if (item.type === 'dir') {
        // Recursively search subdirectories
        await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        const subVideos = await fetchVideosRecursively(repoName, item.path, repoUrl);
        videos.push(...subVideos);
      }
    }
  } catch (error) {
    // Silently handle errors for subfolders
    console.error(`    Error fetching ${folderPath}:`, error.message);
  }

  return videos;
}


/**
 * Extract video links from README content
 */
function extractVideos(readmeContent, repoName, repoUrl) {
  const videos = [];

  if (!readmeContent) return videos;

  // Extract YouTube videos
  let match;
  const youtubePattern = new RegExp(VIDEO_PATTERNS.youtube.source, 'g');
  while ((match = youtubePattern.exec(readmeContent)) !== null) {
    const videoId = match[1];
    videos.push({
      type: 'youtube',
      id: videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      repository: repoName,
      repositoryUrl: repoUrl
    });
  }

  // Extract Vimeo videos
  const vimeoPattern = new RegExp(VIDEO_PATTERNS.vimeo.source, 'g');
  while ((match = vimeoPattern.exec(readmeContent)) !== null) {
    const videoId = match[1];
    videos.push({
      type: 'vimeo',
      id: videoId,
      url: `https://vimeo.com/${videoId}`,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      repository: repoName,
      repositoryUrl: repoUrl
    });
  }

  // Extract GitHub user-attachments videos
  const githubVideoPattern = new RegExp(VIDEO_PATTERNS.githubVideo.source, 'g');
  while ((match = githubVideoPattern.exec(readmeContent)) !== null) {
    const videoId = match[1];
    const videoUrl = match[0];
    videos.push({
      type: 'github',
      id: videoId,
      url: videoUrl,
      embedUrl: videoUrl, // GitHub videos can be embedded directly
      repository: repoName,
      repositoryUrl: repoUrl
    });
  }

  // Extract iframe embeds (catch any we might have missed)
  const iframePattern = new RegExp(VIDEO_PATTERNS.iframe.source, 'g');
  while ((match = iframePattern.exec(readmeContent)) !== null) {
    const src = match[1];
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      const ytMatch = src.match(/(?:embed\/|v=)([a-zA-Z0-9_-]{11})/);
      if (ytMatch && !videos.find(v => v.id === ytMatch[1])) {
        videos.push({
          type: 'youtube',
          id: ytMatch[1],
          url: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
          embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
          thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`,
          repository: repoName,
          repositoryUrl: repoUrl
        });
      }
    } else if (src.includes('vimeo.com')) {
      const vimeoMatch = src.match(/vimeo\.com\/video\/(\d+)/);
      if (vimeoMatch && !videos.find(v => v.id === vimeoMatch[1])) {
        videos.push({
          type: 'vimeo',
          id: vimeoMatch[1],
          url: `https://vimeo.com/${vimeoMatch[1]}`,
          embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
          repository: repoName,
          repositoryUrl: repoUrl
        });
      }
    }
  }

  return videos;
}

/**
 * Process all repositories
 */
async function processRepositories() {
  console.log(`Processing ${repositories.length} repositories...`);
  console.log('');

  const allVideos = [];
  let processedCount = 0;
  let errorCount = 0;

  for (const repo of repositories) {
    try {
      process.stdout.write(`\rProcessing ${repo.name}... (${processedCount + 1}/${repositories.length})`);
      
      // Check README for videos
      const readme = await fetchReadme(repo.name);
      let readmeVideos = [];
      
      if (readme) {
        readmeVideos = extractVideos(readme, repo.name, repo.url);
        if (readmeVideos.length > 0) {
          console.log(`\n  ✓ Found ${readmeVideos.length} video(s) in README of ${repo.name}`);
          allVideos.push(...readmeVideos);
        }
      }
      
      // Rate limiting between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check videos folder recursively
      const folderVideos = await fetchVideosRecursively(repo.name, 'videos', repo.url);
      
      if (folderVideos.length > 0) {
        console.log(`\n  ✓ Found ${folderVideos.length} video file(s) in /videos folder (including subfolders) of ${repo.name}`);
        allVideos.push(...folderVideos);
      }
      
      processedCount++;
      
      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`\n  ✗ Error processing ${repo.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n');
  console.log('='.repeat(60));
  console.log(`Processed: ${processedCount} repositories`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total videos found: ${allVideos.length}`);
  console.log('='.repeat(60));

  // Save to JSON file
  const outputPath = path.join(__dirname, '../src/data/videos.json');
  fs.writeFileSync(outputPath, JSON.stringify(allVideos, null, 2));
  console.log(`\nVideos saved to: ${outputPath}`);

  // Print summary by repository
  if (allVideos.length > 0) {
    console.log('\nVideos by repository:');
    const videosByRepo = {};
    allVideos.forEach(video => {
      if (!videosByRepo[video.repository]) {
        videosByRepo[video.repository] = [];
      }
      videosByRepo[video.repository].push(video);
    });

    Object.keys(videosByRepo).sort().forEach(repo => {
      console.log(`  ${repo}: ${videosByRepo[repo].length} video(s)`);
    });
  }
}

// Run the script
processRepositories().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Made with Bob