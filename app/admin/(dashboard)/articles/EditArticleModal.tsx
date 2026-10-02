"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ArticleForm } from "./ArticleForm";
import type { Article } from "@prisma/client";

export function EditArticleModal({ article }: { article: Article }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier l'article" maxWidth="max-w-2xl">
        <ArticleForm article={article} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
