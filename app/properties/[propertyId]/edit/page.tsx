// Edit property page (issue #15): /properties/[propertyId]/edit
// This server page is only the frame. Because cacheComponents is on, the
// property id in the address is "runtime data", so the Next.js docs say the
// part that reads it must sit inside <Suspense> (it shows "Loading..." first).

import type { Metadata } from "next";
import { Suspense } from "react";
import EditPropertyForm from "./EditPropertyForm";

export const metadata: Metadata = {
  title: "Edit Property | HomeBase",
  description: "Change a property's name, location, or notes.",
};

export default function EditPropertyPage({
  params,
}: PageProps<"/properties/[propertyId]/edit">) {
  return (
    <main className="flex-1 bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-2xl font-bold text-blue-800 sm:text-3xl">
          Edit property
        </h1>

        <Suspense
          fallback={
            <p role="status" className="mt-6 text-gray-700">
              Loading property...
            </p>
          }
        >
          {/* Pass the id "promise" down; the form unwraps it with use() */}
          <EditPropertyForm params={params} />
        </Suspense>
      </div>
    </main>
  );
}
