import React from "react";

const TypographyShowcase = () => {
  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: "#F5EFE6" }}>
      <div className="max-w-4xl mx-auto">
        {/* Headings - Playfair Display */}
        <section className="mb-8">
          <div className="mb-6">
            <p className="label mb-2" style={{ color: "#6D94C5" }}>
              Headings - Playfair Display (Elegant Serif)
            </p>
            <h1 className="heading" style={{ color: "#6D94C5" }}>
              Main Heading - Civic Complaints
            </h1>
            <h2 className="heading" style={{ color: "#6D94C5" }}>
              Section Heading - Your Voice Matters
            </h2>
            <h3 className="heading" style={{ color: "#6D94C5" }}>
              Subsection - Community Impact
            </h3>
            <h4 className="heading" style={{ color: "#6D94C5" }}>
              Card Title - Infrastructure Issues
            </h4>
          </div>
        </section>

        {/* Body Text - Source Sans Pro */}
        <section className="mb-8">
          <p className="label mb-2" style={{ color: "#6D94C5" }}>
            Body Text - Source Sans Pro (Readable Content)
          </p>
          <div
            className="body-text space-y-4"
            style={{ color: "rgba(109, 148, 197, 0.8)" }}
          >
            <p>
              This is the primary body text used for complaint descriptions,
              articles, and general content. Source Sans Pro provides excellent
              readability for longer paragraphs while maintaining a professional
              and approachable appearance.
            </p>
            <p className="complaint-description">
              Sample complaint description: "The streetlight on Main Street has
              been out for over a week, creating unsafe conditions for
              pedestrians during evening hours. Multiple residents have reported
              near-miss incidents due to poor visibility."
            </p>
          </div>
        </section>

        {/* UI Elements - Poppins */}
        <section className="mb-8">
          <p className="label mb-4" style={{ color: "#6D94C5" }}>
            UI Elements - Poppins (Modern Interface)
          </p>
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                className="btn px-6 py-3 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: "#6D94C5", color: "white" }}
              >
                Submit Complaint
              </button>
              <button
                className="btn px-6 py-3 rounded-lg border-2 transition-all hover:opacity-80"
                style={{
                  backgroundColor: "#E8DFCA",
                  borderColor: "#CBDCEB",
                  color: "#6D94C5",
                }}
              >
                Filter Results
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <span className="nav-link" style={{ color: "#6D94C5" }}>
                Navigation
              </span>
              <span className="nav-link" style={{ color: "#6D94C5" }}>
                Menu Items
              </span>
              <span className="nav-link" style={{ color: "#6D94C5" }}>
                Tabs
              </span>
            </div>
          </div>
        </section>

        {/* Labels & Tags - Poppins Uppercase */}
        <section className="mb-8">
          <p className="label mb-4" style={{ color: "#6D94C5" }}>
            Labels & Tags - Poppins (Small UI Text)
          </p>
          <div className="flex gap-3 flex-wrap">
            <span
              className="label px-3 py-1 rounded-full"
              style={{ backgroundColor: "#CBDCEB", color: "#6D94C5" }}
            >
              Infrastructure
            </span>
            <span
              className="label px-3 py-1 rounded-full"
              style={{ backgroundColor: "#E8DFCA", color: "#6D94C5" }}
            >
              Safety
            </span>
            <span
              className="label px-3 py-1 rounded-full"
              style={{ backgroundColor: "#CBDCEB", color: "#6D94C5" }}
            >
              Environment
            </span>
            <span
              className="label px-3 py-1 rounded-full"
              style={{ backgroundColor: "#E8DFCA", color: "#6D94C5" }}
            >
              Pending
            </span>
          </div>
        </section>

        {/* Brand/Logo - Playfair Display Bold */}
        <section className="mb-8">
          <p className="label mb-4" style={{ color: "#6D94C5" }}>
            Brand/Logo - Playfair Display Bold
          </p>
          <div className="space-y-2">
            <h1 className="logo text-4xl" style={{ color: "#6D94C5" }}>
              VoiceHub
            </h1>
            <h2 className="brand text-2xl" style={{ color: "#6D94C5" }}>
              Silent Shout
            </h2>
            <p className="site-title text-xl" style={{ color: "#6D94C5" }}>
              Civic Complaint Platform
            </p>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-8">
          <p className="label mb-4" style={{ color: "#6D94C5" }}>
            Form Elements
          </p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="label block mb-2" style={{ color: "#6D94C5" }}>
                Search Complaints
              </label>
              <input
                type="text"
                placeholder="Enter keywords..."
                className="input w-full px-4 py-3 rounded-lg border-2"
                style={{
                  backgroundColor: "#F5EFE6",
                  borderColor: "#CBDCEB",
                  color: "#6D94C5",
                }}
              />
            </div>
            <div>
              <label className="label block mb-2" style={{ color: "#6D94C5" }}>
                Complaint Description
              </label>
              <textarea
                rows="4"
                placeholder="Describe the issue..."
                className="input w-full px-4 py-3 rounded-lg border-2"
                style={{
                  backgroundColor: "#F5EFE6",
                  borderColor: "#CBDCEB",
                  color: "#6D94C5",
                }}
              />
            </div>
          </div>
        </section>

        {/* Typography Hierarchy Demo */}
        <section>
          <p className="label mb-4" style={{ color: "#6D94C5" }}>
            Complete Typography Hierarchy
          </p>
          <div
            className="p-6 rounded-xl border-2"
            style={{ backgroundColor: "white", borderColor: "#CBDCEB" }}
          >
            <h1 className="complaint-title mb-3" style={{ color: "#6D94C5" }}>
              Broken Street Light on Maple Avenue
            </h1>

            <div className="flex gap-2 mb-4">
              <span
                className="label"
                style={{ backgroundColor: "#E8DFCA", color: "#6D94C5" }}
              >
                Safety
              </span>
              <span
                className="caption"
                style={{ color: "rgba(109, 148, 197, 0.6)" }}
              >
                2 hours ago
              </span>
            </div>

            <p
              className="complaint-description mb-4"
              style={{ color: "rgba(109, 148, 197, 0.8)" }}
            >
              The streetlight at the intersection of Maple Avenue and Oak Street
              has been malfunctioning for the past three days. This creates a
              dangerous situation for both pedestrians and drivers, especially
              during evening hours when visibility is already reduced.
            </p>

            <div className="flex gap-4">
              <button
                className="btn px-4 py-2 rounded-lg"
                style={{ backgroundColor: "#6D94C5", color: "white" }}
              >
                Upvote
              </button>
              <button className="nav-link" style={{ color: "#6D94C5" }}>
                Comment
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TypographyShowcase;
