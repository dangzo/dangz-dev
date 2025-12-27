import Heading from "@/components/Heading";

export default async function PostPage() {
  return (
    <main className="container mx-auto max-w-3xl p-8">
      <Heading as="h1" className="text-4xl font-bold mb-8">Single Post Page</Heading>
      <p>Text here</p>
    </main>
  );
}
