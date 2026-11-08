// Loading Google Identity Services (GIS) — GIVEN. Read it; don't edit it (section 06).
//
//   const google = await loadGoogle();      // window.google, once Google's script has run
//   google.accounts.id.initialize({ client_id, callback });
//   google.accounts.id.renderButton(element, options);
//
// The script lives on Google's servers (https://accounts.google.com/gsi/client). This adds it
// to the page the first time someone asks, and resolves when it has loaded. If it's already
// there, the promise resolves at once. While it's loading, every caller gets the same
// promise, so however often an effect runs (StrictMode runs yours twice), there is only ever
// one <script> tag.
//
// It rejects with an Error when the script can't load: offline, or an ad/tracker blocker
// stopping accounts.google.com. A later call tries again.
const SRC = "https://accounts.google.com/gsi/client";
let loading = null; // the promise while the script is loading; null otherwise

export function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      script.onload = () => {
        loading = null;
        if (window.google?.accounts?.id) resolve(window.google);
        else reject(new Error("Google's sign-in script loaded, but window.google isn't there."));
      };
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(new Error("Couldn't load Google sign-in. Are you offline, or is a blocker stopping accounts.google.com?"));
      };
      document.head.append(script);
    });
  }
  return loading;
}
