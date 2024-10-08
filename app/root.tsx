import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { type PropsWithChildren } from "react";
import tw from "~/styles/tailwind.css?url";
import NavBar from "./components/nav";
import appcss from "./styles/app.css?url";
import { ThemeProvider, useTheme } from "./theme";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tw },
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

function Root() {
  const { theme } = useTheme();

  return (
    <html lang="en" className="h-full" data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
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
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
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
