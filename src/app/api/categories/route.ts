import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/categories
// Returns: { all: number, favorites: number, categories: [{name: string, count: number}] }
export async function GET() {
  try {
    // Total quotes count
    const total = await prisma.quote.count();

    // Favorites count
    const favorites = await prisma.quote.count({
      where: { isFavorite: true },
    });

    // Group by category and count
    const categoriesData = await prisma.quote.groupBy({
      by: ["category"],
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
    });

    // Format categories with counts
    const categories = categoriesData
      .filter((item) => item.category !== null) // null kategorileri filtrele
      .map((item) => ({
        name: item.category as string,
        count: item._count.category,
      }));

    return NextResponse.json({
      all: total,
      favorites,
      categories,
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 },
    );
  }
}
