"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { startMfaSetup, confirmMfaSetup, disableMfa, type MfaActionState } from "@/app/actions/admin/mfa";

const initialState: MfaActionState = { success: false, message: "" };

export function MfaManager({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [confirmState, confirmAction, isConfirming] = useActionState(confirmMfaSetup, initialState);
  const [disableState, disableAction, isDisabling] = useActionState(disableMfa, initialState);

  if (confirmState.success) {
    return (
      <p className="flex items-center gap-2 rounded-[10px] bg-success-soft p-4 text-sm font-medium text-success-soft-foreground">
        <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        {confirmState.message} Rechargez la page pour continuer.
      </p>
    );
  }

  if (disableState.success) {
    return (
      <p className="flex items-center gap-2 rounded-[10px] bg-warning-soft p-4 text-sm font-medium text-warning-soft-foreground">
        <ShieldOff className="h-5 w-5 shrink-0" aria-hidden="true" />
        {disableState.message} Rechargez la page pour continuer.
      </p>
    );
  }

  if (enabled) {
    return (
      <div className="space-y-4">
        <p className="flex items-center gap-2 rounded-[10px] bg-success-soft p-4 text-sm font-medium text-success-soft-foreground">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          L&apos;authentification à deux facteurs est activée sur ce compte.
        </p>
        <form action={disableAction} className="max-w-sm space-y-3">
          {disableState.message && (
            <p role="alert" className="text-sm text-destructive">
              {disableState.message}
            </p>
          )}
          <div>
            <Label htmlFor="password">Confirmez avec votre mot de passe</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
          <Button type="submit" variant="destructive" disabled={isDisabling}>
            {isDisabling ? "Désactivation..." : "Désactiver le MFA"}
          </Button>
        </form>
      </div>
    );
  }

  if (!setup) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Protégez ce compte avec un code à usage unique généré par une application
          d&apos;authentification (Google Authenticator, Authy, etc.), en plus du mot de passe.
        </p>
        <Button
          type="button"
          disabled={isStarting}
          onClick={async () => {
            setIsStarting(true);
            try {
              const result = await startMfaSetup();
              setSetup(result);
            } finally {
              setIsStarting(false);
            }
          }}
        >
          {isStarting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          )}
          Activer le MFA
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <p className="text-sm text-muted-foreground">
        Scannez ce code avec votre application d&apos;authentification, puis entrez le code à 6
        chiffres affiché pour confirmer.
      </p>
      <div className="flex justify-center rounded-[10px] border border-border bg-card p-4">
        <Image src={setup.qrCodeDataUrl} alt="Code QR d'authentification" width={200} height={200} unoptimized />
      </div>
      <p className="break-all rounded-[10px] bg-muted p-3 text-center font-mono text-xs text-muted-foreground">
        {setup.secret}
      </p>

      <form action={confirmAction} className="space-y-3">
        <input type="hidden" name="secret" value={setup.secret} />
        {confirmState.message && (
          <p role="alert" className="text-sm text-destructive">
            {confirmState.message}
          </p>
        )}
        <div>
          <Label htmlFor="code">Code de vérification</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            required
            autoFocus
            placeholder="123456"
            className="text-center text-lg tracking-[0.3em]"
          />
        </div>
        <Button type="submit" disabled={isConfirming}>
          {isConfirming ? "Vérification..." : "Confirmer et activer"}
        </Button>
      </form>
    </div>
  );
}
