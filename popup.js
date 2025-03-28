/**
 * JTube - YouTube Transcript Extension
 * Main popup script that handles transcript fetching and UI interactions
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup JS loaded ✅");
  
  // Dark mode toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
  });

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();
    const transcript = document.getElementById("transcriptOutput");
    const text = transcript.textContent;
    if (searchText) {
      const highlighted = text.replace(new RegExp(searchText, "gi"), 
        match => `<mark>${match}</mark>`);
      transcript.innerHTML = highlighted;
    } else {
      transcript.innerHTML = text;
    }
  });

  // Export functionality
  document.getElementById("exportTxt").addEventListener("click", () => {
    const text = document.getElementById("transcriptOutput").textContent;
    downloadFile(text, "transcript.txt", "text/plain");
  });

  document.getElementById("exportSrt").addEventListener("click", () => {
    const text = document.getElementById("transcriptOutput").textContent;
    const srtContent = convertToSRT(text);
    downloadFile(srtContent, "transcript.srt", "text/plain");
  });
  
  document.getElementById("copyButton").addEventListener("click", async () => {
    const text = document.getElementById("transcriptOutput").textContent;
    await navigator.clipboard.writeText(text);
    const copyButton = document.getElementById("copyButton");
    copyButton.textContent = "Copied!";
    setTimeout(() => {
      copyButton.textContent = "Copy Text";
    }, 2000);
  });

  const transcriptButton = document.getElementById("getTranscript");
  transcriptButton.addEventListener("click", async () => {
    console.log("Button clicked!");
    transcriptButton.disabled = true;
    transcriptButton.textContent = "Loading...";

    const url = document.getElementById("videoUrl").value;
    const videoId = getVideoId(url);
    console.log("Video ID:", videoId);

    if (!videoId) {
      alert("Please enter a valid YouTube URL.");
      return;
    }

    const transcript = await fetchTranscript(videoId);
    const output = document.getElementById("transcriptOutput");
    output.textContent = transcript || "No transcript found.";
    
    if (transcript) {
      const wordCount = transcript.split(/\s+/).length;
      document.getElementById("wordCount").textContent = `Words: ${wordCount}`;
    }
    
    transcriptButton.disabled = false;
    transcriptButton.textContent = "Get Transcript";
  });

  /**
   * Extracts YouTube video ID from various URL formats
   * @param {string} url - YouTube video URL
   * @returns {string|null} - Video ID or null if invalid URL
   */
  function getVideoId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  /**
   * Fetches and parses transcript for a YouTube video
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<string|null>} - Transcript text or null if not found
   * 
   * Process:
   * 1. Fetches video page HTML
   * 2. Extracts player response data
   * 3. Finds available caption tracks
   * 4. Prioritizes English captions
   * 5. Parses XML caption data
   */
  async function fetchTranscript(videoId) {
    try {
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
      const html = await response.text();

      const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
      if (!playerResponseMatch) {
        console.log("Could not find player response.");
        return null;
      }

      const playerResponse = JSON.parse(playerResponseMatch[1]);
      const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

      if (!captionTracks || captionTracks.length === 0) {
        console.log("No caption tracks found.");
        return null;
      }

      const track = captionTracks.find(t => t.languageCode === "en") || captionTracks[0];
      console.log("Using track:", track);

      const captionRes = await fetch(track.baseUrl);
      const captionXml = await captionRes.text();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(captionXml, "text/xml");

      const texts = [...xmlDoc.getElementsByTagName("text")];
      return texts.map(t => t.textContent).join(" ");
    } catch (error) {
      console.error("Transcript fetch failed:", error);
      return null;
    }
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function convertToSRT(text) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const num = i + 1;
      const time = `00:${String(Math.floor(i/6)).padStart(2, '0')}:${String((i*10)%60).padStart(2, '0')},000`;
      return `${num}\n${time} --> ${time}\n${line}\n\n`;
    }).join("");
  }
});
