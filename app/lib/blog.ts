import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "content", "blog");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
};

export type BlogPost = BlogPostMeta & {
  contentHtml: string;
};

function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
  return fs.readdirSync(postsDirectory);
}

function getPostSlugs() {
  return ensurePostsDirectory()
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}

function readPostFile(slug: string) {
  if (!isValidBlogSlug(slug)) {
    return null;
  }

  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, "utf8");
}

function normalizeTags(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

function toPostMeta(slug: string, data: matter.GrayMatterFile<string>["data"]): BlogPostMeta {
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    description: String(data.description ?? ""),
    tags: normalizeTags(data.tags),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const fileContents = readPostFile(slug);
      if (!fileContents) return null;
      const parsed = matter(fileContents);
      return toPostMeta(slug, parsed.data);
    })
    .filter((post): post is BlogPostMeta => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fileContents = readPostFile(slug);
  if (!fileContents) {
    return null;
  }

  const parsed = matter(fileContents);
  const processedContent = await remark().use(html).process(parsed.content);

  return {
    ...toPostMeta(slug, parsed.data),
    contentHtml: processedContent.toString(),
  };
}

export function getAllPostSlugs() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export function isValidBlogSlug(slug: string) {
  return slugPattern.test(slug);
}

export function slugifyBlogTitle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function writeBlogPostMarkdown(slug: string, markdown: string) {
  if (!isValidBlogSlug(slug)) {
    throw new Error("文章 slug 只能包含小写字母、数字和连字符。");
  }

  fs.mkdirSync(postsDirectory, { recursive: true });
  fs.writeFileSync(path.join(postsDirectory, `${slug}.md`), markdown, "utf8");
}

export function deleteBlogPost(slug: string) {
  if (!isValidBlogSlug(slug)) {
    throw new Error("文章 slug 不合法。");
  }

  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  fs.unlinkSync(fullPath);
  return true;
}
