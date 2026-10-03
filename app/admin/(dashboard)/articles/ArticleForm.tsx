"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ImageField } from "@/components/ui/ImageField";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { upsertArticle, type ArticleActionState } from "@/app/actions/admin/articles";
import type { Article } from "@prisma/client";

const initialState: ArticleActionState = { success: false, message: "" };

export type ArticleWriterOption = { id: string; name: string; role: string };

export function ArticleForm({
  article,
  writers = [],
  onSuccess,
}: {
  article?: Article;
  writers?: ArticleWriterOption[];
  onSuccess?: () => void;
}) {
  const action = upsertArticle.bind(null, article?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const didRun = useRef(false);

  useEffect(() => {
    if (state.success && didRun.current) {
      onSuccess?.();
    }
    didRun.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p
          role="alert"
          className={state.success ? "text-sm text-success" : "text-sm text-destructive"}
        >
          {state.message}
        </p>
      )}

      <Tabs
        tabs={[
          {
            id: "contenu",
            label: "Contenu",
            content: (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input id="title" name="title" defaultValue={article?.title} required />
                </div>
                <div>
                  <Label htmlFor="writerId">Rédacteur</Label>
                  <select
                    id="writerId"
                    name="writerId"
                    defaultValue={article?.writerId ?? ""}
                    className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
                  >
                    <option value="">La Rédaction FMA SPORT</option>
                    {writers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.role}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Les rédacteurs se gèrent dans la section Équipe.
                  </p>
                </div>
                <div>
                  <Label htmlFor="excerpt">Résumé *</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    rows={2}
                    defaultValue={article?.excerpt}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">Contenu (HTML autorisé) *</Label>
                  <Textarea
                    id="content"
                    name="content"
                    rows={10}
                    defaultValue={article?.content}
                    required
                  />
                </div>
                <ImageField
                  id="coverImage"
                  name="coverImage"
                  label="Image de couverture"
                  defaultValue={article?.coverImage}
                />
              </div>
            ),
          },
          {
            id: "publication",
            label: "Publication & SEO",
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <select
                      id="category"
                      name="category"
                      defaultValue={article?.category ?? ""}
                      required
                      className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
                    >
                      <option value="">Sélectionner...</option>
                      {Object.entries(ARTICLE_CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Statut *</Label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={article?.status ?? "DRAFT"}
                      required
                      className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
                    >
                      <option value="DRAFT">Brouillon</option>
                      <option value="SCHEDULED">Programmé</option>
                      <option value="PUBLISHED">Publié</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Pays (facultatif)</Label>
                    <Input id="country" name="country" defaultValue={article?.country ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor="competition">Compétition (facultatif)</Label>
                    <Input
                      id="competition"
                      name="competition"
                      defaultValue={article?.competition ?? ""}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                  <Input id="tags" name="tags" defaultValue={article?.tags.join(", ") ?? ""} />
                </div>
                <div>
                  <Label htmlFor="publishedAt">Date de publication / programmation</Label>
                  <Input
                    id="publishedAt"
                    name="publishedAt"
                    type="datetime-local"
                    defaultValue={
                      article?.publishedAt
                        ? new Date(article.publishedAt).toISOString().slice(0, 16)
                        : ""
                    }
                  />
                </div>
              </div>
            ),
          },
        ]}
      />

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
