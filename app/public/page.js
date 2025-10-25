'use client';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function PublicReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews/hostaway');
        const json = await res.json();
        const approvedOnly = (json.data || []).filter(r => r.approved === true);
        setReviews(approvedOnly);
      } catch (error) {
        console.error('Error fetching public reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);
 // Handlers for navigation
  const handleNext = useCallback(() => {
    setDirection('next');
    setCurrentIndex(prev => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const handlePrev = useCallback(() => {
    setDirection('prev');
    setCurrentIndex(prev => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  const handleDotClick = useCallback((index) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 'next' : 'prev');
    setCurrentIndex(index);
  }, [currentIndex]);

  useEffect(() => {
    if (reviews.length > 1) {
      const timer = setInterval(() => handleNext(), 5000);
      return () => clearInterval(timer);
    }
  }, [reviews.length, handleNext, currentIndex]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-teal-700 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }
 // Main render
  const currentReview = reviews[currentIndex];

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-[#2d5550] text-white px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
              <path d="M8 8h10v24H8V8zm14 0h10v10H22V8zm0 14h10v10H22V22z" fill="currentColor"/>
            </svg>
            <span className="text-xl font-light">the flex.</span>
          </div>
          <Link
            href="/"
            className="text-white text-sm hover:underline transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </nav>

      <div className="px-6 py-20 bg-stone-50 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-normal text-gray-900 mb-6">
            What Our Clients Think
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from the companies we work with. Discover how our flexible corporate rental solutions help them simplify relocations, support staff, and secure reliable short- and long-term housing with ease.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <p className="text-gray-500 text-xl">No reviews available yet.</p>
          </div>
        ) : (
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-stone-300 text-8xl font-serif leading-none">"</span>
            </div>

            <div className="relative overflow-hidden">
              <div
                key={currentIndex}
                className={`bg-white rounded-2xl shadow-sm px-16 py-12 animate-slideIn ${
                  direction === 'next' ? 'animate-slideInFromRight' : 'animate-slideInFromLeft'
                }`}
                style={{
                  animation: 'slideIn 0.5s ease-out'
                }}
              >
                <button
                  onClick={handlePrev}
                  disabled={reviews.length <= 1}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-10"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>

                <div className="text-center max-w-4xl mx-auto">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-6 shadow-md">
                    {currentReview?.photoUrl ? (
                      <img
                        src={currentReview.photoUrl}
                        alt={currentReview.guestName || 'Guest'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-teal-600 to-teal-400 w-full h-full flex items-center justify-center">
                        <span className="text-white text-2xl font-medium">
                          {currentReview?.guestName?.charAt(0)?.toUpperCase() || 'G'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mb-6 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round((currentReview?.rating || 0) / 2)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 fill-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <blockquote className="text-xl md:text-2xl italic text-gray-700 leading-relaxed mb-8 font-normal">
                    "{currentReview?.publicReview || 'No review text available.'}"
                  </blockquote>

                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {currentReview?.guestName || 'Anonymous'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {currentReview?.position || 'Verified Guest'}
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  disabled={reviews.length <= 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-10"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>

            {reviews.length > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDotClick(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'bg-[#2d5550] w-8'
                        : 'bg-gray-300 w-2 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {reviews.length > 1 && (
              <div className="text-center mt-6">
                <p className="text-gray-500 text-sm">
                  {currentIndex + 1} of {reviews.length}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Flex Living. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(${direction === 'next' ? '30px' : '-30px'});
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}