import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const DELAY = 250; // Delay between requests

// Content types to import
const CONTENT_TYPES = {
  MOVIES: 'movie',
  TV: 'tv',
  ANIMATION: 'animation',
  SHORTS: 'short_film',
  DOCUMENTARIES: 'documentary'
};

// Categories to import for each content type
const CATEGORIES = {
  popular: '/popular',
  trending: '/trending',
  topRated: '/top_rated',
  nowPlaying: '/now_playing',
  upcoming: '/upcoming',
  discover: '/discover'
};

async function getOrCreateAdmin() {
  try {
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('Creating admin user...');
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@cinemaflix.com',
        password: 'admin123',
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

async function getMovieDetails(tmdbId, contentType = 'movie') {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/${contentType}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${contentType} ${tmdbId}:`, error.message);
    return null;
  }
}

async function importContent(tmdbContent, contentType, admin) {
  try {
    // Check if already exists
    const existingContent = await Movie.findOne({ 'externalId.tmdb': tmdbContent.id });
    if (existingContent) {
      console.log(`⏭️  Skipping ${tmdbContent.title || tmdbContent.name} - already exists`);
      return { status: 'skipped', title: tmdbContent.title || tmdbContent.name };
    }

    const trailer = tmdbContent.videos?.results?.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );

    // Map content based on type
    const content = {
      title: tmdbContent.title || tmdbContent.name,
      description: tmdbContent.overview,
      poster: tmdbContent.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbContent.poster_path}` : '',
      backdrop: tmdbContent.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbContent.backdrop_path}` : '',
      trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
      videoUrl: '', // To be added later
      year: new Date(tmdbContent.release_date || tmdbContent.first_air_date).getFullYear(),
      duration: tmdbContent.runtime || (tmdbContent.episode_run_time ? tmdbContent.episode_run_time[0] : 0),
      genre: tmdbContent.genres.map((g) => g.name),
      director: tmdbContent.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Unknown',
      cast: tmdbContent.credits?.cast?.slice(0, 10).map((c) => c.name) || [],
      rating: tmdbContent.vote_average,
      ratingCount: tmdbContent.vote_count,
      source: 'tmdb',
      contentType: contentType,
      status: 'active',
      featured: tmdbContent.vote_average >= 8.0,
      externalId: {
        tmdb: tmdbContent.id,
        imdb: tmdbContent.imdb_id || ''
      },
      addedBy: admin._id
    };

    const movie = await Movie.create(content);
    console.log(`✅ Imported: ${movie.title}`);
    return { status: 'success', title: movie.title };
  } catch (error) {
    console.error(`❌ Failed to import ${tmdbContent.title || tmdbContent.name}:`, error.message);
    return { status: 'failed', title: tmdbContent.title || tmdbContent.name, error: error.message };
  }
}

async function discoverContent(contentType, params = {}) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/discover/${contentType}`, {
        params: {
          api_key: TMDB_API_KEY,
          ...params
        }
      }
    );
    return response.data.results;
  } catch (error) {
    console.error(`Failed to discover ${contentType}:`, error.message);
    return [];
  }
}

async function importFromCategory(contentType, category, params = {}, admin) {
  try {
    let endpoint;
    let results;

    if (category === 'discover') {
      results = await discoverContent(contentType, params);
    } else {
      endpoint = `${contentType}${CATEGORIES[category]}`;
      const response = await axios.get(
        `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}`
      );
      results = response.data.results;
    }

    console.log(`📥 Found ${results.length} items in ${category} ${contentType}`);

    const importResults = {
      success: 0,
      failed: 0,
      skipped: 0
    };

    for (const item of results) {
      const details = await getMovieDetails(item.id, contentType);
      if (details) {
        const result = await importContent(details, contentType, admin);
        importResults[result.status]++;
        await new Promise(resolve => setTimeout(resolve, DELAY));
      }
    }

    return importResults;
  } catch (error) {
    console.error(`Failed to import from ${category}:`, error.message);
    return { success: 0, failed: 0, skipped: 0 };
  }
}

async function bulkImportAll() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database');
    
    const admin = await getOrCreateAdmin();
    const summary = {};

    // Import Movies
    console.log('\n📽️  Importing Movies...');
    summary.movies = {
      popular: await importFromCategory(CONTENT_TYPES.MOVIES, 'popular', {}, admin),
      trending: await importFromCategory(CONTENT_TYPES.MOVIES, 'trending', {}, admin),
      topRated: await importFromCategory(CONTENT_TYPES.MOVIES, 'topRated', {}, admin)
    };

    // Import Animations
    console.log('\n🎬 Importing Animations...');
    summary.animations = {
      discover: await importFromCategory(CONTENT_TYPES.MOVIES, 'discover', {
        with_genres: 16, // Animation genre ID
        sort_by: 'popularity.desc'
      }, admin)
    };

    // Import Documentaries
    console.log('\n📚 Importing Documentaries...');
    summary.documentaries = {
      discover: await importFromCategory(CONTENT_TYPES.MOVIES, 'discover', {
        with_genres: 99, // Documentary genre ID
        sort_by: 'popularity.desc'
      }, admin)
    };

    // Import Short Films
    console.log('\n🎥 Importing Short Films...');
    summary.shorts = {
      discover: await importFromCategory(CONTENT_TYPES.MOVIES, 'discover', {
        with_runtime_lte: 40, // 40 minutes or less
        sort_by: 'popularity.desc'
      }, admin)
    };

    console.log('\n📊 Import Summary:', JSON.stringify(summary, null, 2));

    await mongoose.disconnect();
    console.log('\n✅ Done! Database connection closed.');
  } catch (error) {
    console.error('❌ Bulk import failed:', error);
  }
}

// Run the import
bulkImportAll();