import { notFound } from "next/navigation";
import { MockPreview } from "./MockPreview";

// Local-only preview of the new front-end (poll + article editor) with fake data.
// It never exists in production: the route answers 404 there.
export const dynamic = "force-dynamic";

export default function MockPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <MockPreview />;
}
