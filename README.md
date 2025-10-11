
# Medical Hebrew Learning Website

## Project Overview
This project is a web application for learning medical Hebrew terms and sentences. It features interactive flashcards, matching games, quizzes, and AI-powered sentence generation to help users master medical vocabulary in Hebrew.

## Features
- Category-based learning of medical terms
- Flashcards and matching games
- Quiz mode for self-assessment
- AI-generated example sentences for vocabulary
- User authentication and progress tracking
- Responsive design for desktop and mobile

## Technologies Used
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui
- Supabase (database, authentication, edge functions)
- IndexedDB (local caching)

## Getting Started
### Prerequisites
- Node.js & npm installed ([download here](https://nodejs.org/))

### Installation
1. Clone the repository:
	```sh
	git clone <YOUR_GIT_URL>
	cd med-hebrew-shylo
	```
2. Install dependencies:
	```sh
	npm install
	```
3. Start the development server:
	```sh
	npm run dev
	```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment
You can deploy this project using Netlify, Vercel, or any static hosting provider. For Netlify:
1. Push your code to GitHub or another Git provider.
2. Connect your repository to Netlify.
3. Set the build command to `npm run build` and the publish directory to `dist`.
4. Configure environment variables for Supabase if needed.

## Configuration
- Supabase credentials are managed in `src/integrations/supabase/client.ts` and `supabase/config.toml`.
- Tailwind and shadcn-ui are configured in `tailwind.config.ts` and `components.json`.

## Contributing
Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

## License
This project is licensed under the MIT License.
