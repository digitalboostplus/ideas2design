# AI Image Generator

This project is an AI-powered image generation tool that allows users to create images from text prompts using various cutting-edge AI models. It's built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Features

*   **Text-to-Image Generation**: Generate images from textual descriptions using multiple AI models:
    *   Ideogram v2
    *   Fast SDXL
    *   Stable Diffusion XL
    (Powered by Fal.ai)
*   **User Authentication**: Secure sign-in with Google, leveraging Firebase Authentication.
*   **Image Gallery**: Authenticated users can save their generated images to a personal gallery (powered by Firebase Firestore and Storage).
*   **Image Management**:
    *   Copy image URLs to the clipboard.
    *   Download generated images directly.
*   **Model Selection**: Choose from available AI models for generation.
*   **Responsive Design**: User-friendly interface that adapts to various screen sizes.
*   **API Information**: Includes an educational modal explaining what APIs are.
*   **Integrated API Routes**: Backend setup for various AI services including OpenAI, Anthropic, Deepgram, and Replicate.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A [Firebase](https://firebase.google.com/) project:
    *   Enable Authentication (Google Sign-In).
    *   Set up Firestore (for gallery metadata).
    *   Set up Firebase Storage (for storing images).
*   [Fal.ai](https://fal.ai/) API Key.
*   (Optional) API keys for other services if you plan to extend functionality:
    *   OpenAI
    *   Anthropic
    *   Replicate
    *   Deepgram

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add the following environment variables. Replace the placeholder values with your actual credentials and configuration details.

    ```env
    # Firebase Configuration (obtain from your Firebase project settings)
    NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_firebase_messaging_sender_id"
    NEXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"

    # Fal.ai API Key
    NEXT_PUBLIC_FAL_KEY="your_fal_ai_key_or_pat"

    # (Optional) Other API Keys if you are using these services
    # OPENAI_API_KEY="your_openai_api_key"
    # ANTHROPIC_API_KEY="your_anthropic_api_key"
    # REPLICATE_API_KEY="your_replicate_api_key"
    # DEEPGRAM_API_KEY="your_deepgram_api_key"
    ```
    *Note: The `next.config.mjs` includes a rewrite for `/api/:path*` to `https://api.openai.com/:path*`. If you are using the OpenAI API directly through Next.js API routes, ensure your `OPENAI_API_KEY` is set up correctly in your environment, and be mindful of this rewrite.*

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1.  Navigate to the homepage.
2.  If you wish to save images to a gallery, sign in using the Google Sign-In button.
3.  Select your preferred AI model from the dropdown menu.
4.  Enter a descriptive prompt in the input field detailing the image you want to generate.
5.  Press Enter or click a generate button (if available, current setup generates on Enter).
6.  Four image variations will be generated and displayed.
7.  For each image, you can:
    *   Hover to see options.
    *   Copy the image URL.
    *   Download the image.
    *   If logged in, save the image to your gallery.
8.  Authenticated users can access their saved images by navigating to the "Gallery" page.

## Available Scripts

In the project directory, you can run:

*   `npm run dev` or `yarn dev`: Runs the app in development mode.
*   `npm run build` or `yarn build`: Builds the app for production.
*   `npm run start` or `yarn start`: Starts a Next.js production server.
*   `npm run lint` or `yarn lint`: Runs ESLint to check for code quality issues.

## API Integrations

This project is set up to integrate with several AI services:

*   **Fal.ai**: Used for the core image generation feature.
*   **OpenAI**: API routes and SDK are present. Note the rewrite in `next.config.mjs`.
*   **Anthropic**: API routes and SDK are present.
*   **Deepgram**: API routes and SDK are present (likely for voice-related features, though not prominent in the main image generation page).
*   **Replicate**: API routes and SDK are present.

Firebase is used as the backend for authentication, database (Firestore), and storage.

## Project Structure (Simplified)

```
.
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router (pages, API routes)
│   │   ├── api/        # Backend API routes for AI services
│   │   ├── gallery/    # Gallery page
│   │   ├── page.tsx    # Main homepage component
│   │   └── layout.tsx  # Main layout component
│   ├── components/     # Reusable React components
│   ├── lib/            # Libraries, hooks, contexts, Firebase utils
│   │   ├── contexts/   # React contexts (Auth, Deepgram)
│   │   ├── firebase/   # Firebase configuration and utilities
│   │   └── hooks/      # Custom React hooks (useAuth)
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

This provides a high-level overview. Explore the `paths/` directory for more specific documentation if available for different features.
