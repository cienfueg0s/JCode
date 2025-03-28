document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const searchInput = document.getElementById('searchInput');
  const transcriptOutput = document.getElementById('transcriptOutput');
  const copyButton = document.getElementById('copyButton');
  const exportTxt = document.getElementById('exportTxt');
  const exportSrt = document.getElementById('exportSrt');
  const languageSelect = document.getElementById('languageSelect');

  // Dark mode toggle
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  });

  // Search functionality
  searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.toLowerCase();
    const text = transcriptOutput.textContent;
    if (searchText) {
      const highlighted = text.replace(new RegExp(searchText, 'gi'), 
        match => `<mark>${match}</mark>`);
      transcriptOutput.innerHTML = highlighted;
    } else {
      transcriptOutput.textContent = text;
    }
  });

  // Copy functionality
  copyButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText(transcriptOutput.textContent);
    copyButton.textContent = 'Copied!';
    setTimeout(() => copyButton.textContent = 'Copy', 2000);
  });

  // Export functionality
  exportTxt.addEventListener('click', () => {
    downloadFile(transcriptOutput.textContent, 'transcript.txt', 'text/plain');
  });

  exportSrt.addEventListener('click', () => {
    const srtContent = convertToSRT(transcriptOutput.textContent);
    downloadFile(srtContent, 'transcript.srt', 'text/plain');
  });

  // Get transcript
  document.getElementById('getTranscript').addEventListener('click', async () => {
    const url = document.getElementById('videoUrl').value;
    const videoId = getVideoId(url);
    if (!videoId) {
      alert('Invalid YouTube URL');
      return;
    }

    const language = languageSelect.value;
    const transcript = await fetchTranscript(videoId, language);
    transcriptOutput.textContent = transcript || 'No transcript found';

    const wordCount = (transcript || '').split(/\s+/).length;
    document.getElementById('wordCount').textContent = `Words: ${wordCount}`;
  });
});

function getVideoId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function fetchTranscript(videoId, language) {
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    const match = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!match) return null;

    const data = JSON.parse(match[1]);
    const captions = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captions?.length) return null;

    const track = captions.find(t => t.languageCode === language) || captions[0];
    const captionResponse = await fetch(track.baseUrl);
    const captionText = await captionResponse.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(captionText, 'text/xml');
    return Array.from(doc.getElementsByTagName('text'))
      .map(t => t.textContent)
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

function convertToSRT(text) {
  return text.split('\n')
    .map((line, i) => {
      const num = i + 1;
      const time = `00:${String(Math.floor(i/6)).padStart(2,'0')}:${String((i*10)%60).padStart(2,'0')},000`;
      return `${num}\n${time} --> ${time}\n${line}\n\n`;
    })
    .join('');
}