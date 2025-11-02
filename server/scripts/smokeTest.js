#!/usr/bin/env node
/*
  Simple smoke test script for local development.
  Usage:
    TOKEN=your_jwt node scripts/smokeTest.js

  If TOKEN is not provided via env, it will look for a default token (useful for local dev).
*/
import axios from 'axios'

const DEFAULT_TOKEN = process.env.DEFAULT_TEST_TOKEN || ''
const TOKEN = process.env.TOKEN || DEFAULT_TOKEN
if (!TOKEN) {
  console.error('No TOKEN provided. Set TOKEN env var to a valid JWT.')
  process.exit(1)
}

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:5000',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function ensureShort() {
  console.log('Fetching existing shorts...')
  const res = await api.get('/api/library/shorts?limit=1')
  if (res.data.total && res.data.total > 0 && res.data.shorts.length > 0) {
    return res.data.shorts[0]
  }

  console.log('No shorts found — creating a sample short...')
  const payload = {
    title: 'Smoke Test Short',
    description: 'Auto-created by smokeTest',
    videoUrl: 'https://example.com/sample-short.mp4',
    thumbnail: 'https://via.placeholder.com/320x180.png?text=Short',
    duration: 30,
    tags: ['smoke', 'test'],
  }

  console.log('Posting to /api/library/shorts ...')
  const created = await api.post('/api/library/shorts', payload)
  return created.data
}

async function ensureMovie() {
  console.log('Fetching existing movies...')
  const res = await api.get('/api/movies?limit=1')
  if (res.data.total && res.data.total > 0 && res.data.movies.length > 0) {
    return res.data.movies[0]
  }

  console.log('No movies found — creating a sample movie...')
  const payload = {
    title: 'Smoke Test Movie',
    description: 'Auto-created movie for smoke tests',
    poster: 'https://via.placeholder.com/640x360.png?text=Poster',
    year: 2024,
    duration: 95,
    genre: ['drama'],
    director: 'Test Director',
    videoUrl: '',
  }

  console.log('Posting to /api/movies ...')
  const created = await api.post('/api/movies', payload)
  return created.data.movie
}

async function run() {
  try {
    console.log('Starting smoke tests...')

    // Shorts: ensure one exists
    const short = await ensureShort()
    console.log('Using short id:', short._id)

    // Get short details
    const before = await api.get(`/api/library/shorts/${short._id}`)
    console.log('Short before likes count:', before.data.likes ? before.data.likes.length : (before.data.likes || 0))

    // Like
    const likeRes = await api.post(`/api/library/shorts/${short._id}/like`)
    console.log('Like response likes count:', likeRes.data.likes ? likeRes.data.likes.length : (likeRes.data.likes || 0))

    // Unlike (toggle)
    const unlikeRes = await api.post(`/api/library/shorts/${short._id}/like`)
    console.log('After toggle likes count:', unlikeRes.data.likes ? unlikeRes.data.likes.length : (unlikeRes.data.likes || 0))

    // Movies: ensure one exists
    const movie = await ensureMovie()
    console.log('Using movie id:', movie._id)

    // Subscribe current user to premium (so downloads allowed)
    console.log('Subscribing to premium plan for downloads...')
    const subRes = await api.post('/api/subscriptions/subscribe', { planType: 'premium' })
    console.log('Subscription result:', subRes.data.message || subRes.data)

    // Wait a moment for DB writes
    await wait(500)

    // Get download links
    const dl = await api.get(`/api/movies/${movie._id}/download`)
    console.log('Download qualities available:', dl.data.downloadLinks.qualities.map(q => q.quality).join(', '))

    // Track a download (1080p)
    const track = await api.post(`/api/movies/${movie._id}/download/track`, { quality: '1080p' })
    console.log('Track download response:', track.data)

    console.log('Smoke tests completed successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Smoke test failed:', error.response ? error.response.data || error.response.statusText : error.message)
    process.exit(2)
  }
}

run()
