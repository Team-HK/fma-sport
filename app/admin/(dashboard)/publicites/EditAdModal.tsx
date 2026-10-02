"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AdForm } from "./AdForm";
import type { Advertisement } from "@prisma/client";

export function EditAdModal({ ad }: { ad: Advertisement }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier la publicité">
        <AdForm ad={ad} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
