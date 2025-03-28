
# JTube - YouTube Transcript Extension

A Chrome extension that allows you to instantly fetch transcripts from YouTube videos.

## Features
- Simple popup interface
- Paste any YouTube URL to get its transcript
- Automatic language detection (prioritizes English)
- Word count tracking
- Copy to clipboard functionality
- Clean, modern UI

## How to Use
1. Click the JTube extension icon in your browser
2. Paste a YouTube video URL into the input field
3. Click "Get Transcript" to fetch the video's transcript
4. Use the "Copy Text" button to copy the transcript
5. View word count at the bottom

## Technical Details
- Built with vanilla JavaScript
- Uses YouTube's native transcript data
- Supports multiple language captions (defaults to English when available)
- XML parsing for caption data
- Clipboard API integration

## Development Notes
Key Components:
- `popup.html`: Main UI structure and styling
- `popup.js`: Core functionality
  - Video ID extraction
  - Transcript fetching
  - XML parsing
  - Clipboard handling
- `manifest.json`: Extension configuration and permissions

### For Developers
- The extension uses Manifest V3
- Required permissions:
  - `scripting`: For page interactions
  - `clipboard-write`: For copy functionality
  - YouTube host permissions
- Error handling is implemented for:
  - Invalid URLs
  - Missing transcripts
  - Failed API requests

## Future Enhancements
- Multiple language support
- Timestamp preservation
- Dark mode toggle
- Export options (TXT, SRT)
- Search functionality

## Version History
- 1.0: Initial release with basic transcript fetching
