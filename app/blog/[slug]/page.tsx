import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ParticleField from "../../components/ParticleField";
import { getPostBySlug } from "../../lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章不存在 | AI Lab",
    };
  }

  return {
    title: `${post.title} | AI Lab`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 opacity-35 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 [background-image:linear-gradient(180deg,rgba(5,7,11,0.22),rgba(5,7,11,0.95))]" />

      <header className="sticky top-0 z-30 border-b border-cyan-300/20 bg-[#05070b]/86 backdrop-blur">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/blog" className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">
            Blog
          </Link>
          <Link className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400 transition hover:text-cyan-200" href="/">
            Home
          </Link>
        </nav>
      </header>

      <article className="relative z-10 mx-auto max-w-4xl px-5 py-16">
        <Link
          href="/blog"
          className="inline-flex border border-cyan-300/35 px-4 py-2 text-sm font-black text-cyan-100 transition hover:border-lime-300 hover:text-lime-200"
        >
          返回文章列表
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
          <time dateTime={post.date}>{post.date}</time>
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-cyan-300/30 px-2.5 py-1 text-cyan-100">
              {tag}
            </span>
          ))}
        </div>

        <h1 className="font-display mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">
          {post.title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400">{post.description}</p>

        <div
          className="mt-10 border border-cyan-300/20 bg-black/30 p-6 text-zinc-300 sm:p-8 [&_a]:text-cyan-200 [&_a]:underline [&_blockquote]:border-l [&_blockquote]:border-cyan-300/40 [&_blockquote]:pl-5 [&_code]:rounded-md [&_code]:bg-cyan-300/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-cyan-100 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-white [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-cyan-300/20 [&_pre]:bg-black/60 [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
