# iPod Player

A nostalgic iPod Classic interface for your Mac, integrated with Spotify. Relive the click wheel experience with your modern music library.

## Features

- **Iconic Design**: Faithful recreation of the iPod Classic interface, including the click wheel.
- **Spotify Integration**: Connect your Spotify account to access your playlists, saved albums, and liked songs.
- **Cover Flow**: Browse your music library visually with smooth 3D animations.
- **Click Wheel Navigation**: Rotate to scroll, click to select. Supports mouse wheel and touch gestures.
- **Transparent Window**: The app window is shaped like the iPod, blending seamlessly into your desktop.
- **Themes**: Switch between Classic (Silver), U2 (Black/Red), and Dark Mode.

### Controls

- **Click Wheel**:
  - **Scroll**: Rotate clockwise/counter-clockwise or use your mouse scroll wheel
  - **Click**: Tap top/bottom/left/right for Menu/Play/Pause/Next/Prev
  - **Select**: Click the center button
- **Drag**: Click and drag anywhere on the transparent area to move the window.
- **Long Press**: Hold the center button to return to the main menu (Home).

## Work in Progress / Known Limitations

- **Smart Playlists**: Currently only user-created and saved playlists are fetched. "Made For You" (Daily Mix, Discover Weekly) playlists are unavailable.
- **Search**: Global search functionality is currently limited.
- **Games**: Brick game is a placeholder.

## Installation

1. **Download**: Get the latest `.dmg` from the [Releases](https://github.com/aronnaxlin/ipod-spotify-player/releases) page.
2. **Install**: Drag "iPod Player" to your Applications folder.
3. **Launch**: Open the app and log in with your Spotify account.

## Development

This project uses Electron, React, Vite, and Tailwind CSS.

```bash
# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build for macOS
npm run build:mac
```

## Credits & Acknowledgements

This project is a labor of love and stands on the shoulders of giants.

- **[ipod-classic-js](https://github.com/tvillarete/ipod-classic-js)** by [Tanner Villarete](https://github.com/tvillarete): The original web-based iPod Classic recreation that inspired this project. Many UI components and logic (Cover Flow, Click Wheel physics) are adapted from this incredible open-source project.
- **[ryos](https://github.com/ryokun6/ryos)** by [Ryo N](https://github.com/ryokun6): Inspiration for the OS-like window management and styling.
- **AI Assistance**: Portions of this codebase were generated and refined with the assistance of Google's advanced AI coding agents.

## License

MIT
