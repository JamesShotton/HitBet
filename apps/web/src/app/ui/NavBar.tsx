"use client";

import Link from "next/link";
import { useState } from "react";
import AuthButton from "./AuthButton";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav">
      {/* Brand */}
      <Link href="/" className="brandWrap" onClick={() => setOpen(false)}>
        <div className="logoDot" />
        <div className="brandText">
          <div className="brand">HitBet</div>
          <div className="tag">Cyber-clarity • Execution-ready</div>
        </div>
      </Link>

      {/* Desktop nav */}
      <nav className="navlinks navDesktop">
        <Link className="navLink" href="/">
          Home
        </Link>
        <Link className="navLink" href="/dashboard">
          Dashboard
        </Link>
        <Link className="navLink" href="/guide">
          Guide
        </Link>
        <Link className="navLink" href="/value">
          Value
        </Link>
        <Link className="navLink" href="/pricing">
          Plans
        </Link>
        <AuthButton />
      </nav>

      {/* Mobile hamburger */}
      <button
        className="hamburger"
        onClick={() => setOpen((p) => !p)}
        aria-label="Toggle menu"
      >
        <span className={`hamburgerLine ${open ? "hamburgerLineTop" : ""}`} />
        <span className={`hamburgerLine ${open ? "hamburgerLineMid" : ""}`} />
        <span className={`hamburgerLine ${open ? "hamburgerLineBot" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="mobileMenu">
          <Link className="mobileLink" href="/" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link
            className="mobileLink"
            href="/dashboard"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            className="mobileLink"
            href="/guide"
            onClick={() => setOpen(false)}
          >
            Guide
          </Link>
          <Link
            className="mobileLink"
            href="/value"
            onClick={() => setOpen(false)}
          >
            Value
          </Link>
          <Link
            className="mobileLink"
            href="/pricing"
            onClick={() => setOpen(false)}
          >
            Plans
          </Link>
          <div className="mobileDivider" />
          <div className="mobileAuth" onClick={() => setOpen(false)}>
            <AuthButton />
          </div>
        </div>
      )}
    </div>
  );
}
