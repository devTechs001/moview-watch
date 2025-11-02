import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const DELAY = 250; // 250ms delay between requests to avoid rate limiting

async function getMovieDetails(tmdbId) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie ${tmdbId}:`, error.message);
    return null;
  }
}

async function importMovie(tmdbMovie, admin) {
  try {
    // Check if movie already exists
    const existingMovie = await Movie.findOne({ 'externalId.tmdb': tmdbMovie.id });
    if (existingMovie) {
      console.log(`⏭️  Skipping ${tmdbMovie.title} - already exists`);
      return { status: 'skipped', title: tmdbMovie.title };
    }

    const trailer = tmdbMovie.videos?.results?.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    const movie = await Movie.create({
      title: tmdbMovie.title,
      description: tmdbMovie.overview,
      poster: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/original${tmdbMovie.backdrop_path}`,
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
      videoUrl: '', // Will be added later
      year: new Date(tmdbMovie.release_date).getFullYear(),
      duration: tmdbMovie.runtime,
      genre: tmdbMovie.genres.map((g) => g.name),
      director: tmdbMovie.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Unknown',
      cast: tmdbMovie.credits?.cast?.slice(0, 10).map((c) => c.name) || [],
      rating: tmdbMovie.vote_average,
      ratingCount: tmdbMovie.vote_count,
      source: 'tmdb',
      externalId: {
        tmdb: tmdbMovie.id,
        imdb: tmdbMovie.imdb_id,
      },
      status: 'active',
      addedBy: admin._id
    });

    console.log(`✅ Imported: ${movie.title}`);
    return { status: 'success', title: movie.title };
  } catch (error) {
    console.error(`❌ Failed to import ${tmdbMovie.title}:`, error.message);
    return { status: 'failed', title: tmdbMovie.title, error: error.message };
  }
}

async function importFromList(endpoint, admin) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}`
    );

    const movies = response.data.results;
    console.log(`📥 Found ${movies.length} movies from ${endpoint}`);

    const results = {
      success: 0,
      failed: 0,
      skipped: 0
    };

    for (const movie of movies) {
      const details = await getMovieDetails(movie.id);
      if (details) {
        const result = await importMovie(details, admin);
        results[result.status]++;
        await new Promise(resolve => setTimeout(resolve, DELAY));
      }
    }

    return results;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error.message);
    return null;
  }
}

async function getOrCreateAdmin() {
  try {
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@cinemaflix.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Created admin user');
    } else {
      console.log('✅ Using existing admin user');
    }
    return admin;
  } catch (error) {
    console.error('❌ Failed to get/create admin:', error);
    throw error;
  }
}

async function bulkImport() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');
    
    const admin = await getOrCreateAdmin();

    console.log('\n📥 Importing popular movies...');
    const popularResults = await importFromList('movie/popular', admin);
    
    console.log('\n📥 Importing trending movies...');
    const trendingResults = await importFromList('trending/movie/week', admin);

    console.log('\n📊 Import Summary:');
    console.log('Popular Movies:', popularResults);
    console.log('Trending Movies:', trendingResults);

    await mongoose.disconnect();
    console.log('\n✅ Done! Database connection closed.');
  } catch (error) {
    console.error('❌ Bulk import failed:', error);
  }
}

// Run the import
bulkImport();