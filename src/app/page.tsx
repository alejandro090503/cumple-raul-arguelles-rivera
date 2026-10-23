import { InvitationClient } from "./_components/InvitationClient";
import { EnvelopeLoader } from "./_components/EnvelopeLoader";

/* ─── PAGE (Server Component — reads searchParams as async prop) ─── */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ pases?: string; para?: string }>;
}) {
  const sp = await searchParams;
  const raw = parseInt(sp?.pases ?? "1", 10);
  const pases = isNaN(raw) || raw < 1 || raw > 20 ? 1 : raw;
  const nombre = (sp?.para ?? "").trim();

  return (
    <EnvelopeLoader>
      <InvitationClient pases={pases} nombre={nombre} />
    </EnvelopeLoader>
  );
}
