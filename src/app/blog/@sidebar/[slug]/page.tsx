
export default async function PostSidebar({ params }: { params: { slug?: string } }) {
  const { slug } = await params;
  return <div>Sidebar for post {slug}</div>;
}
