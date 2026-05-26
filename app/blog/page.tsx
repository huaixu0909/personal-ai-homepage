import type { Metadata } from "next";
import Link from "next/link";
import ParticleField from "../components/ParticleField";
import { getAllPosts } from "../lib/blog";

export const metadata: Metadata = {
  title: "Blog | AI Lab",
  description: "AI Lab 的工程笔记、部署记录和 RAG / Agent 实践文章。",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 opacity-35 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 [background-image:linear-gradient(180deg,rgba(5,7,11,0.22),rgba(5,7,11,0.95))]" />

      <header className="sticky top-0 z-30 border-b border-cyan-300/20 bg-[#05070b]/86 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">
            AI Lab
          </Link>
          <div className="flex items-center gap-5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
            <Link className="transition hover:text-cyan-200" href="/">
              Home
            </Link>
            <Link className="transition hover:text-cyan-200" href="/products/rag-agent">
              RAG
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">
          Engineering Notes
        </p>
        <h1 className="font-display mt-4 text-4xl font-black text-white sm:text-6xl">
          博客与工程笔记
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400">
          记录 RAG、Agent、数据合成、部署和产品化过程中的关键实践。这里的文章会跟随项目一起演进，优先保留可复现的工程细节。
        </p>

        <div className="mt-12 grid gap-5">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border border-cyan-300/20 bg-black/28 p-6 transition hover:border-cyan-300/55 hover:bg-cyan-300/[0.05]"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                <time dateTime={post.date}>{post.date}</time>
                {post.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-cyan-300/30 px-2.5 py-1 text-cyan-100">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">
                <Link href={`/blog/${post.slug}`} className="transition hover:text-cyan-200">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-6 inline-flex border border-cyan-300/45 px-4 py-2 text-sm font-black text-cyan-100 transition hover:border-lime-300 hover:text-lime-200"
              >
                阅读全文
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
