import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
        <p className="section-eyebrow justify-center">404</p>
        <h1 className="font-display text-3xl font-bold sm:text-5xl">
          This page went <span className="text-gradient-blue">offline.</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-nex-mist">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Back to Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
