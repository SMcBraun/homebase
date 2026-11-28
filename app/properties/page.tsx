// Properties page (issue #15): /properties
// This server page is only the frame (heading and layout).
// The working part (list, add form, delete) is the PropertyManager client component.

import type { Metadata } from "next";
import PropertyManager from "./PropertyManager";

// Short title only (issue #19): the root layout template adds " | HomeBase".
export const metadata: Metadata = {
  title: "My Properties",
  description: "Add, edit, and remove the properties you take care of.",
};

export default function PropertiesPage() {
  return (
    <main className="flex-1 bg-gray-100 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-blue-800 sm:text-3xl">
          My Properties
        </h1>
        <p className="mt-1 text-gray-700">
          Add, edit, or remove the homes you take care of.
        </p>

        <div className="mt-6">
          <PropertyManager />
        </div>
      </div>
    </main>
  );
}
