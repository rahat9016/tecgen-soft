import { NextResponse } from "next/server";

const videos = [
  {
    src: "/healthVideo.mp4",
    type: "video/mp4",
    title: "Healthy Lifestyle Tips",
    description: "Simple daily habits to maintain a healthy lifestyle.",
  },
  {
    src: "/healthVideo.mp4",
    type: "video/mp4",
    title: "Mental Health Awareness",
    description: "Understanding mental health and how to take care of it.",
  },
  {
    src: "/healthVideo.mp4",
    type: "video/webm",
    title: "Fitness & Wellness",
    description: "A quick guide to staying fit and active.",
  },
];

export async function GET() {
  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Videos retrieved successfully",
    data: videos,
  });
}
