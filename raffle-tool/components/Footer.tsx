import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full text-center py-3 text-xs text-slate-400 absolute bottom-0 left-0 z-40">
      Made with <span className="text-pink-500">♥</span> by{" "}
      <Link
        href="https://x.com/constkurays"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-pink-400"
      >
        Kurays
      </Link>
    </footer>
  );
}
