"use client";

// Edit property form (issue #15)
// Loads one property, fills in the form, and saves changes with PATCH.
// Runs in the browser and calls the Property API from PR #14.

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Property } from "@/lib/types";
import { friendlyError } from "../../friendlyError";

type LoadStatus = "loading" | "ready" | "not-found" | "signed-out" | "error";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800";

const inputClasses =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800";

const primaryButton = `inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-800 px-5 font-semibold text-white hover:bg-blue-900 disabled:opacity-60 ${focusRing}`;

const cancelButton = `inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 font-semibold text-gray-800 hover:bg-gray-100 ${focusRing}`;

const backLink = `font-semibold text-blue-800 underline ${focusRing}`;

export default function EditPropertyForm({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  // Read the property id from the page address (the docs' use(params) pattern)
  const { propertyId } = use(params);
  const router = useRouter();

  const [status, setStatus] = useState<LoadStatus>("loading");

  // Form fields (filled in once the property loads)
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load this one property (GET /api/properties/[propertyId])
  useEffect(() => {
    let ignore = false;

    async function loadProperty() {
      try {
        const response = await fetch(
          `/api/properties/${encodeURIComponent(propertyId)}`,
          { cache: "no-store" }
        );
        if (ignore) return;

        if (response.status === 401) {
          setStatus("signed-out");
          return;
        }

        // 404 = the property does not exist or belongs to someone else
        if (response.status === 404) {
          setStatus("not-found");
          return;
        }

        if (!response.ok) {
          setStatus("error");
          return;
        }

        const data: { property: Property } = await response.json();
        if (ignore) return;

        setName(data.property.name);
        setLocation(data.property.location);
        setNotes(data.property.notes ?? "");
        setStatus("ready");
      } catch {
        if (!ignore) setStatus("error");
      }
    }

    loadProperty();

    // If the user leaves the page before loading finishes, ignore the answer
    return () => {
      ignore = true;
    };
  }, [propertyId]);

  // Save changes (PATCH /api/properties/[propertyId])
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // Quick checks first, so the user gets a clear message right away
    if (!name.trim()) {
      setFormError("Please enter a property name.");
      return;
    }

    if (!location.trim()) {
      setFormError("Please enter the property's location.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(propertyId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, location, notes }),
        }
      );

      if (!response.ok) {
        setFormError(
          await friendlyError(
            response,
            "We couldn't save your changes. Please try again."
          )
        );
        return;
      }

      // Saved: go back to the list, which loads the updated property
      router.push("/properties");
    } catch {
      setFormError(
        "We couldn't reach the server. Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <p role="status" className="mt-6 text-gray-700">
        Loading property...
      </p>
    );
  }

  if (status === "signed-out") {
    return (
      <p className="mt-6 rounded-xl bg-white p-5 text-gray-800 shadow-sm">
        Please sign in to edit your properties.
      </p>
    );
  }

  if (status === "not-found") {
    return (
      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <p className="text-gray-800">
          We couldn&apos;t find that property. It may have been deleted.
        </p>
        <p className="mt-3">
          <Link href="/properties" className={backLink}>
            Back to my properties
          </Link>
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <p role="alert" className="text-red-700">
          We couldn&apos;t load this property. Please refresh the page to try
          again.
        </p>
        <p className="mt-3">
          <Link href="/properties" className={backLink}>
            Back to my properties
          </Link>
        </p>
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-xl border-t-4 border-amber-500 bg-white p-5 shadow-sm">
      <form onSubmit={handleSave} noValidate className="space-y-4">
        <div>
          <label htmlFor="edit-name" className="block font-medium text-gray-800">
            Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={150}
            autoComplete="off"
            aria-describedby={formError ? "edit-property-error" : undefined}
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="edit-location"
            className="block font-medium text-gray-800"
          >
            Location
          </label>
          <input
            id="edit-location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            autoComplete="off"
            aria-describedby={formError ? "edit-property-error" : undefined}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="edit-notes" className="block font-medium text-gray-800">
            Notes <span className="font-normal text-gray-600">(optional)</span>
          </label>
          <textarea
            id="edit-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className={inputClasses}
          />
        </div>

        {formError && (
          <p id="edit-property-error" role="alert" className="text-red-700">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving ? "Saving..." : "Save changes"}
          </button>
          <Link href="/properties" className={cancelButton}>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
