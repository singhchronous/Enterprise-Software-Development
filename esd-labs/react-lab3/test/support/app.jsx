// Given — don't edit. Rendering the app at a URL, and logging in through its own screens.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "../../src/App.jsx";
import { ACCOUNTS } from "./fetch.js";

// The whole app, as if the browser had just opened `url`. A MemoryRouter keeps the
// "address bar" in memory: tests have no real one.
export function renderApp(url = "/") {
  const user = userEvent.setup();
  const view = render(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>
  );
  return { user, ...view };
}

// The <header> (role "banner") — where the navigation and "who's logged in" live.
export const header = () => within(screen.getByRole("banner"));

// On the login page: fill in the form and press the "Log in" button.
export async function submitLogin(user, who = "student", password = ACCOUNTS[who].password) {
  await user.type(await screen.findByLabelText("Email"), ACCOUNTS[who].email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Log in" }));
}

// From any page: "Log in" in the header, the form, then wait for "Log out" to appear.
export async function logInFromHeader(user, who = "student") {
  await user.click(header().getByRole("link", { name: "Log in" }));
  await submitLogin(user, who);
  await screen.findByRole("button", { name: "Log out" });
}
