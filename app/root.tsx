import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";
import React, { useEffect } from "react";
import { DarkModeContext } from "./components/darkmodeContext";
import NavBar from "./components/nav";
import appcss from "./styles/app.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: appcss },
  ];
};

export const meta: MetaFunction = () => [
  {
    charset: "utf-8",
    title: "Remixed Tiled Hackernews",
    viewport: "width=device-width,initial-scale=1",
  },
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  useEffect(() => {
    if (global.window) {
      const darkModeQuery = global.window.matchMedia(
        "(prefers-color-scheme: dark)",
      );
      setIsDarkMode(darkModeQuery.matches);
      darkModeQuery.addEventListener("change", (event) => {
        setIsDarkMode(event.matches);
      });
    }
  }, []);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      <html
        lang="en"
        className="h-full"
        data-theme={isDarkMode ? "night" : "winter"}
      >
        <head>
          <Meta />
          <Links />
        </head>
        <body className="h-full">
          <main>
            <NavBar />
            <div id="content">
              <Outlet />
            </div>
          </main>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </DarkModeContext.Provider>
  );
}

function isDefinitelyAnError(error: unknown): error is Error {
  return error != null && typeof error == "object" && "message" in error;
}

function RootError({ children }: PropsWithChildren) {
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let stack = "";

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  if (isDefinitelyAnError(error)) {
    errorMessage = error.message;
    stack = error.stack ? error.stack : "";
  }

  return (
    <RootError>
      <div>
        <h1>Uh oh ...</h1>
        <p>Something went wrong.</p>
        <pre>{errorMessage}</pre>
        <pre>Stack: {stack}</pre>
      </div>
    </RootError>
  );
}
