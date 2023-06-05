import Link from "next/link";

export default function Home() {
  return (
    <main className="p-12">
      Search demo{" "}
      <Link className="text-blue-500" href="/search">
        /search
      </Link>
    </main>
  );
}
