import { NavLink } from "react-router";

const sections = [
  { name: "📖 Stories", path: "/" },
  { name: "❓ Ask", path: "/ask" },
  { name: "👨🏻‍💻 Jobs", path: "/jobs" },
  { name: "📺 Show", path: "/show" },
];

export default function NavLinks() {
  return (
    <>
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
    </>
  );
}
