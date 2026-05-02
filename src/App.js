import { useEffect, useState } from 'react';
import './App.css';

const placeholderRestaurant =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80';

const placeholderMovie =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80';

function App() {
  const [restaurant, setRestaurant] = useState(null);
  const [movie, setMovie] = useState(null);
  const [location, setLocation] = useState('College Station, TX');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getRandomMatch() {
    try {
      setLoading(true);
      setError('');

      const restaurantRequest = fetch(
        `/api/restaurant?location=${encodeURIComponent(location)}`
      );
      const movieRequest = fetch('/api/movie');

      const [restaurantResponse, movieResponse] = await Promise.all([
        restaurantRequest,
        movieRequest
      ]);

      const restaurantData = await restaurantResponse.json();
      const movieData = await movieResponse.json();

      if (!restaurantResponse.ok) {
        throw new Error(restaurantData.message || 'Could not load a restaurant.');
      }

      if (!movieResponse.ok) {
        throw new Error(movieData.message || 'Could not load a movie.');
      }

      setRestaurant(restaurantData);
      setMovie(movieData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getRandomMatch();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    getRandomMatch();
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Random night-out generator</p>
        <h1>Dinner and a Movie</h1>
        <p className="tagline">
          Can't decide what to eat or watch? Enter your city, then generate a
          fresh restaurant and movie match-up.
        </p>

        <form className="search-form" onSubmit={handleSubmit}>
          <label htmlFor="location">Location</label>
          <div className="input-row">
            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Example: Houston, TX"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Matching...' : 'Randomize Match'}
            </button>
          </div>
        </form>

        {error && <p className="error-message">{error}</p>}
      </section>

      <section className="match-area" aria-label="Dinner and movie match">
        <article className="card restaurant-card">
          <div className="image-wrap">
            <img
              src={restaurant?.imageUrl || placeholderRestaurant}
              alt={restaurant?.name || 'Restaurant table'}
            />
          </div>
          <div className="card-content">
            <p className="card-label">Dinner</p>
            <h2>{restaurant?.name || 'Restaurant loading...'}</h2>
            <p className="description">{restaurant?.categories || 'Finding a restaurant...'}</p>
            <div className="details-grid">
              <span>⭐ {restaurant?.rating || '--'} rating</span>
              <span>💬 {restaurant?.reviewCount || '--'} reviews</span>
              <span>💵 {restaurant?.price || '--'}</span>
              <span>📍 {restaurant?.address || '--'}</span>
            </div>
            {restaurant?.url && (
              <a href={restaurant.url} target="_blank" rel="noreferrer" className="card-link">
                View on Yelp
              </a>
            )}
          </div>
        </article>

        <div className="plus-sign">+</div>

        <article className="card movie-card">
          <div className="image-wrap poster-wrap">
            <img
              src={movie?.posterUrl || placeholderMovie}
              alt={movie?.title || 'Movie theater'}
            />
          </div>
          <div className="card-content">
            <p className="card-label">Movie</p>
            <h2>{movie?.title || 'Movie loading...'}</h2>
            <p className="description movie-description">
              {movie?.overview || 'Finding a movie...'}
            </p>
            <div className="details-grid">
              <span>⭐ {movie?.rating ? movie.rating.toFixed(1) : '--'} / 10</span>
              <span>📅 {movie?.releaseDate || '--'}</span>
            </div>
            {movie?.url && (
              <a href={movie.url} target="_blank" rel="noreferrer" className="card-link">
                View on TMDB
              </a>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
