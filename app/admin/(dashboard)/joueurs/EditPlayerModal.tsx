"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PlayerForm } from "./PlayerForm";
import type { Player } from "@prisma/client";

export function EditPlayerModal({ player }: { player: Player }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier le profil">
        <PlayerForm player={player} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
