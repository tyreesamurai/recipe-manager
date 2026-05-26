export const dynamic = "force-dynamic";

import { ImportClient } from "@/components/import/import-client";

export default function ImportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <ImportClient />
    </div>
  );
}
