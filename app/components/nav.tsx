import { Link, NavLink } from "@remix-run/react";

export default function NavBar() {
  const sections = [
    { name: "Stories", path: "/" },
    { name: "Ask", path: "/ask" },
    { name: "Jobs", path: "/jobs" },
    { name: "Show", path: "/show" },
  ];

  return (
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
        <Link to="/" className="btn">
          About
        </Link>
      </div>
    </div>
  );
}
