// Sections 04–05: the route table (App.jsx), the layout (pages/Layout.jsx) and the 404
// page (pages/NotFound.jsx).
import { beforeEach, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { header, renderApp } from "./support/app.jsx";

beforeEach(() => {
  stubFetch();
});

describe("04–05 · routes, layout, 404", () => {
  test("/ shows the course list", async () => {
    renderApp("/");
    expect(screen.getByRole("heading", { name: "Courses" })).toBeInTheDocument();
    expect(await screen.findByText(/CS402 · Enterprise Software Development/)).toBeInTheDocument();
  });

  test("the header links to /, /me and /login", () => {
    renderApp("/");
    expect(header().getByRole("link", { name: "Courses" })).toHaveAttribute("href", "/");
    expect(header().getByRole("link", { name: "My courses" })).toHaveAttribute("href", "/me");
    expect(header().getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });

  test("the page appears inside the layout: header first, then <main> with the page in it", () => {
    renderApp("/");
    const main = screen.getByRole("main");
    expect(main).toContainElement(screen.getByRole("heading", { name: "Courses" }));
    expect(main).not.toContainElement(screen.getByRole("banner"));
  });

  test("/login shows the login page, in the same layout", () => {
    renderApp("/login");
    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Courses" })).not.toBeInTheDocument();
  });

  test("clicking the header's links moves between pages", async () => {
    const { user } = renderApp("/");
    await user.click(header().getByRole("link", { name: "Log in" }));
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
    await user.click(header().getByRole("link", { name: "Courses" }));
    expect(await screen.findByRole("heading", { name: "Courses" })).toBeInTheDocument();
  });

  test("/courses/4 is a page of its own — not the list, not the 404", () => {
    renderApp("/courses/4");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Courses" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Page not found" })).not.toBeInTheDocument();
  });

  test("an unknown URL shows Page not found, inside the layout, with the path and a way home", async () => {
    const { user } = renderApp("/no/such/page");
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByText("/no/such/page")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Back to the courses" }));
    expect(await screen.findByRole("heading", { name: "Courses" })).toBeInTheDocument();
  });
});
