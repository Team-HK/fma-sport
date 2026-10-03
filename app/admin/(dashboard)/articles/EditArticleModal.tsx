"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ArticleForm, type ArticleWriterOption } from "./ArticleForm";
import type { Article } from "@prisma/client";

export function EditArticleModal({
  article,
  writers,
}: {
  article: Article;
  writers: ArticleWriterOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier l'article" maxWidth="max-w-2xl">
        <ArticleForm article={article} writers={writers} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
