import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Admin Auth Helper ───────────────────────────────────────────
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === process.env.ADMIN_PASSWORD;
}

// GET /api/quotes/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const idStr = (await params).id;
  const id = parseInt(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching quote" },
      { status: 500 },
    );
  }
}

// Helper to extract ID from URL is not strictly needed in App Router Params but convenient to handle params argument
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 🔒 Admin kontrolü
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idStr = (await params).id;
  const id = parseInt(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    // Sadece izin verilen alanları güncelle (mass-assignment koruması)
    const { content, author, category, isFavorite } = body;
    const data: Record<string, unknown> = {};
    if (content !== undefined) data.content = content;
    if (author !== undefined) data.author = author;
    if (category !== undefined) data.category = category;
    if (isFavorite !== undefined) data.isFavorite = isFavorite;

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedQuote);
  } catch (error) {
    return NextResponse.json(
      { error: "Error updating quote" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 🔒 Admin kontrolü
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idStr = (await params).id;
  const id = parseInt(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.quote.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Quote deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting quote" },
      { status: 500 },
    );
  }
}
