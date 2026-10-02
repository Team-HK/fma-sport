"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

type Registration = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string | null;
  createdAt: Date;
};

export function RegistrationsModal({
  eventName,
  registrations,
}: {
  eventName: string;
  registrations: Registration[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Inscriptions ({registrations.length})
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Inscriptions — ${eventName}`}
        maxWidth="max-w-xl"
      >
        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {registrations.map((r) => (
            <Card key={r.id} className="p-4 text-sm">
              <p className="font-medium text-foreground">{r.fullName}</p>
              <p className="text-muted-foreground">
                {r.email} · {r.phone} · {formatDate(r.createdAt)}
              </p>
              {r.notes && <p className="mt-1 text-muted-foreground">{r.notes}</p>}
            </Card>
          ))}
          {registrations.length === 0 && (
            <p className="py-6 text-center text-muted-foreground">
              Aucune inscription pour le moment.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
