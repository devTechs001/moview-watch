import Movie from '../models/Movie.js'
import User from '../models/User.js'

const seedMovies = async () => {
  try {
    // Check if movies already exist
    const existingMovies = await Movie.countDocuments()
    if (existingMovies > 0) {
      console.log('✅ Movies already seeded')
      return
    }

    // Get admin user or create one
    let adminUser = await User.findOne({ role: 'admin' })
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@cinemaflix.com',
        password: 'admin123',
        role: 'admin',
        avatar: ''
      })
    }

    // Sample movies data
    const movies = [
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        poster: 'https://images.unsplash.com/photo-1489599314810-fc8c27bbf3c8?w=400&h=600&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1489599314810-fc8c27bbf3c8?w=1920&h=800&fit=crop',
        trailer: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        year: 2008,
        duration: 152,
        genre: ['Action', 'Crime', 'Drama'],
        director: 'Christopher Nolan',
        cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
        rating: 9.0,
        ratingCount: 2847,
        likes: 15420,
        views: 234567,
        status: 'active',
        featured: true,
        addedBy: adminUser._id
      },
      {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=800&fit=crop',
        trailer: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        year: 2010,
        duration: 148,
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        director: 'Christopher Nolan',
        cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy', 'Ellen Page'],
        rating: 8.8,
        ratingCount: 2456,
        likes: 12350,
        views: 198543,
        status: 'active',
        featured: true,
        addedBy: adminUser._id
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&h=800&fit=crop',
        trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        year: 2014,
        duration: 169,
        genre: ['Adventure', 'Drama', 'Sci-Fi'],
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Mackenzie Foy'],
        rating: 8.6,
        ratingCount: 1987,
        likes: 9876,
        views: 156789,
        status: 'active',
        featured: false,
        addedBy: adminUser._id
      },
      {
        title: 'The Matrix',
        description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=600&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=800&fit=crop',
        trailer: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        year: 1999,
        duration: 136,
        genre: ['Action', 'Sci-Fi'],
        director: 'The Wachowskis',
        cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving'],
        rating: 8.7,
        ratingCount: 2156,
        likes: 11234,
        views: 187654,
        status: 'active',
        featured: true,
        addedBy: adminUser._id
      },
      {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        poster: 'https://images.unsplash.com/photo-1489599314810-fc8c27bbf3c8?w=400&h=600&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1489599314810-fc8c27bbf3c8?w=1920&h=800&fit=crop',
        trailer: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        year: 1994,
        duration: 154,
        genre: ['Crime', 'Drama'],
        director: 'Quentin Tarantino',
        cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis'],
        rating: 8.9,
        ratingCount: 1897,
        likes: 10876,
        views: 165432,
        status: 'active',
        featured: false,
        addedBy: adminUser._id
      },
      {
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&h=800&fit=crop',
        trailer: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        year: 1994,
        duration: 142,
        genre: ['Drama'],
        director: 'Frank Darabont',
        cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'],
        rating: 9.3,
        ratingCount: 2678,
        likes: 14567,
        views: 203456,
        status: 'active',
        featured: true,
        addedBy: adminUser._id
      }
    ]

    // Create movies
    await Movie.create(movies)
    console.log('✅ Sample movies seeded successfully')

  } catch (error) {
    console.error('❌ Error seeding movies:', error)
  }
}

export default seedMovies
