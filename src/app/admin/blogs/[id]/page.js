import BlogForm from "@/components/admin/BlogForm";

export default async function EditBlogPage({ params }) {
   const { id } = await params;
   return <BlogForm blogId={id} />;
}
