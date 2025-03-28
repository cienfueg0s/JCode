document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme based on system preference
  if (prefersDark) {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.body.removeAttribute('data-theme');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.body.setAttribute('data-theme', 'dark');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  });
  const transcriptOutput = document.getElementById('transcriptOutput');
  const copyButton = document.getElementById('copyButton');
  const exportTxt = document.getElementById('exportTxt');

  // Copy functionality
  copyButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText(transcriptOutput.textContent);
    copyButton.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    }, 2000);
  });

  // Export functionality
  exportTxt.addEventListener('click', () => {
    const fileName = `${window.videoTitle || 'transcript'}.txt`;
    downloadFile(transcriptOutput.textContent, fileName, 'text/plain');
  });

  // Get transcript
  document.getElementById('getTranscript').addEventListener('click', async () => {
    const url = document.getElementById('videoUrl').value;
    const videoId = getVideoId(url);
    if (!videoId) {
      showError('Invalid YouTube URL');
      return;
    }

    showLoading(true);
    hideError();
    
    try {
      const transcript = await fetchTranscript(videoId);
      if (!transcript) {
        showError('No transcript found for this video');
        return;
      }

      document.getElementById('videoTitleDisplay').textContent = window.videoTitle || 'Untitled Video';
      transcriptOutput.textContent = transcript;
      const wordCount = transcript.split(/\s+/).length;
      document.getElementById('wordCount').textContent = `Words: ${wordCount}`;
    } catch (error) {
      showError('Failed to fetch transcript. Please try again.');
    } finally {
      showLoading(false);
    }
  });

  function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    transcriptOutput.textContent = '';
    document.getElementById('videoTitleDisplay').textContent = '';
    document.getElementById('wordCount').textContent = 'Words: 0';
  }

  function hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
  }

  function showLoading(show) {
    document.getElementById('loadingIndicator').classList.toggle('hidden', !show);
    document.getElementById('getTranscript').disabled = show;
  }
});

function getVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function fetchTranscript(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const videoTitle = data?.videoDetails?.title || 'transcript';
    window.videoTitle = videoTitle.replace(/[^\w\s-]/g, '').trim(); // Store sanitized title globally
    const captions = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captions?.length) return null;

    const track = captions[0]; 
    const captionResponse = await fetch(track.baseUrl);
    const captionText = await captionResponse.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(captionText, 'text/xml');
    return Array.from(doc.getElementsByTagName('text'))
      .map(t => {
        // Decode HTML entities and clean up the text
        let text = t.textContent
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\[.*?\]/g, '') // Remove [Music], [Applause], etc.
          .trim();
        
        // Capitalize sentences
        text = text.charAt(0).toUpperCase() + text.slice(1);
        
        return text;
      })
      .filter(t => t) // Remove empty strings
      .join(' ');
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}