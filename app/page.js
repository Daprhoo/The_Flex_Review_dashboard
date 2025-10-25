'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Star, Filter, TrendingUp, CheckCircle, XCircle, MessageSquare, MapPin } from 'lucide-react';
import GoogleReviewsSync from '@/app/components/GoogleReviewsSync';

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('hostaway');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    rating: '', 
    channel: '', 
    category: '',
    property: '',
    approval: '' 
  });
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews/hostaway');
        const json = await res.json();
        const reviewsData = json.data || [];
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  const toggleApprove = async (id) => {
    try {
      const review = reviews.find(r => r.id === id);
      const newApprovalStatus = !review.approved;
      
      setReviews(prev => 
        prev.map(r => r.id === id ? { ...r, approved: newApprovalStatus } : r)
      );
      
      await fetch('/api/reviews/hostaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: newApprovalStatus })
      });
    } catch (err) {
      console.error('Failed to update approval', err);
      setReviews(prev => 
        prev.map(r => r.id === id ? { ...r, approved: !r.approved } : r)
      );
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredReviews = useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) return [];
    return reviews
      .filter((r) => {
        const ratingMatch = !filters.rating || r.rating >= parseInt(filters.rating);
        const channelMatch = !filters.channel || r.channel === filters.channel;
        const categoryMatch = !filters.category || 
          r.reviewCategory.some((c) => c.category === filters.category);
        const propertyMatch = !filters.property || r.listingName === filters.property;
        const approvalMatch = !filters.approval || 
          (filters.approval === 'approved' ? r.approved : !r.approved);
        return ratingMatch && channelMatch && categoryMatch && propertyMatch && approvalMatch;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        if (sortBy === 'submittedAt') {
          valA = new Date(valA);
          valB = new Date(valB);
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [reviews, filters, sortBy, sortOrder]);

  const totalReviews = reviews.length;
  const approvedCount = reviews.filter(r => r.approved).length;
  const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / (totalReviews || 1);
  
  const byProperty = useMemo(() => {
    const grouped = {};
    reviews.forEach(r => {
      if (!grouped[r.listingName]) {
        grouped[r.listingName] = { 
          name: r.listingName, 
          count: 0, 
          sumRating: 0,
          approved: 0 
        };
      }
      grouped[r.listingName].count++;
      grouped[r.listingName].sumRating += r.rating || 0;
      if (r.approved) grouped[r.listingName].approved++;
    });
    return Object.values(grouped);
  }, [reviews]);

  const recurringIssues = useMemo(() => {
    const issues = {};
    reviews.forEach(r => 
      r.reviewCategory.forEach(c => {
        if (c.rating <= 6) {
          issues[c.category] = (issues[c.category] || 0) + 1;
        }
      })
    );
    return issues;
  }, [reviews]);

  const channels = [...new Set(reviews.map(r => r.channel))];
  const categories = [...new Set(reviews.flatMap(r => r.reviewCategory.map(c => c.category)))];
  const properties = [...new Set(reviews.map(r => r.listingName))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reviews Dashboard</h1>
            <p className="text-sm text-gray-600">Manage and approve guest reviews</p>
          </div>
          <Link 
            href="/public" 
            className="px-5 py-2.5 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors font-medium whitespace-nowrap"
          >
            View Public Page
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('hostaway')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'hostaway'
                ? 'bg-teal-700 text-white shadow-md'
                : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Hostaway Reviews
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'google'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Google Reviews
          </button>
        </div>

        {activeTab === 'hostaway' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                    <p className="text-3xl font-semibold text-gray-900">{totalReviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <p className="text-3xl font-semibold text-gray-900">{approvedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-semibold text-gray-900">{totalReviews - approvedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Avg Rating</p>
                    <p className="text-3xl font-semibold text-gray-900">{avgRating.toFixed(1)}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-700" />
                Property Performance
              </h3>
              <div className="space-y-3">
                {byProperty.map(prop => (
                  <div key={prop.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{prop.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{prop.count} reviews</span>
                        <span>·</span>
                        <span className="text-green-600 font-medium">{prop.approved} approved</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-md">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{(prop.sumRating / prop.count).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recurring Issues */}
            {Object.keys(recurringIssues).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Recurring Issues (Rating ≤ 6)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(recurringIssues).map(([cat, count]) => (
                    <div key={cat} className="bg-white rounded p-3">
                      <span className="font-medium text-gray-900 capitalize">
                        {cat.replace(/_/g, ' ')}
                      </span>
                      <span className="text-red-600 font-semibold ml-2">{count} issues</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-teal-700" />
                Filters & Sorting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <select 
                  name="property" 
                  value={filters.property} 
                  onChange={handleFilterChange} 
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 font-medium bg-white cursor-pointer hover:border-teal-500 transition-colors"
                >
                  <option value="">All Properties</option>
                  {properties.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select 
                  name="approval" 
                  value={filters.approval} 
                  onChange={handleFilterChange} 
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 font-medium bg-white cursor-pointer hover:border-teal-500 transition-colors"
                >
                  <option value="">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>

                <select 
                  name="rating" 
                  value={filters.rating} 
                  onChange={handleFilterChange} 
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 font-medium bg-white cursor-pointer hover:border-teal-500 transition-colors"
                >
                  <option value="">All Ratings</option>
                  <option value="9">9+ Stars</option>
                  <option value="8">8+ Stars</option>
                  <option value="7">7+ Stars</option>
                  <option value="5">5+ Stars</option>
                </select>

                <select 
                  name="channel" 
                  value={filters.channel} 
                  onChange={handleFilterChange} 
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 font-medium bg-white cursor-pointer hover:border-teal-500 transition-colors"
                >
                  <option value="">All Channels</option>
                  {channels.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select 
                  name="category" 
                  value={filters.category} 
                  onChange={handleFilterChange} 
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 font-medium bg-white cursor-pointer hover:border-teal-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                </select>

                <select 
                  value={`${sortBy}-${sortOrder}`} 
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }} 
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 font-medium bg-white cursor-pointer hover:border-teal-500 transition-colors"
                >
                  <option value="submittedAt-desc">Newest First</option>
                  <option value="submittedAt-asc">Oldest First</option>
                  <option value="rating-desc">Highest Rating</option>
                  <option value="rating-asc">Lowest Rating</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  All Reviews ({filteredReviews.length})
                </h3>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="p-12 text-center">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews match your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredReviews.map(review => (
                    <div 
                      key={review.id} 
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{review.guestName}</h4>
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                              {review.channel}
                            </span>
                            {review.approved && (
                              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full flex items-center gap-1 font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Approved
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {review.listingName}
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            {new Date(review.submittedAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-gray-700 mb-3 leading-relaxed">{review.publicReview}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {review.reviewCategory.map(cat => (
                              <div key={cat.category} className="flex items-center gap-1.5">
                                <span className="capitalize">{cat.category.replace(/_/g, ' ')}</span>
                                <span className={`font-semibold ${cat.rating <= 6 ? 'text-red-600' : 'text-gray-900'}`}>
                                  {cat.rating}/10
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-1.5 bg-teal-700 text-white px-3 py-1.5 rounded-md">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-semibold">{review.rating}/10</span>
                          </div>
                          <button
                            onClick={() => toggleApprove(review.id)}
                            className={`px-4 py-2 rounded-md font-medium transition-colors text-sm whitespace-nowrap ${
                              review.approved
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {review.approved ? 'Unapprove' : 'Approve'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <GoogleReviewsSync />
        )}
      </div>

      <footer className="text-center py-6 bg-white border-t border-gray-200 mt-10 text-sm text-gray-600">
        © {new Date().getFullYear()} Flex Living – Dashboard 🚀
      </footer>
    </main>
  );
}