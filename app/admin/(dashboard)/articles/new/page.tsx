import { ArticleForm } from "../ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvel article</h1>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}
