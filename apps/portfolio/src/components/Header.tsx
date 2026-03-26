"use client";

import { useState } from "react";
import { content } from "@/content/portfolio-content";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { nav } = content;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="text-sm font-semibold text-zinc-50 hover:text-accent transition-colors"
          >
            {nav.name}
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href={nav.demoLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              {nav.demoLink.label}
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-zinc-400 hover:text-zinc-50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 4L16 16M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-zinc-800 py-4 flex flex-col gap-3">
            {nav.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
            <a
              href={nav.demoLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit rounded-md bg-accent px-3.5 py-1.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              {nav.demoLink.label}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
