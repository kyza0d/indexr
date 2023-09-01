import Link from "next/link";

export default function Home() {
  return (
    <main className="p-12">
      <Link className="text-blue-500" href="/glyphs">
        /glyphs
      </Link>

      <br />

      <Link className="text-blue-500" href="/local">
        /local
      </Link>
    </main>
  );
}
