"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { HeroSlideForm } from "./HeroSlideForm";
import type { HeroSlide } from "@prisma/client";

export function EditHeroSlideModal({ slide }: { slide: HeroSlide }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier la diapositive">
        <HeroSlideForm slide={slide} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
