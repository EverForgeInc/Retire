"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ApproveRateButton({ versionId }: { versionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function approve() {
    setBusy(true);
    await fetch(`/api/admin/rates/${versionId}/approve`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <Button type="button" size="sm" onClick={approve} disabled={busy}>
      {busy ? "Approving..." : "Approve version"}
    </Button>
  );
}
