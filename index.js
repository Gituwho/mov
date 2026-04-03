// Cloudflare Worker: index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Only run if the path is /movies
    if (url.pathname === "/movies") {
      const TMDB_API_KEY = env.TMDB_API_KEY; 
      let workingMovies = [];
      let page = 1;

      // Loop until we find 40 working movies or hit page 5
      while (workingMovies.length < 40 && page <= 5) {
        const tmdbUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ta&sort_by=primary_release_date.desc&page=${page}`;
        
        const res = await fetch(tmdbUrl);
        const data = await res.json();

        for (const m of data.results) {
          if (!m.poster_path) continue;

          // Check if vidsrc has the movie
          const vidsrcUrl = `https://vidsrc.to/embed/movie/${m.id}`;
          const check = await fetch(vidsrcUrl, { method: 'HEAD' });

          if (check.status === 200) {
            workingMovies.push({
              id: m.id,
              title: m.title,
              posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
              videoUrl: vidsrcUrl,
              year: m.release_date ? m.release_date.split('-')[0] : "2024",
              rating: m.vote_average
            });
          }
          if (workingMovies.length >= 40) break;
        }
        page++;
      }

      return new Response(JSON.stringify(workingMovies), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};
