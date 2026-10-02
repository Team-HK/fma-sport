"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EventForm } from "./EventForm";
import type { Event } from "@prisma/client";

export function EditEventModal({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier l'événement">
        <EventForm event={event} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
