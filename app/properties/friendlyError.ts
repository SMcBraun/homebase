// Turns a failed Property API response into a message a homeowner can understand.
// The API sends { error: "..." } (for example "A property name is required"),
// so we show that text when it is helpful, and plain wording otherwise.
export async function friendlyError(response: Response, fallback: string) {
  // 401 = nobody is signed in (or the sign-in ended)
  if (response.status === 401) {
    return "Your sign-in has ended. Please sign in again.";
  }

  // 500 = something broke on the server; the raw message is not useful here
  if (response.status >= 500) {
    return fallback;
  }

  try {
    const data = await response.json();
    return typeof data?.error === "string" ? data.error : fallback;
  } catch {
    return fallback;
  }
}
