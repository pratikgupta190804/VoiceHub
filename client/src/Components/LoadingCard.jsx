import React from "react";

const LoadingCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
        </div>
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
      </div>

      {/* Media Section */}
      <div className="mx-4 mb-4">
        <div className="aspect-video bg-gray-200 rounded-xl"></div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

        {/* Description */}
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>

        {/* Location */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCard;
