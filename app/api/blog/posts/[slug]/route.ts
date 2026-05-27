import { NextRequest, NextResponse } from "next/server";
import { deleteBlogPost } from "../../../../lib/blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>;
};

function getExpectedAdminKey() {
  return (process.env.BLOG_ADMIN_API_KEY || process.env.ADMIN_API_KEY || "").trim();
}

function assertAdmin(request: NextRequest) {
  const expectedKey = getExpectedAdminKey();
  if (!expectedKey) {
    return NextResponse.json(
      { detail: "BLOG_ADMIN_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const providedKey = request.headers.get("X-Admin-API-Key")?.trim() ?? "";
  if (providedKey !== expectedKey) {
    return NextResponse.json({ detail: "Invalid admin API key." }, { status: 403 });
  }

  return null;
}

export async function DELETE(request: NextRequest, { params }: BlogPostRouteProps) {
  const adminError = assertAdmin(request);
  if (adminError) return adminError;

  try {
    const { slug } = await params;
    const deleted = deleteBlogPost(slug);
    return NextResponse.json({ deleted });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "文章删除失败。" },
      { status: 400 },
    );
  }
}
