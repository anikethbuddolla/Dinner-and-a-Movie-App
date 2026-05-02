import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    const isRestaurantRequest = url.includes('/api/restaurant');

    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve(
          isRestaurantRequest
            ? {
                name: 'Test Restaurant',
                categories: 'Pizza',
                rating: 4.5,
                reviewCount: 100,
                price: '$$',
                address: '123 Test St',
                url: 'https://example.com'
              }
            : {
                title: 'Test Movie',
                overview: 'A test movie overview.',
                rating: 8.2,
                releaseDate: '2026-01-01',
                url: 'https://example.com'
              }
        )
    });
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the app title', () => {
  render(<App />);
  expect(screen.getByText(/Dinner and a Movie/i)).toBeInTheDocument();
});
