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
        </div>
      </Link>

      {/* Desktop nav */}
      <nav className="navlinks navDesktop">
        <Link className="navLink" href="/">
          Home
        </Link>
        <Link className="navLink" href="/arbitrage">
          Arbitrage
        </Link>
        <Link className="navLink" href="/long-run">
          Long Run
        </Link>
        <Link className="navLink" href="/guide">
          Guide
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
            href="/arbitrage"
            onClick={() => setOpen(false)}
          >
            Arbitrage
          </Link>
          <Link
            className="mobileLink"
            href="/long-run"
            onClick={() => setOpen(false)}
          >
            Long Run
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
