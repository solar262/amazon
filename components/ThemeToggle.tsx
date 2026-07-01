"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    const shouldUseDark = saved === "dark";
    setDark(shouldUseDark);
    document.documentElement.dataset.theme = shouldUseDark ? "dark" : "light";
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("theme", next ? "dark" : "light");
  }

  return <button className="theme-toggle" onClick={toggle}>{dark ? "Light" : "Dark"}</button>;
}
