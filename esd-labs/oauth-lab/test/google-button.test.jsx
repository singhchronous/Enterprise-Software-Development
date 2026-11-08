// Section 08: GoogleSignInButton (src/auth/GoogleSignInButton.jsx), against a pretend
// Google Identity Services (support/google.js). No network, no real Google.
import { StrictMode } from "react";
import { describe, expect, test, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoogleSignInButton } from "../src/auth/GoogleSignInButton.jsx";
import { CLIENT_ID, fakeGoogle, gsiScript, signIdToken } from "./support/google.js";

const googleButtons = () => screen.queryAllByRole("button", { name: "Sign in with Google" });

// The script loadGoogle() added "finishes loading": Google's code is now on the page.
async function scriptLoads() {
  const id = fakeGoogle();
  await act(async () => gsiScript().dispatchEvent(new Event("load")));
  return id;
}

describe("08 · GoogleSignInButton", () => {
  test("initializes GIS with the client ID and a callback, and renders the button into its own <div>", async () => {
    const id = fakeGoogle();
    const { container } = render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={() => {}} />);
    expect(await screen.findByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();

    expect(id.initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: CLIENT_ID, callback: expect.any(Function) }));
    expect(id.renderButton).toHaveBeenCalledTimes(1);
    const [parent, options] = id.renderButton.mock.calls[0];
    expect(parent).toBeInstanceOf(HTMLDivElement); // a real DOM element — that's what the ref is for
    expect(container.contains(parent)).toBe(true); // …and it's this component's own
    expect(options).toEqual(expect.any(Object));
    expect(id.initialize.mock.invocationCallOrder[0]).toBeLessThan(id.renderButton.mock.invocationCallOrder[0]);
  });

  test("when Google calls back, onCredential gets the credential string — the ID token itself", async () => {
    const id = fakeGoogle();
    const token = signIdToken();
    id.nextCredential = token;
    const onCredential = vi.fn();
    render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={onCredential} />);
    await userEvent.click(await screen.findByRole("button", { name: "Sign in with Google" }));
    expect(onCredential).toHaveBeenCalledTimes(1);
    expect(onCredential).toHaveBeenCalledWith(token); // the string, not { credential, select_by }
  });

  test("waits for Google's script: nothing happens until it has loaded, then the button appears", async () => {
    render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={() => {}} />); // no window.google yet
    expect(gsiScript()).not.toBeNull(); // loadGoogle() put Google's <script> on the page
    expect(googleButtons()).toHaveLength(0);

    const id = await scriptLoads();
    expect(await screen.findByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    expect(id.initialize).toHaveBeenCalledTimes(1);
  });

  test("unmounted before the script loaded: it draws nothing into a page that has moved on", async () => {
    const { unmount } = render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={() => {}} />);
    unmount();
    const id = await scriptLoads();
    expect(id.initialize).not.toHaveBeenCalled();
    expect(id.renderButton).not.toHaveBeenCalled();
  });

  test("under StrictMode (the effect runs, is cleaned up, runs again) there is exactly ONE button", async () => {
    fakeGoogle();
    render(
      <StrictMode>
        <GoogleSignInButton clientId={CLIENT_ID} onCredential={() => {}} />
      </StrictMode>
    );
    await screen.findByRole("button", { name: "Sign in with Google" });
    expect(googleButtons()).toHaveLength(1);
  });

  test("a parent re-render with a new onCredential doesn't redraw the button — and the NEW handler is the one called", async () => {
    const id = fakeGoogle();
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={first} />);
    await screen.findByRole("button", { name: "Sign in with Google" });
    rerender(<GoogleSignInButton clientId={CLIENT_ID} onCredential={second} />); // e.g. the parent re-rendered
    rerender(<GoogleSignInButton clientId={CLIENT_ID} onCredential={second} />);

    expect(id.renderButton).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "Sign in with Google" }));
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  test("a new clientId: initialize again with it, and still exactly one button", async () => {
    const id = fakeGoogle();
    const { rerender } = render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={() => {}} />);
    await screen.findByRole("button", { name: "Sign in with Google" });
    rerender(<GoogleSignInButton clientId="another-app.apps.googleusercontent.com" onCredential={() => {}} />);

    await vi.waitFor(() => expect(id.initialize).toHaveBeenCalledTimes(2));
    expect(id.initialize).toHaveBeenLastCalledWith(expect.objectContaining({ client_id: "another-app.apps.googleusercontent.com" }));
    await vi.waitFor(() => expect(id.renderButton).toHaveBeenCalledTimes(2));
    expect(googleButtons()).toHaveLength(1);
  });

  test("if Google's script can't load (offline, a blocker), it says so in an alert", async () => {
    render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={() => {}} />);
    await act(async () => gsiScript().dispatchEvent(new Event("error")));
    expect(await screen.findByRole("alert")).toHaveTextContent(/Couldn't load Google sign-in/);
  });
});
