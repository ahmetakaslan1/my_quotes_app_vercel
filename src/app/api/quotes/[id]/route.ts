import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const idStr = (await params).id;
  const id = parseInt(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    // Supporting both full update and "toggle favorite" partial update
    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: body,
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
