const axios = require('axios');
const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function getLatestTamilMovies() {
    try {
        const res = await axios.get('https://api.themoviedb.org/3/discover/movie', {
            params: {
                api_key: TMDB_API_KEY,
                with_original_language: 'ta',
                sort_by: 'primary_release_date.desc'
            }
        });

        // Map the results to the format your app needs
        return res.data.results.slice(0, 20).map(m => ({
            id: m.id.toString(),
            title: m.title,
            videoUrl: `https://vidsrc.to/embed/movie/${m.id}`
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

getLatestTamilMovies().then(movies => console.log(JSON.stringify(movies)));
