# its-dex-hero

its-dex-hero is a decentralized exchange (DEX) dashboard built with Next.js and React. It provides real-time market data, trending tokens, and promotional features for creators and users.

## Features

- Trending tokens and market cap data
- Creator rewards and donation addresses
- Promotion slider for featured tokens
- Responsive UI with Tailwind CSS

## Prerequisites

- Node.js (v18 or newer recommended)
- npm (comes with Node.js)

## Setup Tutorial

Follow these steps to set up and run the project locally:

### 1. Clone the repository

```
git clone https://github.com/Goshen-Digital-Group/its-dex-hero.git
cd its-dex-hero-main
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add your RPC URL:

```
NEXT_PUBLIC_RPC_URL=https://your-rpc-url
```

### 4. Run the development server

```
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Build for production

```
npm run build
npm start
```

## Additional Scripts

- `npm run lint` — Run ESLint to check for code issues

## License

See the [LICENSE](LICENSE) file for details.
