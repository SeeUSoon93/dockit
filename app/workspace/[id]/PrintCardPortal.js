import { createPortal } from "react-dom";

export default function PrintCardPortal({ children }) {
  if (typeof window === "undefined") return null;
  const printRoot =
    document.getElementById("print-root") ||
    (() => {
      const el = document.createElement("div");
      el.id = "print-root";
      document.body.appendChild(el);
      return el;
    })();
  return createPortal(children, printRoot);
}
