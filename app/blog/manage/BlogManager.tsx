"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { BlogPostMeta } from "../../lib/blog";

const emptyForm = {
  slug: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  tags: "",
  content: "",
};

type BlogManagerProps = {
  initialPosts: BlogPostMeta[];
};

export default function BlogManager({ initialPosts }: BlogManagerProps) {
  const [adminKey, setAdminKey] = useState("");
  const [posts, setPosts] = useState<BlogPostMeta[]>(initialPosts);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPosts = async () => {
    const response = await fetch("/api/blog/posts", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("文章列表加载失败。");
    }
    const data = (await response.json()) as { posts: BlogPostMeta[] };
    setPosts(data.posts);
  };

  const savePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      }

      const response = await fetch("/api/blog/posts", {
        method: "POST",
        headers: {
          "X-Admin-API-Key": adminKey.trim(),
        },
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(data?.detail ?? `文章保存失败：${response.status}`);
      }

      setMessage("文章已保存。");
      setForm(emptyForm);
      setFile(null);
      await loadPosts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "文章保存失败。");
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (slug: string) => {
    const confirmed = window.confirm(`确认删除 ${slug}.md 吗？`);
    if (!confirmed) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/blog/posts/${slug}`, {
        method: "DELETE",
        headers: {
          "X-Admin-API-Key": adminKey.trim(),
        },
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(data?.detail ?? `文章删除失败：${response.status}`);
      }

      setMessage("文章已删除。");
      await loadPosts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "文章删除失败。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">
            Blog Admin
          </p>
          <h1 className="font-display mt-4 text-4xl font-black text-white sm:text-6xl">
            Markdown 文章管理
          </h1>
        </div>
        <Link
          href="/blog"
          className="border border-cyan-300/45 px-4 py-2 text-sm font-black text-cyan-100 transition hover:border-lime-300 hover:text-lime-200"
        >
          返回博客
        </Link>
      </div>

      <section className="mt-10 border border-cyan-300/20 bg-black/28 p-6">
        <label className="block text-xs font-black uppercase tracking-[0.22em] text-zinc-400">
          Admin API Key
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="BLOG_ADMIN_API_KEY"
            className="mt-3 w-full border border-cyan-300/30 bg-black/60 p-3 text-sm text-white outline-none focus:border-lime-300"
          />
        </label>
      </section>

      <form onSubmit={savePost} className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="border border-cyan-300/20 bg-black/28 p-6">
          <h2 className="text-xl font-black text-white">上传 Markdown 文件</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            文件必须是 `.md`，并包含 `title`、`date`、`description` frontmatter。
          </p>
          <input
            type="file"
            accept=".md"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="mt-5 w-full border border-cyan-300/30 bg-black/60 p-3 text-sm text-white"
          />

          <div className="my-8 h-px bg-cyan-300/20" />

          <h2 className="text-xl font-black text-white">手写新文章</h2>
          <div className="mt-5 grid gap-4">
            <input
              value={form.slug}
              onChange={(event) => setForm({ ...form, slug: event.target.value })}
              placeholder="slug，例如 rag-deploy-notes"
              className="border border-cyan-300/30 bg-black/60 p-3 text-sm text-white outline-none focus:border-lime-300"
            />
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="标题"
              className="border border-cyan-300/30 bg-black/60 p-3 text-sm text-white outline-none focus:border-lime-300"
            />
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              className="border border-cyan-300/30 bg-black/60 p-3 text-sm text-white outline-none focus:border-lime-300"
            />
            <input
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="摘要"
              className="border border-cyan-300/30 bg-black/60 p-3 text-sm text-white outline-none focus:border-lime-300"
            />
            <input
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
              placeholder="标签，用英文逗号分隔"
              className="border border-cyan-300/30 bg-black/60 p-3 text-sm text-white outline-none focus:border-lime-300"
            />
          </div>
        </section>

        <section className="border border-cyan-300/20 bg-black/28 p-6">
          <label className="text-xl font-black text-white">
            正文 Markdown
            <textarea
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              placeholder="从这里开始写正文。上传文件时此处会被忽略。"
              className="mt-5 min-h-96 w-full resize-y border border-cyan-300/30 bg-black/60 p-4 text-sm leading-7 text-white outline-none focus:border-lime-300"
            />
          </label>
          <button
            type="submit"
            disabled={loading || adminKey.trim().length === 0}
            className="mt-5 bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {loading ? "保存中..." : file ? "上传 Markdown" : "保存文章"}
          </button>
          {message ? <p className="mt-4 border border-lime-300/30 bg-lime-300/10 p-3 text-sm text-lime-100">{message}</p> : null}
          {error ? <p className="mt-4 border border-red-300/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</p> : null}
        </section>
      </form>

      <section className="mt-6 border border-cyan-300/20 bg-black/28 p-6">
        <h2 className="text-xl font-black text-white">已有文章</h2>
        <div className="mt-5 grid gap-3">
          {posts.map((post) => (
            <div key={post.slug} className="flex flex-wrap items-center justify-between gap-4 border border-cyan-300/15 bg-black/30 p-4">
              <div>
                <Link href={`/blog/${post.slug}`} className="font-black text-white transition hover:text-cyan-200">
                  {post.title}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">
                  {post.date} / {post.slug}.md
                </p>
              </div>
              <button
                type="button"
                disabled={loading || adminKey.trim().length === 0}
                onClick={() => deletePost(post.slug)}
                className="border border-red-300/40 px-4 py-2 text-sm font-black text-red-100 transition hover:border-red-200 disabled:cursor-not-allowed disabled:text-zinc-600"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
