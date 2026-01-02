import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext.jsx';
import axios from 'axios';

export default function AnalyticsDashboard({ placeId }) {
    
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (placeId) {
            fetchAnalytics();
        }
    }, [placeId, selectedPeriod]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/ml/analytics/place/${placeId}?period=${selectedPeriod}`);
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const generateAnalytics = async () => {
        try {
            await axios.post('/ml/analytics/generate', {
                entityType: 'place',
                entityId: placeId,
                period: selectedPeriod
            });
            fetchAnalytics(); // Refresh after generation
        } catch (error) {
            console.error('Error generating analytics:', error);
            setError('Failed to generate analytics');
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={fetchAnalytics}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const currentAnalytics = analytics?.[0]?.metrics?.placePerformance;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Property Analytics</h2>
                <div className="flex gap-2">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <button
                        onClick={generateAnalytics}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Generate Analytics
                    </button>
                </div>
            </div>

            {currentAnalytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Views */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium">Total Views</p>
                                <p className="text-2xl font-bold text-blue-900">{currentAnalytics.views || 0}</p>
                            </div>
                            <div className="text-blue-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Bookings */}
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium">Total Bookings</p>
                                <p className="text-2xl font-bold text-green-900">{currentAnalytics.bookings || 0}</p>
                            </div>
                            <div className="text-green-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Revenue */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-600 text-sm font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-yellow-900">₹{currentAnalytics.revenue || 0}</p>
                            </div>
                            <div className="text-yellow-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Occupancy Rate */}

                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-600 text-sm font-medium">Occupancy Rate</p>
                                <p className="text-2xl font-bold text-purple-900">
                                    {Math.round((currentAnalytics.occupancyRate || 0) * 100)}%
                                </p>
                            </div>
                            <div className="text-purple-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Average Rating */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-600 text-sm font-medium">Average Rating</p>
                                <p className="text-2xl font-bold text-orange-900">
                                    {currentAnalytics.averageRating ? currentAnalytics.averageRating.toFixed(1) : 'N/A'}
                                </p>
                            </div>
                            <div className="text-orange-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Review Count */}
                    <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-600 text-sm font-medium">Total Reviews</p>
                                <p className="text-2xl font-bold text-indigo-900">{currentAnalytics.reviewCount || 0}</p>
                            </div>
                            <div className="text-indigo-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No analytics data available for this period.</p>
                    <button
                        onClick={generateAnalytics}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Generate Analytics
                    </button>
                </div>
            )}
        </div>
    );
}




