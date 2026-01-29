import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/quotes
// Query Params: search (string), sort ('newest' | 'oldest' | 'alphabetical')
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";

  let orderBy = {};
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "alphabetical") orderBy = { content: "asc" };
  else orderBy = { createdAt: "desc" }; // default: newest

  try {
    const quotes = await prisma.quote.findMany({
      where: {
        OR: [
          { content: { contains: search } },
          { author: { contains: search } },
        ],
      },
      orderBy,
    });
    return NextResponse.json(quotes);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching quotes" },
      { status: 500 },
    );
  }
}

// POST /api/quotes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, author, category } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const newQuote = await prisma.quote.create({
      data: {
        content,
        author: author || "Anonymous",
        category: category || "General",
      },
    });

    return NextResponse.json(newQuote, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating quote" },
      { status: 500 },
    );
  }
}

// DELETE /api/quotes
// Body: { ids: number[] }
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "IDs array is required" },
        { status: 400 },
      );
    }

    await prisma.quote.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ message: "Quotes deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting quotes" },
      { status: 500 },
    );
  }
}
