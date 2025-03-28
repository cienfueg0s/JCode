document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup JS loaded ✅");
  
  document.getElementById("copyButton").addEventListener("click", async () => {
    const text = document.getElementById("transcriptOutput").textContent;
    await navigator.clipboard.writeText(text);
    const copyButton = document.getElementById("copyButton");
    copyButton.textContent = "Copied!";
    setTimeout(() => {
      copyButton.textContent = "Copy Text";
    }, 2000);
  });

  document.getElementById("getTranscript").addEventListener("click", async () => {
    console.log("Button clicked!");

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
    
    button.disabled = false;
    button.textContent = "Get Transcript";
  });

  function getVideoId(url) {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

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
});
