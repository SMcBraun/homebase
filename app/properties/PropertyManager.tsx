"use client";

// Property pages (issues #15 and #8)
// The working part of /properties: lists the signed-in user's properties,
// adds new ones, and deletes them only after a clear warning.
// Runs in the browser and calls the Property API from PR #14.

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import type { Property } from "@/lib/types";
import { friendlyError } from "./friendlyError";

type LoadStatus = "loading" | "ready" | "signed-out" | "error";
type Notice = { type: "success" | "error"; text: string };

// Keep the list A to Z by name, the same order the API uses
function sortByName(list: Property[]) {
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800";

const inputClasses =
  "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800";

const primaryButton = `inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-800 px-5 font-semibold text-white hover:bg-blue-900 disabled:opacity-60 ${focusRing}`;

const outlineButton = `inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-800 bg-white px-4 font-semibold text-blue-800 hover:bg-blue-50 ${focusRing}`;

const dangerButton = `inline-flex min-h-11 items-center justify-center rounded-lg bg-red-600 px-4 font-semibold text-white hover:bg-red-700 disabled:opacity-60 ${focusRing}`;

const cancelButton = `inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 font-semibold text-gray-800 hover:bg-gray-100 ${focusRing}`;

export default function PropertyManager() {
  // The list and whether it has loaded
  const [properties, setProperties] = useState<Property[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  // Add form fields
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete: which card is showing the warning, and which one is being deleted
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Success or error message shown above the list
  const [notice, setNotice] = useState<Notice | null>(null);

  // Load the signed-in user's properties when the page opens
  useEffect(() => {
    let ignore = false;

    async function loadProperties() {
      try {
        const response = await fetch("/api/properties", { cache: "no-store" });
        if (ignore) return;

        if (response.status === 401) {
          setStatus("signed-out");
          return;
        }

        if (!response.ok) {
          setStatus("error");
          return;
        }

        const data: { properties: Property[] } = await response.json();
        if (ignore) return;

        setProperties(data.properties);
        setStatus("ready");
        // Clear any old message when the list loads again
        // (for example, after coming back from the Edit page)
        setNotice(null);
      } catch {
        if (!ignore) setStatus("error");
      }
    }

    loadProperties();

    // If the user leaves the page before loading finishes, ignore the answer
    return () => {
      ignore = true;
    };
  }, []);

  // Add a property (POST /api/properties)
  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setNotice(null);

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
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, notes }),
      });

      if (!response.ok) {
        setFormError(
          await friendlyError(
            response,
            "We couldn't add that property. Please try again."
          )
        );
        return;
      }

      const data: { property: Property } = await response.json();

      // Add the new property to the list without reloading the page
      setProperties((current) => sortByName([...current, data.property]));
      setName("");
      setLocation("");
      setNotes("");
      setNotice({ type: "success", text: `"${data.property.name}" was added.` });
    } catch {
      setFormError(
        "We couldn't reach the server. Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete a property (DELETE /api/properties/[propertyId])
  // Only runs after the user clicks "Yes, delete" in the warning (issue #8)
  async function handleDelete(property: Property) {
    setDeletingId(property.id);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/properties/${encodeURIComponent(property.id)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        setNotice({
          type: "error",
          text: await friendlyError(
            response,
            "We couldn't delete that property. Please try again."
          ),
        });
        return;
      }

      // Remove it from the list without reloading the page
      setProperties((current) => current.filter((p) => p.id !== property.id));
      setConfirmingId(null);
      setNotice({ type: "success", text: `"${property.name}" was deleted.` });
    } catch {
      setNotice({
        type: "error",
        text: "We couldn't reach the server. Please check your connection and try again.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  // Not signed in: the API answered 401
  if (status === "signed-out") {
    return (
      <p className="rounded-xl bg-white p-5 text-gray-800 shadow-sm">
        Please sign in to see and manage your properties.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success or error message (read aloud by screen readers) */}
      {notice && (
        <p
          role={notice.type === "error" ? "alert" : "status"}
          className={
            notice.type === "error"
              ? "rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
              : "rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900"
          }
        >
          {notice.text}
        </p>
      )}

      {/* Add property form (shown once the list has loaded) */}
      {status === "ready" && (
        <section
          aria-labelledby="add-property-heading"
          className="rounded-xl border-t-4 border-amber-500 bg-white p-5 shadow-sm"
        >
          <h2
            id="add-property-heading"
            className="text-xl font-semibold text-blue-800"
          >
            Add a property
          </h2>

          <form onSubmit={handleAdd} noValidate className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="property-name"
                className="block font-medium text-gray-800"
              >
                Name
              </label>
              <input
                id="property-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={150}
                autoComplete="off"
                aria-describedby={formError ? "add-property-error" : undefined}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="property-location"
                className="block font-medium text-gray-800"
              >
                Location
              </label>
              <input
                id="property-location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                autoComplete="off"
                aria-describedby={formError ? "add-property-error" : undefined}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="property-notes"
                className="block font-medium text-gray-800"
              >
                Notes <span className="font-normal text-gray-600">(optional)</span>
              </label>
              <textarea
                id="property-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className={inputClasses}
              />
            </div>

            {formError && (
              <p id="add-property-error" role="alert" className="text-red-700">
                {formError}
              </p>
            )}

            <button type="submit" disabled={saving} className={primaryButton}>
              {saving ? "Adding..." : "Add property"}
            </button>
          </form>
        </section>
      )}

      {/* The list of properties */}
      <section aria-labelledby="your-properties-heading">
        <h2
          id="your-properties-heading"
          className="text-xl font-semibold text-blue-800"
        >
          Your properties
        </h2>

        {status === "loading" && (
          <p role="status" className="mt-4 text-gray-700">
            Loading your properties...
          </p>
        )}

        {status === "error" && (
          <p role="alert" className="mt-4 text-red-700">
            We couldn&apos;t load your properties. Please refresh the page to try
            again.
          </p>
        )}

        {status === "ready" && properties.length === 0 && (
          <p className="mt-4 text-gray-700">
            You haven&apos;t added any properties yet. Use the form above to add
            your first one.
          </p>
        )}

        {status === "ready" && properties.length > 0 && (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {properties.map((property) => (
              <li key={property.id} className="rounded-xl bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800">
                  {property.name}
                </h3>
                <p className="text-gray-700">{property.location}</p>
                {property.notes && (
                  <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                    {property.notes}
                  </p>
                )}

                {confirmingId === property.id ? (
                  // Delete warning (issue #8): says exactly what will be lost
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p
                      id={`delete-warning-${property.id}`}
                      className="text-sm text-red-800"
                    >
                      <strong>Delete &quot;{property.name}&quot;?</strong> This
                      will also delete all of its maintenance tasks, schedules,
                      and maintenance history. This can&apos;t be undone.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(property)}
                        disabled={deletingId === property.id}
                        aria-describedby={`delete-warning-${property.id}`}
                        className={dangerButton}
                      >
                        {deletingId === property.id ? "Deleting..." : "Yes, delete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={deletingId === property.id}
                        className={cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/properties/${property.id}/edit`}
                      aria-label={`Edit ${property.name}`}
                      className={outlineButton}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setNotice(null);
                        setConfirmingId(property.id);
                      }}
                      aria-label={`Delete ${property.name}`}
                      className={cancelButton}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
