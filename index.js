const axios = require('axios');

// CONFIGURATION
const TMDB_API_KEY = process.env.TMDB_API_KEY; 
const TARGET_COUNT = 60; // We want 60 movies
const MAX_PAGES = 5;     // Scan 5 pages of TMDB (100 movies total)

async function getTamilMovies() {
    let allFoundMovies = [];
    
    console.error("🚀 Starting Tamil Movie Automation...");

    try {
        for (let page = 1; page <= MAX_PAGES; page++) {
            console.error(`Fetching TMDB Page ${page}...`);
            
            // 1. Fetch from TMDB
            const res = await axios.get('https://api.themoviedb.org/3/discover/movie', {
                params: {
                    api_key: TMDB_API_KEY,
                    with_original_language: 'ta',
                    sort_by: 'primary_release_date.desc',
                    // Only get movies released at least 7 days ago (better chance of having a link)
                    'primary_release_date.lte': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    page: page
                }
            });

            const movies = res.data.results;
            if (!movies || movies.length === 0) break;

            for (const m of movies) {
                // 2. Basic Quality Filter (Must have poster and a title)
                if (!m.poster_path || !m.title) continue;

                allFoundMovies.push({
                    id: m.id,
                    title: m.title,
                    posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                    videoUrl: `https://vidsrc.to/embed/movie/${m.id}`, // Standard format
                    year: m.release_date ? m.release_date.split('-')[0] : "2024",
                    rating: m.vote_average,
                    language: "Tamil",
                    genre: "Drama/Action"
                });

                if (allFoundMovies.length >= TARGET_COUNT) break;
            }
            
            if (allFoundMovies.length >= TARGET_COUNT) break;
        }

        // 3. Final Output (This goes to your App or KV Store)
        console.log(JSON.stringify(allFoundMovies, null, 2));
        console.error(`✅ Success! Found ${allFoundMovies.length} movies.`);

    } catch (e) {
        console.error("❌ Error fetching movies:", e.message);
        // If everything fails, output an empty array so the app doesn't crash
        console.log("[]");
    }
}

getTamilMovies();
