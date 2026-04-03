const axios = require('axios');

// Get keys from GitHub Environment Variables
const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function getTamilMovies() {
    try {
        // Fetches latest Tamil movies released in the last 30 days
        const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                with_original_language: 'ta',
                sort_by: 'primary_release_date.desc',
                'primary_release_date.gte': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        });

        return response.data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            url: `https://vidsrc.to/embed/movie/${movie.id}`
        }));
    } catch (error) {
        console.error('Error fetching from TMDB:', error);
        return [];
    }
}

async function run() {
    const movies = await getTamilMovies();
    console.log(JSON.stringify(movies)); // Output for the next step in GitHub Actions
}

run();
