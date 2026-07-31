import { db, collection, addDoc, serverTimestamp } from '../firebase';

export const SAMPLE_ISSUES = [
  {
    title: "Hazardous Pothole on Metro Pillar 1042",
    description: "Deep pothole created after heavy rainfall causing traffic congestion and accidents near Uppal station.",
    category: "Potholes & Roads",
    departmentId: "municipal",
    status: "open",
    likesCount: 14,
    commentsCount: 3,
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
    location: {
      address: "Uppal Metro Station, Pillar 1042, Hyderabad",
      lat: 17.3984,
      lng: 78.5583
    }
  },
  {
    title: "Major Drinking Water Line Burst",
    description: "High pressure clean water leaking onto main road for over 6 hours near Hitec City phase 2.",
    category: "Water Supply",
    departmentId: "water",
    status: "in-progress",
    likesCount: 29,
    commentsCount: 7,
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800",
    location: {
      address: "Hitec City Cyber Towers Road, Hyderabad",
      lat: 17.4504,
      lng: 78.3808
    }
  },
  {
    title: "Transformer Electrical Sparking & Outage",
    description: "Local distribution transformer sparking severely during night hours near Madhapur junction.",
    category: "Electricity",
    departmentId: "electricity",
    status: "resolved",
    likesCount: 42,
    commentsCount: 12,
    photoUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800",
    location: {
      address: "Madhapur Main Road, Hyderabad",
      lat: 17.4483,
      lng: 78.3915
    }
  },
  {
    title: "Uncollected Municipal Solid Waste",
    description: "Garbage overflow blocking pedestrian walkway near Kukatpally housing board colony market.",
    category: "Garbage",
    departmentId: "municipal",
    status: "open",
    likesCount: 8,
    commentsCount: 2,
    photoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800",
    location: {
      address: "Kukatpally KPHB Colony, Hyderabad",
      lat: 17.4849,
      lng: 78.4012
    }
  }
];

export async function seedDemoData(userUid: string, userName: string) {
  try {
    for (const issue of SAMPLE_ISSUES) {
      await addDoc(collection(db, 'issues'), {
        ...issue,
        reporterUid: userUid,
        reporterName: userName || 'Civic Citizen',
        reporterPhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=10b981&color=fff`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    return true;
  } catch (error) {
    console.error("Error seeding demo data:", error);
    throw error;
  }
}
