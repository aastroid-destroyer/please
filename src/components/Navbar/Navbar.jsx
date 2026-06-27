import { NavLink } from "react-router";
import Logo from "../Logo/Logo";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Coverage", to: "/coverage" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? "font-semibold text-primary underline underline-offset-4"
      : "hover:text-primary transition-colors";

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      {/* Mobile: hamburger */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
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
                strokeWidth={2}
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
          >
            {navLinks.map(({ label, to }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Brand */}
        <NavLink to="/" className="btn btn-ghost text-xl font-bold tracking-tight">
          <Logo></Logo>
        </NavLink>
      </div>

      {/* Desktop: nav links */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 px-1">
          {navLinks.map(({ label, to }) => (
            <li key={to}>
              <NavLink to={to} className={linkClass}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Right side: actions */}
      <div className="navbar-end gap-2">
        <NavLink to="/login" className="btn btn-ghost btn-sm">
          Login
        </NavLink>
        <NavLink to="/register" className="btn btn-primary btn-sm">
          Register
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;
