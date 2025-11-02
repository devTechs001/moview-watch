import axios from 'axios';
import Movie from '../models/Movie';
import { TMDB_API_KEY, OMDB_API_KEY } from '../config';

export const importMovie = async (req, res) => {
  try {
    const { source, sourceId } = req.body;
    
    let movieData;
    
    switch (source) {
      case 'tmdb':
        movieData = await importFromTMDB(sourceId);
        break;
      case 'omdb':
        movieData = await importFromOMDB(sourceId);
        break;
      case 'imdb':
        movieData = await importFromIMDB(sourceId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid source' });
    }
    
    // Create new movie
    const movie = new Movie(movieData);
    await movie.save();
    
    res.status(201).json({
      success: true,
      message: 'Movie imported successfully',
      movie
    });
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      error: 'Failed to import movie',
      details: error.message 
    });
  }
};

// TMDB Importer
const importFromTMDB = async (tmdbId) => {
  const response = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
  );
  
  const movie = response.data;
  
  return {
    title: movie.title,
    description: movie.overview,
    releaseYear: new Date(movie.release_date).getFullYear(),
    duration: movie.runtime,
    genres: movie.genres.map(g => g.name),
    cast: movie.credits.cast.slice(0, 10).map(actor => ({
      name: actor.name,
      character: actor.character
    })),
    director: movie.credits.crew.find(c => c.job === 'Director')?.name || '',
    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    backdrop: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
    trailer: movie.videos.results.find(v => v.type === 'Trailer')?.key || '',
    rating: movie.vote_average,
    source: 'tmdb',
    sourceId: tmdbId
  };
};

// OMDB Importer
const importFromOMDB = async (imdbId) => {
  const response = await axios.get(
    `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
  );
  
  const movie = response.data;
  
  return {
    title: movie.Title,
    description: movie.Plot,
    releaseYear: parseInt(movie.Year) || new Date().getFullYear(),
    duration: parseInt(movie.Runtime) || 0,
    genres: movie.Genre.split(', '),
    cast: [], // OMDB doesn't provide cast details
    director: movie.Director,
    poster: movie.Poster,
    rating: parseFloat(movie.imdbRating) || 0,
    source: 'omdb',
    sourceId: imdbId
  };
};

// IMDB Importer (Placeholder)
const importFromIMDB = async (imdbId) => {
  // Note: IMDB doesn't have a public API
  // This is a placeholder for future implementation
  return {
    title: `IMDB Movie ${imdbId}`,
    description: 'Movie imported from IMDB',
    releaseYear: new Date().getFullYear(),
    duration: 120,
    genres: ['Action', 'Drama'],
    cast: [],
    director: 'Unknown',
    poster: '',
    rating: 7.5,
    source: 'imdb',
    sourceId: imdbId
  };
};
