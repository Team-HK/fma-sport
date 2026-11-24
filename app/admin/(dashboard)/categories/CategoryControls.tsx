"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { confirmAndRun } from "@/lib/admin-dialog";
import { runAdminAction } from "@/lib/run-admin-action";
import {
  createCategory,
  deleteCategory,
  moveCategory,
  toggleCategoryActive,
  updateCategory,
  type CategoryActionState,
} from "@/app/actions/admin/categories";

const initialState: CategoryActionState = { success: false, message: "" };

function CategoryForm({
  slug,
  label,
  onDone,
}: {
  slug?: string;
  label?: string;
  onDone: () => void;
}) {
  const action = slug ? updateCategory.bind(null, slug) : createCategory;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const handled = useRef(false);

  useEffect(() => {
    if (state.success && !handled.current) {
      handled.current = true;
      onDone();
    }
  }, [state, onDone]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.success && (
        <p role="alert" className="rounded-lg bg-destructive-soft px-3 py-2.5 text-sm text-destructive-soft-foreground">
          {state.message}
        </p>
      )}
      <div>
        <Label htmlFor="category-label">Nom de la catégorie *</Label>
        <Input id="category-label" name="label" defaultValue={label} maxLength={40} required autoFocus placeholder="Ex. : Coupe du monde" />
        {slug ? (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Code interne : <span className="font-mono">{slug}</span>. Il ne change jamais, pour que les liens existants continuent de fonctionner.
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-muted-foreground">Elle apparaîtra à la fin de la liste : vous pourrez la déplacer ensuite.</p>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="soft" onClick={onDone}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

export function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Nouvelle catégorie
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle catégorie" maxWidth="max-w-md">
        <CategoryForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function CategoryRowControls({
  slug,
  label,
  active,
  locked,
  articleCount,
  isFirst,
  isLast,
}: {
  slug: string;
  label: string;
  active: boolean;
  locked: boolean;
  articleCount: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const iconButton =
    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        aria-label={`Monter ${label}`}
        disabled={isFirst || isPending}
        onClick={() => startTransition(() => runAdminAction(() => moveCategory(slug, "up")))}
        className={iconButton}
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Descendre ${label}`}
        disabled={isLast || isPending}
        onClick={() => startTransition(() => runAdminAction(() => moveCategory(slug, "down")))}
        className={iconButton}
      >
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </button>

      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Modifier
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isPending || (locked && active)}
        title={locked ? "Cette catégorie alimente une page du site" : undefined}
        onClick={() => startTransition(() => runAdminAction(() => toggleCategoryActive(slug, !active)))}
      >
        {active ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
        {active ? "Désactiver" : "Activer"}
      </Button>

      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={locked || articleCount > 0}
        title={
          locked
            ? "Cette catégorie alimente une page du site"
            : articleCount > 0
              ? "Des articles utilisent cette catégorie : désactivez-la plutôt"
              : undefined
        }
        onClick={() =>
          confirmAndRun({
            title: "Supprimer la catégorie",
            confirmLabel: "Supprimer",
            message: `Supprimer définitivement la catégorie « ${label} » ?`,
            run: () => deleteCategory(slug),
          })
        }
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Supprimer
      </Button>

      <Modal open={editing} onClose={() => setEditing(false)} title="Modifier la catégorie" maxWidth="max-w-md">
        <CategoryForm slug={slug} label={label} onDone={() => setEditing(false)} />
      </Modal>
    </div>
  );
}
