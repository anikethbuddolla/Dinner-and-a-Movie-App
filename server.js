require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(express.json());

const yelpCategories = [
  'restaurants',
  'pizza',
  'mexican',
  'burgers',
  'sushi',
  'italian',
  'chinese',
  'thai',
  'indpak',
  'bbq',
  'seafood',
  'breakfast_brunch'
];

function chooseRandom(items) {
  if (!items || items.length === 0) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

app.get('/api/health', (req, res) => {
  res.json({ message: 'Dinner and Movie API is running!' });
});

app.get('/api/restaurant', async (req, res) => {
  try {
    if (!process.env.YELP_API_KEY) {
      return res.status(500).json({ message: 'Missing YELP_API_KEY in .env file.' });
    }

    const location = req.query.location || 'College Station, TX';
    const category = req.query.category || chooseRandom(yelpCategories);
    const offset = Math.floor(Math.random() * 80);

    const yelpUrl = new URL('https://api.yelp.com/v3/businesses/search');
    yelpUrl.searchParams.set('location', location);
    yelpUrl.searchParams.set('categories', category);
    yelpUrl.searchParams.set('limit', '20');
    yelpUrl.searchParams.set('offset', offset.toString());
    yelpUrl.searchParams.set('sort_by', 'best_match');

    const response = await fetch(yelpUrl, {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        accept: 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.error?.description || 'Yelp API request failed.'
      });
    }

    const business = chooseRandom(data.businesses);

    if (!business) {
      return res.status(404).json({ message: 'No restaurants found. Try a different location.' });
    }

    res.json({
      id: business.id,
      name: business.name,
      imageUrl: business.image_url,
      url: business.url,
      rating: business.rating,
      reviewCount: business.review_count,
      price: business.price || 'Price not listed',
      phone: business.display_phone || 'Phone not listed',
      address: business.location?.display_address?.join(', ') || 'Address not listed',
      categories: business.categories?.map((categoryItem) => categoryItem.title).join(', ') || 'Restaurant',
      searchedCategory: category
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while getting a restaurant.' });
  }
});

app.get('/api/movie', async (req, res) => {
  try {
    if (!process.env.TMDB_API_KEY) {
      return res.status(500).json({ message: 'Missing TMDB_API_KEY in .env file.' });
    }

    const page = Math.floor(Math.random() * 20) + 1;

    const movieUrl = new URL('https://api.themoviedb.org/3/discover/movie');
    movieUrl.searchParams.set('api_key', process.env.TMDB_API_KEY);
    movieUrl.searchParams.set('include_adult', 'false');
    movieUrl.searchParams.set('include_video', 'false');
    movieUrl.searchParams.set('language', 'en-US');
    movieUrl.searchParams.set('page', page.toString());
    movieUrl.searchParams.set('sort_by', 'popularity.desc');
    movieUrl.searchParams.set('vote_count.gte', '400');

    const response = await fetch(movieUrl);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data?.status_message || 'TMDB API request failed.'
      });
    }

    const movie = chooseRandom(data.results);

    if (!movie) {
      return res.status(404).json({ message: 'No movies found. Try again.' });
    }

    res.json({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || 'No overview available.',
      releaseDate: movie.release_date || 'Unknown release date',
      rating: movie.vote_average,
      posterUrl: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '',
      url: `https://www.themoviedb.org/movie/${movie.id}`
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while getting a movie.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
