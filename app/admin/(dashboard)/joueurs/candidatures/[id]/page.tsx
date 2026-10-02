import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { POSITION_LABELS, STRONG_FOOT_LABELS } from "@/lib/constants";
import { FileText } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { statusMeta } from "@/lib/admin-ui";
import { CandidacyRowActions } from "../../CandidacyRowActions";

export default async function CandidacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidacy = await prisma.candidacy.findUnique({ where: { id } });
  if (!candidacy) notFound();

  const age = Math.floor(
    (Date.now() - new Date(candidacy.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {candidacy.firstName} {candidacy.lastName}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            Candidature reçue le {formatDate(candidacy.createdAt)}
            <StatusBadge tone={statusMeta(candidacy.status).tone}>
              {statusMeta(candidacy.status).label}
            </StatusBadge>
          </p>
        </div>
        <CandidacyRowActions id={candidacy.id} status={candidacy.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Informations personnelles
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Row label="Âge" value={`${age} ans`} />
              <Row label="Nationalité" value={candidacy.nationality} />
              <Row label="Pays de résidence" value={candidacy.residenceCountry} />
              <Row label="Téléphone" value={candidacy.phone} />
              {candidacy.whatsapp && <Row label="WhatsApp" value={candidacy.whatsapp} />}
              <Row label="Email" value={candidacy.email} />
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Informations football
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Row
                label="Poste principal"
                value={POSITION_LABELS[candidacy.mainPosition] ?? candidacy.mainPosition}
              />
              {candidacy.secondaryPosition && (
                <Row
                  label="Poste secondaire"
                  value={POSITION_LABELS[candidacy.secondaryPosition] ?? candidacy.secondaryPosition}
                />
              )}
              <Row
                label="Pied fort"
                value={STRONG_FOOT_LABELS[candidacy.strongFoot] ?? candidacy.strongFoot}
              />
              {candidacy.height && <Row label="Taille" value={`${candidacy.height} cm`} />}
              {candidacy.weight && <Row label="Poids" value={`${candidacy.weight} kg`} />}
              {candidacy.currentClub && <Row label="Club actuel" value={candidacy.currentClub} />}
              {candidacy.level && <Row label="Niveau" value={candidacy.level} />}
              {candidacy.previousClub && <Row label="Ancien club" value={candidacy.previousClub} />}
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">Passeport</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Row label="Possède un passeport" value={candidacy.hasPassport ? "Oui" : "Non"} />
              {candidacy.hasPassport && candidacy.passportCountry && (
                <Row label="Pays du passeport" value={candidacy.passportCountry} />
              )}
              {candidacy.hasPassport && candidacy.passportExpiry && (
                <Row label="Expiration" value={formatDate(candidacy.passportExpiry)} />
              )}
            </dl>
          </Card>

          {(candidacy.clubHistory ||
            candidacy.experience ||
            candidacy.selections ||
            candidacy.competitionsPlayed ||
            candidacy.honours) && (
            <Card className="space-y-3 p-6 text-sm">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Parcours football
              </h2>
              {candidacy.clubHistory && <Block label="Historique des clubs" value={candidacy.clubHistory} />}
              {candidacy.experience && <Block label="Expérience" value={candidacy.experience} />}
              {candidacy.selections && <Block label="Sélections" value={candidacy.selections} />}
              {candidacy.competitionsPlayed && (
                <Block label="Compétitions disputées" value={candidacy.competitionsPlayed} />
              )}
              {candidacy.honours && <Block label="Palmarès" value={candidacy.honours} />}
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {candidacy.photoUrl && (
            <Card className="overflow-hidden p-0">
              <div className="relative aspect-square w-full bg-muted">
                <Image src={candidacy.photoUrl} alt="Photo du candidat" fill className="object-cover" />
              </div>
            </Card>
          )}

          {(candidacy.youtubeLink ||
            candidacy.tiktokLink ||
            candidacy.driveLink ||
            candidacy.otherVideoLinks.length > 0) && (
            <Card className="p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground">Vidéos</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {candidacy.youtubeLink && (
                  <LinkItem href={candidacy.youtubeLink} label="Lien YouTube" />
                )}
                {candidacy.tiktokLink && <LinkItem href={candidacy.tiktokLink} label="Lien TikTok" />}
                {candidacy.driveLink && (
                  <LinkItem href={candidacy.driveLink} label="Lien Google Drive" />
                )}
                {candidacy.otherVideoLinks.map((url) => (
                  <LinkItem key={url} href={url} label={url} />
                ))}
              </ul>
            </Card>
          )}

          {(candidacy.cvUrl || candidacy.documentUrls.length > 0) && (
            <Card className="p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground">Documents</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {candidacy.cvUrl && <LinkItem href={candidacy.cvUrl} label="CV football" />}
                {candidacy.documentUrls.map((url, i) => (
                  <LinkItem key={url} href={url} label={`Document ${i + 1}`} />
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6 text-sm">
            <h2 className="font-heading text-lg font-semibold text-foreground">Consentement</h2>
            <p className="mt-2 text-muted-foreground">
              {candidacy.consentGiven
                ? "Le candidat a donné son consentement pour l'étude de sa candidature."
                : "Consentement non renseigné."}
            </p>
          </Card>

          {candidacy.adminNote && (
            <Card className="p-6 text-sm">
              <h2 className="font-heading text-lg font-semibold text-foreground">Note interne</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">{candidacy.adminNote}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-span-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line text-muted-foreground">{value}</p>
    </div>
  );
}

function LinkItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex cursor-pointer items-center gap-2 truncate text-primary hover:underline"
      >
        <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </a>
    </li>
  );
}
