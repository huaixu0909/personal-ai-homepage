import type { Metadata } from "next";
import ParticleField from "../../components/ParticleField";
import { getAllPosts } from "../../lib/blog";
import BlogManager from "./BlogManager";

export const metadata: Metadata = {
  title: "Blog Admin | AI Lab",
  description: "管理 AI Lab Markdown 博客文章。",
};

export const dynamic = "force-dynamic";

export default function BlogManagePage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 opacity-35 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 [background-image:linear-gradient(180deg,rgba(5,7,11,0.22),rgba(5,7,11,0.95))]" />
      <BlogManager initialPosts={posts} />
    </main>
  );
}
