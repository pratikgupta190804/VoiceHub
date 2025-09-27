const mongoose = require("mongoose");
const Complaint = require("../models/complaint");
require("dotenv").config();

// Sample complaints data compatible with MapView
const sampleComplaints = [
  {
    title: "Large pothole causing traffic issues",
    description:
      "A massive pothole has formed on the main road near the bus stop, causing vehicles to swerve dangerously. The hole is approximately 2 feet deep and poses a serious risk to both cars and motorcycles.",
    category: "Infrastructure",
    upvote: 28,
    downvote: 5,
    media: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.8777, 19.076], // [longitude, latitude]
      namedAddress: "Main Road, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.076,
      longitude: 72.8777,
    },
    authorities: [
      { name: "Mumbai Municipal Corporation", handle: "@mybmc" },
      { name: "Traffic Police Mumbai", handle: "@MumbaiPolice" },
    ],
    createdAt: new Date("2024-03-10T08:30:00Z"),
    updatedAt: new Date("2024-03-10T08:30:00Z"),
  },
  {
    title: "Broken street light creating safety hazard",
    description:
      "The street light on Park Avenue has been non-functional for over two weeks, creating a dangerous situation for pedestrians and drivers during nighttime hours.",
    category: "Safety",
    upvote: 22,
    downvote: 2,
    media: [
      {
        url: "https://images.unsplash.com/photo-1518709268805-4e9042af2904?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.885, 19.08],
      namedAddress:
        "Park Avenue, Linking Road, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.08,
      longitude: 72.885,
    },
    authorities: [
      { name: "MSEB", handle: "@MaharashtraSEB" },
      { name: "Ward Office", handle: "@WardOfficeMumbai" },
    ],
    createdAt: new Date("2024-03-11T14:20:00Z"),
    updatedAt: new Date("2024-03-11T14:20:00Z"),
  },
  {
    title: "Illegal garbage dumping in residential area",
    description:
      "Large amounts of construction debris and household waste have been illegally dumped in the vacant lot behind the residential complex, attracting pests and creating health concerns.",
    category: "Sanitation",
    upvote: 35,
    downvote: 8,
    media: [
      {
        url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.87, 19.07],
      namedAddress: "Hill Road, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.07,
      longitude: 72.87,
    },
    authorities: [
      { name: "Solid Waste Management", handle: "@SWMMumbai" },
      { name: "Health Department", handle: "@HealthDeptMH" },
    ],
    createdAt: new Date("2024-03-12T11:45:00Z"),
    updatedAt: new Date("2024-03-12T11:45:00Z"),
  },
  {
    title: "Water leakage from municipal pipeline",
    description:
      "A major water leak from the underground municipal pipeline is causing flooding on the sidewalk and wasting thousands of gallons of clean water daily.",
    category: "Water Supply",
    upvote: 42,
    downvote: 3,
    media: [
      {
        url: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.875, 19.085],
      namedAddress:
        "Turner Road, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.085,
      longitude: 72.875,
    },
    authorities: [
      { name: "Water Department", handle: "@WaterDeptMumbai" },
      { name: "BMC", handle: "@mybmc" },
    ],
    createdAt: new Date("2024-03-13T09:15:00Z"),
    updatedAt: new Date("2024-03-13T09:15:00Z"),
  },
  {
    title: "Damaged traffic signal causing confusion",
    description:
      "The traffic signal at the main intersection is malfunctioning, with lights showing conflicting signals. This has resulted in near-miss accidents and traffic congestion.",
    category: "Traffic",
    upvote: 31,
    downvote: 6,
    media: [
      {
        url: "https://images.unsplash.com/photo-1530569673472-307dc017a82d?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.89, 19.065],
      namedAddress:
        "S.V. Road Junction, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.065,
      longitude: 72.89,
    },
    authorities: [
      { name: "Traffic Police", handle: "@MumbaiTrafficPolice" },
      { name: "Municipal Corporation", handle: "@mybmc" },
    ],
    createdAt: new Date("2024-03-14T16:30:00Z"),
    updatedAt: new Date("2024-03-14T16:30:00Z"),
  },
  {
    title: "Overgrown vegetation blocking sidewalk",
    description:
      "Trees and bushes along the pedestrian walkway have grown out of control, forcing people to walk on the busy road instead of using the sidewalk safely.",
    category: "Public Spaces",
    upvote: 18,
    downvote: 4,
    media: [
      {
        url: "https://images.unsplash.com/photo-1574263867128-0945d9eb8dbc?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.865, 19.09],
      namedAddress:
        "Carter Road, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.09,
      longitude: 72.865,
    },
    authorities: [
      { name: "Parks Department", handle: "@ParksDepMumbai" },
      { name: "Ward Office", handle: "@WardOfficeBandra" },
    ],
    createdAt: new Date("2024-03-15T12:00:00Z"),
    updatedAt: new Date("2024-03-15T12:00:00Z"),
  },
  {
    title: "Broken manhole cover poses danger",
    description:
      "A manhole cover on the residential street has completely broken and fallen into the drain, creating a dangerous hole that could cause serious accidents, especially at night.",
    category: "Safety",
    upvote: 45,
    downvote: 2,
    media: [
      {
        url: "https://images.unsplash.com/photo-1604580864967-7c5b2d946a92?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1607706189992-eae578626c86?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.88, 19.072],
      namedAddress:
        "Pali Hill Road, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.072,
      longitude: 72.88,
    },
    authorities: [
      { name: "Municipal Corporation", handle: "@mybmc" },
      { name: "Emergency Services", handle: "@MumbaiEmergency" },
    ],
    createdAt: new Date("2024-03-16T07:45:00Z"),
    updatedAt: new Date("2024-03-16T07:45:00Z"),
  },
  {
    title: "Public park playground equipment damaged",
    description:
      "Several pieces of playground equipment in the community park are broken and potentially dangerous for children, including swings with broken chains and slides with sharp edges.",
    category: "Public Facilities",
    upvote: 26,
    downvote: 7,
    media: [
      {
        url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1585239834423-4f11c16a029c?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.872, 19.082],
      namedAddress:
        "Joggers Park, Carter Road, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.082,
      longitude: 72.872,
    },
    authorities: [
      { name: "Parks Department", handle: "@ParksDepMumbai" },
      { name: "Child Safety Board", handle: "@ChildSafetyMH" },
    ],
    createdAt: new Date("2024-03-17T10:20:00Z"),
    updatedAt: new Date("2024-03-17T10:20:00Z"),
  },
  {
    title: "Stray dogs creating safety concerns",
    description:
      "A pack of stray dogs has taken residence near the school entrance, causing fear among children and parents. Several incidents of aggressive behavior have been reported.",
    category: "Animal Control",
    upvote: 33,
    downvote: 12,
    media: [
      {
        url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.888, 19.078],
      namedAddress:
        "St. Andrews High School, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.078,
      longitude: 72.888,
    },
    authorities: [
      { name: "Animal Control", handle: "@AnimalControlMumbai" },
      { name: "Education Department", handle: "@EducationMH" },
    ],
    createdAt: new Date("2024-03-18T13:10:00Z"),
    updatedAt: new Date("2024-03-18T13:10:00Z"),
  },
  {
    title: "Bus stop shelter completely destroyed",
    description:
      "The public bus shelter on Main Road has been vandalized and is now completely unusable, leaving commuters without protection from weather conditions during their wait.",
    category: "Public Transport",
    upvote: 19,
    downvote: 5,
    media: [
      {
        url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400&h=300&fit=crop",
        type: "image",
      },
      {
        url: "https://images.unsplash.com/photo-1558882224-dda166733046?w=400&h=300&fit=crop",
        type: "image",
      },
    ],
    location: {
      type: "Point",
      coordinates: [72.883, 19.068],
      namedAddress:
        "Bus Stop, Linking Road, Bandra West, Mumbai, Maharashtra 400050, India",
      latitude: 19.068,
      longitude: 72.883,
    },
    authorities: [
      { name: "BEST Bus Service", handle: "@BESTUndertaking" },
      { name: "Transport Department", handle: "@TransportMH" },
    ],
    createdAt: new Date("2024-03-19T15:55:00Z"),
    updatedAt: new Date("2024-03-19T15:55:00Z"),
  },
];

async function seedComplaints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/auto-complain",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Clear existing complaints (optional)
    await Complaint.deleteMany({});
    console.log("Cleared existing complaints");

    // Insert sample complaints
    const insertedComplaints = await Complaint.insertMany(sampleComplaints);
    console.log(
      `Successfully inserted ${insertedComplaints.length} sample complaints`
    );

    // Display some info about inserted data
    console.log("\nSample of inserted data:");
    insertedComplaints.slice(0, 3).forEach((complaint, index) => {
      console.log(`${index + 1}. ${complaint.title}`);
      console.log(`   Location: ${complaint.location.namedAddress}`);
      console.log(
        `   Coordinates: [${complaint.location.longitude}, ${complaint.location.latitude}]`
      );
      console.log(`   Category: ${complaint.category}`);
      console.log(
        `   Upvotes: ${complaint.upvote}, Downvotes: ${complaint.downvote}`
      );
      console.log("");
    });

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seeding script
if (require.main === module) {
  seedComplaints();
}

module.exports = { seedComplaints, sampleComplaints };
