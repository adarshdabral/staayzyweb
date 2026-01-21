import React, { Suspense } from "react";
import OwnerDashboardClient from "./OwnerDashboardClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OwnerDashboardClient />
    </Suspense>
  );
}

