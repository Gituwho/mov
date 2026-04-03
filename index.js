const axios = require('axios');

// Set your TMDB API Key here or via Environment Variable
const TMDB_API_KEY = process.env.TMDB_API_KEY; 
const TARGET_COUNT = 50; // How many working movies you want
const MAX_PAGES = 15;    // How many TMDB pages to search (20 movies per page)

async function isLinkWorking(tmdbId) {
    try {
        const url = `https://vidsrc.to/embed/movie/${tmdbId}`;
        const response = await axios.get(url, { 
            timeout: 10000, 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://vidsrc.to/'
            }
        });
        
        const html = response.data.toString();
        // Skip if the page explicitly says it's unavailable
        if (html.includes("404") || html.includes("not found") || html.includes("Media is not available")) {
            return false;
        }
        return response.status === 200;
    } catch (e) {
        return false;
    }
}

async function startAutomation() {
    const workingMovies = [];
    let page = 1;

    console.error(`🚀 Starting Tamil Movie Automation. Goal: ${TARGET_COUNT} movies.`);

    try {
        while (workingMovies.length < TARGET_COUNT && page <= MAX_PAGES) {
            console.error(`Scanning TMDB Page ${page}...`);
            
            const res = await axios.get('https://api.themoviedb.org/3/discover/movie', {
                params: {
                    api_key: TMDB_API_KEY,
                    with_original_language: 'ta',
                    sort_by: 'primary_release_date.desc',
                    'primary_release_date.lte': new Date().toISOString().split('T')[0],
                    page: page
                }
            });

            const movies = res.data.results;
            if (!movies || movies.length === 0) break;

            for (const m of movies) {
                // Skip if no poster exists
                if (!m.poster_path) continue;

                const active = await isLinkWorking(m.id);
                if (active) {
                    workingMovies.push({
                        id: m.id,
                        title: m.title,
                        posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
                        videoUrl: `https://vidsrc.to/embed/movie/${m.id}`,
                        year: m.release_date ? m.release_date.split('-')[0] : "2024",
                        rating: m.vote_average,
                        language: "Tamil"
                    });
                    console.error(`✅ Added: ${m.title}`);
                }

                if (workingMovies.length >= TARGET_COUNT) break;
            }
            page++;
        }

        // Final output for your app/KV store
        console.log(JSON.stringify(workingMovies, null, 2));
        console.error(`\nDone! Found ${workingMovies.length} working movies.`);

    } catch (e) {
        console.error("Error:", e.message);
    }
}

startAutomation();
