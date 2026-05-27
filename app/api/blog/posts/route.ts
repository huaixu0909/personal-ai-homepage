import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import {
  getAllPosts,
  isValidBlogSlug,
  slugifyBlogTitle,
  writeBlogPostMarkdown,
} from "../../../lib/blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function normalizeTags(value: FormDataEntryValue | null) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function buildMarkdownFromFields(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const tags = normalizeTags(formData.get("tags"));
  const explicitSlug = String(formData.get("slug") ?? "").trim();
  const slug = explicitSlug || slugifyBlogTitle(title) || `post-${Date.now()}`;

  if (!title || !date || !description || !content) {
    throw new Error("标题、日期、摘要和正文都不能为空。");
  }

  if (!isValidBlogSlug(slug)) {
    throw new Error("Slug 只能包含小写字母、数字和连字符，例如 rag-deploy-notes。");
  }

  const markdown = matter.stringify(content, {
    title,
    date,
    description,
    tags,
  });

  return { slug, markdown };
}

async function readUploadedMarkdown(file: File) {
  if (!file.name.endsWith(".md")) {
    throw new Error("只能上传 .md 文件。");
  }

  const markdown = await file.text();
  const parsed = matter(markdown);
  if (!parsed.data.title || !parsed.data.date || !parsed.data.description) {
    throw new Error("Markdown 文件必须包含 title、date、description frontmatter。");
  }

  const frontmatterSlug = String(parsed.data.slug ?? "").trim();
  const slug = frontmatterSlug || slugifyBlogTitle(file.name.replace(/\.md$/, "")) || `post-${Date.now()}`;

  if (!isValidBlogSlug(slug)) {
    throw new Error("Markdown frontmatter 中的 slug 不合法。");
  }

  return { slug, markdown };
}

export function GET() {
  return NextResponse.json({ posts: getAllPosts() });
}

export async function POST(request: NextRequest) {
  const adminError = assertAdmin(request);
  if (adminError) return adminError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const payload = file instanceof File && file.size > 0
      ? await readUploadedMarkdown(file)
      : buildMarkdownFromFields(formData);

    writeBlogPostMarkdown(payload.slug, payload.markdown);

    return NextResponse.json({
      post: getAllPosts().find((post) => post.slug === payload.slug),
    });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "文章保存失败。" },
      { status: 400 },
    );
  }
}
