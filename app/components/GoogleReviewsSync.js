'use client';
import { useState } from 'react';
import { Search, MapPin, Star, CheckCircle, AlertCircle } from 'lucide-react';

export default function GoogleReviewsSync() {
  const [propertyName, setPropertyName] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  const searchProperty = async () => {
    if (!propertyName.trim()) {
      setError('Please enter a property name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/reviews/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyName })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setSearchResult(data);
      setPlaceId(data.placeId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!placeId) {
      setError('No Place ID available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/reviews/google?placeId=${placeId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      setReviews(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          Google Reviews Integration
        </h2>
        
        <p className="text-gray-600 mb-6">
          Search for your property on Google to fetch reviews from Google Maps
        </p>

        {/* Search Box */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={propertyName}
            onChange={(e) => setPropertyName(e.target.value)}
            placeholder="Enter property name or address..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-600"
            onKeyPress={(e) => e.key === 'Enter' && searchProperty()}
          />
          <button
            onClick={searchProperty}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search Result */}
        {searchResult && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">{searchResult.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">{searchResult.address}</p>
                <p className="text-xs text-gray-500">Place ID: {searchResult.placeId}</p>
              </div>
              <button
                onClick={fetchReviews}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 whitespace-nowrap"
              >
                Fetch Reviews
              </button>
            </div>
          </div>
        )}

        {/* Manual Place ID Input */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm text-gray-600 mb-2">Or enter Place ID manually:</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
               className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-4x00 text-sm"
            />
            <button
              onClick={fetchReviews}
              disabled={loading || !placeId}
              className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
            >
              Fetch
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Display */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Found {reviews.length} Google Reviews
          </h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <img
                    src={review.photoUrl}
                    alt={review.guestName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{review.guestName}</h4>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold text-gray-900">{review.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{review.publicReview}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}