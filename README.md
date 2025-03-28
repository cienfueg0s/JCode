
# JTube - YouTube Transcript Extension

A Chrome extension that allows you to instantly fetch transcripts from YouTube videos.

## Features
- Simple popup interface
- Paste any YouTube URL to get its transcript
- Multiple language support with language selector
- Timestamp preservation for each line
- Dark mode toggle
- Search functionality
- Export options (TXT and SRT formats)
- Word count tracking
- Copy to clipboard functionality
- Clean, modern UI

## How to Use
1. Click the JTube extension icon in your browser
2. Paste a YouTube video URL into the input field
3. Select your preferred language (or use auto-detect)
4. Click "Get Transcript" to fetch the video's transcript
5. Use the search bar to find specific text
6. Toggle dark mode for better visibility
7. Export as TXT or SRT format
8. Use "Copy" to copy the transcript

## Technical Details
- Built with vanilla JavaScript
- Uses YouTube's native transcript data
- Supports multiple language captions
- XML parsing for caption data
- Clipboard API integration
- Timestamp preservation
- Dark mode implementation
- Search functionality
- Multiple export formats

## Development Notes
Key Components:
- `popup.html`: Main UI structure and styling
- `popup.js`: Core functionality
  - Video ID extraction
  - Transcript fetching
  - XML parsing
  - Clipboard handling
  - Language selection
  - Dark mode toggle
  - Search implementation
  - Export functionality
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
  - Language selection fallbacks

## Current Features
- Enhanced transcript fetching with timestamps
- Multi-language support
- Dark mode
- Search functionality
- Export options (TXT, SRT)
- Copy to clipboard functionality
- Word count tracking
- Clean, modern UI

## Version History
- 1.0: Initial release with transcript fetching and copy functionality
- 1.1: Added timestamps, dark mode, language selection, search, and export options

## Completed Enhancements
✓ Timestamp preservation
✓ Dark mode toggle
✓ Multiple language selector
✓ Export options (TXT, SRT)
✓ Search functionality
