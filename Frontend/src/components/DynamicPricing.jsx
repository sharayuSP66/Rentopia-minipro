import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DynamicPricing({ place, onPriceUpdate }) {
    const [dynamicPrice, setDynamicPrice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDetails, setShowDetails] = useState(false);

    const calculateDynamicPrice = async (date) => {
        try {
            setLoading(true);
            setError('');
            
            const response = await axios.get(`/ml/pricing/${place._id}/calculate?date=${date}`);
            setDynamicPrice(response.data);
            
            if (onPriceUpdate) {
                onPriceUpdate(response.data.dynamicPrice);
            }
        } catch (error) {
            console.error('Error calculating dynamic price:', error);
            setError('Failed to calculate dynamic price');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            calculateDynamicPrice(selectedDate);
        }
    };

    const getPriceChangePercentage = () => {
        if (!dynamicPrice) return 0;
        return Math.round(((dynamicPrice.dynamicPrice - dynamicPrice.basePrice) / dynamicPrice.basePrice) * 100);
    };

    const getPriceChangeColor = () => {
        const percentage = getPriceChangePercentage();
        if (percentage > 0) return 'text-green-600';
        if (percentage < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getPriceChangeIcon = () => {
        const percentage = getPriceChangePercentage();
        if (percentage > 0) return '↗';
        if (percentage < 0) return '↘';
        return '→';
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Dynamic Pricing</h3>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date for Price Calculation
                </label>
                <input
                    type="date"
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Calculating optimal price...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 p-3 rounded-md mb-4">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {dynamicPrice && (
                <div className="space-y-4">
                    {/* Price Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-600">Base Price</p>
                            <p className="text-lg font-semibold">₹{dynamicPrice.basePrice}</p>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-600">Dynamic Price</p>
                            <p className="text-lg font-semibold text-blue-900">
                                ₹{dynamicPrice.dynamicPrice}
                            </p>
                        </div>
                    </div>

                    {/* Price Change Indicator */}
                    <div className="text-center">
                        <p className={`text-sm font-medium ${getPriceChangeColor()}`}>
                            {getPriceChangeIcon()} {Math.abs(getPriceChangePercentage())}% 
                            {getPriceChangePercentage() > 0 ? ' increase' : getPriceChangePercentage() < 0 ? ' decrease' : ' no change'}
                        </p>
                    </div>

                    {/* Detailed Factors */}
                    {showDetails && (
                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Pricing Factors</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Demand Factor</span>
                                    <span className="text-sm font-medium">
                                        {dynamicPrice.factors.demandMultiplier > 1 ? '+' : ''}
                                        {Math.round((dynamicPrice.factors.demandMultiplier - 1) * 100)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Seasonality Factor</span>
                                    <span className="text-sm font-medium">
                                        {dynamicPrice.factors.seasonalityMultiplier > 1 ? '+' : ''}
                                        {Math.round((dynamicPrice.factors.seasonalityMultiplier - 1) * 100)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Competitor Factor</span>
                                    <span className="text-sm font-medium">
                                        {dynamicPrice.factors.competitorMultiplier > 1 ? '+' : ''}
                                        {Math.round((dynamicPrice.factors.competitorMultiplier - 1) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recommendation */}
                    <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                            <strong>Recommendation:</strong> The dynamic price of ₹{dynamicPrice.dynamicPrice} 
                            is optimized based on current market conditions, demand patterns, and competitor pricing.
                        </p>
                    </div>
                </div>
            )}

            {!dynamicPrice && !loading && (
                <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">Select a date to see dynamic pricing</p>
                </div>
            )}
        </div>
    );
}




