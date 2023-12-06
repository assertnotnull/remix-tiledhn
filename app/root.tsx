import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";
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
  const navigation = useNavigation();
  const sections = [
    { name: "Stories", path: "/" },
    { name: "Ask", path: "/ask" },
    { name: "Jobs", path: "/jobs" },
    { name: "Show", path: "/show" },
  ];

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <main>
          <div className="navbar bg-base-100">
            <div className="navbar-start">
              <div className="dropdown">
                <label tabIndex={0} className="btn btn-ghost lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
                >
                  {sections.map((section) => (
                    <li key={section.name}>
                      <NavLink
                        prefetch="intent"
                        to={section.path}
                        className={({ isActive, isPending }) =>
                          isActive ? "active" : isPending ? "pending" : ""
                        }
                      >
                        {section.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/" className="btn btn-ghost normal-case text-xl">
                Tiled hacker news
              </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal p-0">
                {sections.map((section) => (
                  <li key={section.name}>
                    <Link to={section.path}>{section.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="navbar-end">
              <Link to="/about" className="btn">
                About
              </Link>
            </div>
          </div>
          <div
            id="content"
            className={navigation.state === "loading" ? "loading" : ""}
          >
            <Outlet />
          </div>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
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
