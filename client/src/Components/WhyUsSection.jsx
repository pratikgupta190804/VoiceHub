import React from "react";

const WhyUsSection = () => {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-12 bg-gradient-to-r from-white via-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xl font-medium text-gray-500 mb-4 tracking-wide uppercase">
            Why Us
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter text-[#191c1e] leading-tight max-w-4xl mx-auto">
            Committed to Building a{" "}
            <span className="text-orange-500">Safer</span> ,{" "}
            <span className="text-orange-500">Transparent</span> and{" "}
            <span className="text-orange-500">Responsible</span> Society{" "}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Feature 1 */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <span className="text-4xl sm:text-5xl font-light text-gray-400">01</span>
              <div className="flex-1 pt-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-4">
                  Anonymous Verified Complaints
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  Submit complaints anonymously for privacy, with verification to ensure authenticity.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <img
                src="https://i.ibb.co/zhcskHx0/unnamed-1.png"
                alt="Family discussing home plans with real estate agent"
                className="w-full h-65 sm:h-72 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <span className="text-4xl sm:text-5xl font-light text-gray-400">02</span>
              <div className="flex-1 pt-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-4">
                  Map Insights
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <img
                src="https://i.ibb.co/LXb9tkXt/unnamed-2.png"
                alt="Real estate professionals working with documents and house models"
                className="w-full h-64 sm:h-72 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Visualize complaints nearby, sorted by proximity or type, for quick identification of local problems.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <span className="text-4xl sm:text-5xl font-light text-gray-400">03</span>
              <div className="flex-1 pt-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-4">
                  Interactive Engagement
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  Upvote, downvote, share, and comment — creating a community-driven platform.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <img
                src="https://i.ibb.co/nNXmB0Q5/unnamed.png"
                alt="Happy family signing documents with real estate agent"
                className="w-full h-64 sm:h-72 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUsSection;