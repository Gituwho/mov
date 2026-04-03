const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/**
 * Checks if the vidsrc link is actually active
 * Returns true if the page exists (status 200), false if 404 or error
 */
async function isLinkWorking(tmdbId) {
    try {
        const url = `https://vidsrc.to/embed/movie/${tmdbId}`;
        // We use HEAD request to save bandwidth; it only checks the status code
        const response = await axios.get(url, { 
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        
        // If the response contains "Media is not available" text or 404, return false
        const html = response.data.toString();
        if (html.includes("not available") || html.includes("404")) {
            return false;
        }
        
        return response.status === 200;
    } catch (e) {
        return false; // Link is broken or timed out
    }
}

async function getLatestTamilMovies() {
    try {
        const res = await axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
                api_key: TMDB_API_KEY,
                with_original_language: 'ta',
                language: 'ta-IN',
                sort_by: 'primary_release_date.desc',
                'primary_release_date.lte': new Date().toISOString().split('T')[0] // Only movies already released
            }
        });

        const rawMovies = res.data.results.slice(0, 30); // Grab a few extra to account for filtered items
        const workingMovies = [];

        console.error("Checking links, please wait...");

        for (const m of rawMovies) {
            const active = await isLinkWorking(m.id);
            
            if (active) {
                workingMovies.push({
                    id: m.id.toString(),
                    title: m.title,
                    posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                    videoUrl: `https://vidsrc.to/embed/movie/${m.id}`,
                    rating: m.vote_average,
                    year: m.release_date ? m.release_date.split('-')[0] : ""
                });
            }

            // Stop once we have 20 working movies
            if (workingMovies.length >= 20) break;
        }

        return workingMovies;
    } catch (e) {
        console.error("Error fetching from TMDB:", e.message);
        return [];
    }
}

// Execute and output the JSON for your CineTV application
getLatestTamilMovies().then(movies => {
    console.log(JSON.stringify(movies, null, 2));
});
