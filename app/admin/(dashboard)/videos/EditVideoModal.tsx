"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { VideoForm } from "./VideoForm";
import type { Video } from "@prisma/client";

export function EditVideoModal({ video }: { video: Video }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier la vidéo">
        <VideoForm video={video} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
