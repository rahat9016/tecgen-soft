import { NextRequest, NextResponse } from "next/server";

export enum HeroType {
  HOME = "home",
  ABOUT = "about",
  CONTACT = "contact",
}

// Multiple hero data
const heroes = [
  {
    type: HeroType.HOME,
    title: "Your Health, Our Priority",
    description:
      "Providing trusted healthcare services with advanced technology, experienced doctors, and compassionate care for you and your family",
    images: [
      "/heroImages/home/heroImage1.png",
      "/heroImages/home/heroImage2.jpg",
      "/heroImages/home/heroImage2.jpg",
    ],
  },
  {
    type: HeroType.ABOUT,
    title: "Our Priority Your Health",
    description:
      "Compassionate care and advanced medical services at your fingertips.",
    images: [
      "/heroImages/home/heroImage1.png",
      "/heroImages/home/heroImage2.jpg",
    ],
  },
  {
    type: HeroType.CONTACT,
    title: "Compassionate care and advanced medical",
    description: "Reach out to our team anytime, we are here to help.",
    images: [
      "/heroImages/home/heroImage3.jpg",
      "/heroImages/home/heroImage2.jpg",
    ],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as HeroType | null;

  // Filter heroes if type query provided
  const filteredHeroes = type ? heroes.filter((h) => h.type === type) : heroes;

  return NextResponse.json({
    statusCode: 200,
    success: true,
    message: "Hero(s) retrieved successfully",
    data: filteredHeroes,
    meta: {
      totalItems: filteredHeroes.length,
      itemCount: filteredHeroes.length,
      itemsPerPage: filteredHeroes.length,
      currentPage: 1,
      totalPages: 1,
    },
  });
}
