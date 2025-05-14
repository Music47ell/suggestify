# Suggestify

**Suggestify** is a web application allows people to recommend tracks they think I should listen to. It features a search functionality to find tracks, a preview option to listen to them, and a public list of suggested tracks. The app is built using [Astro](https://astro.build/) and utilizes the [Deezer API](https://developers.deezer.com/) for music data.

## Features

- **Search Tracks**: Find your favorite songs or discover new ones.
- **Preview Music**: Listen to song previews directly within the app.
- **Public Playlist**: View and suggest tracks to be added to the public playlist.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Technologies Used

- **Frontend**: [Astro](https://astro.build/) for server-side rendering and React-based UI.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **Backend**: Server-side logic powered by Astro API routes.
- **Third-party Integration**:
  - [Deezer API](https://developers.deezer.com/) for fetching song data.
  - [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) for bot protection.
  - [ntfy](https://ntfy.sh/) to send notifications directly to your phone.
- **Hosting**: Deployed on [Cloudflare Pages](https://pages.cloudflare.com/).
- **Package Manager**: Uses [Bun](https://bun.sh/) for faster dependency management and builds.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm, yarn, or bun package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/suggestify.git
   cd suggestify
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun dev
   ```

4. Open the app in your browser at [http://localhost:3000](http://localhost:3000).

### Build for Production

To build the app for production:

```bash
bun build
```

Then, start the production server:

```bash
bun start
```

## Project Structure

- **`src/layouts/layout.astro`**: Defines the root layout of the application, including metadata and global styles.
- **`src/pages/index.astro`**: Main page of the application.
- **`src/assets/css/globals.css`**: Tailwind CSS configuration and global styles.
- **`.astro/`**: Auto-generated folder containing the Astro build output.

## Metadata

- **Title**: Suggestify - Discover and Share Brutal Tunes
- **Description**: Search, preview, and suggest tracks for the public playlist.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Open a pull request.

## License

This project is licensed under the MIT License.

---

Enjoy discovering and sharing brutal tunes with **Suggestify**! 🤘