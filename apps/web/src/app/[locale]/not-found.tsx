import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center text-sm text-secondary">
      <h2 className="text-xl font-semibold mb-2">Not Found</h2>
      <p className="mb-4">Could not find requested resource</p>
      <Link href="/" className="underline">
        Return Home
      </Link>
    </div>
  );
}
