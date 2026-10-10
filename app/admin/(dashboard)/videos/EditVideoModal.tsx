"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { VideoForm } from "./VideoForm";
import type { Video } from "@prisma/client";

export function EditVideoModal({ video, players }: { video: Video; players: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier la vidéo">
        <VideoForm video={video} players={players} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
