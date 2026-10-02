"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { upsertSiteSettings, type SiteSettingsActionState } from "@/app/actions/admin/site-settings";
import type { SiteSettings } from "@prisma/client";

const initialState: SiteSettingsActionState = { success: false, message: "" };

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const [state, formAction, isPending] = useActionState(upsertSiteSettings, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <p role="alert" className={state.success ? "text-sm text-success" : "text-sm text-destructive"}>
          {state.message}
        </p>
      )}

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Coordonnées</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Affichées sur la page Contact et dans le pied de page du site.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" defaultValue={settings?.phone ?? ""} placeholder="+221 77 123 45 67" />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={settings?.whatsapp ?? ""} placeholder="+221 77 123 45 67" />
          </div>
          <div>
            <Label htmlFor="email">Email de contact</Label>
            <Input id="email" name="email" type="email" defaultValue={settings?.email ?? ""} placeholder="contact@fmasport.com" />
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" name="address" defaultValue={settings?.address ?? ""} placeholder="Dakar, Sénégal" />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="font-heading text-lg font-semibold text-foreground">Réseaux sociaux</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Laisser un champ vide conserve le lien par défaut du site.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="facebookUrl">Facebook</Label>
            <Input id="facebookUrl" name="facebookUrl" defaultValue={settings?.facebookUrl ?? ""} placeholder="https://facebook.com/..." />
          </div>
          <div>
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input id="instagramUrl" name="instagramUrl" defaultValue={settings?.instagramUrl ?? ""} placeholder="https://instagram.com/..." />
          </div>
          <div>
            <Label htmlFor="tiktokUrl">TikTok</Label>
            <Input id="tiktokUrl" name="tiktokUrl" defaultValue={settings?.tiktokUrl ?? ""} placeholder="https://tiktok.com/@..." />
          </div>
          <div>
            <Label htmlFor="youtubeUrl">YouTube</Label>
            <Input id="youtubeUrl" name="youtubeUrl" defaultValue={settings?.youtubeUrl ?? ""} placeholder="https://youtube.com/@..." />
          </div>
          <div>
            <Label htmlFor="snapchatUrl">Snapchat</Label>
            <Input id="snapchatUrl" name="snapchatUrl" defaultValue={settings?.snapchatUrl ?? ""} placeholder="https://snapchat.com/add/..." />
          </div>
          <div>
            <Label htmlFor="xUrl">X (Twitter)</Label>
            <Input id="xUrl" name="xUrl" defaultValue={settings?.xUrl ?? ""} placeholder="https://x.com/..." />
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
