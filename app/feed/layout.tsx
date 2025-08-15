import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NEO Feed - Cosmic Event Tracker",
  description: "Track and monitor Near-Earth Objects with data from NASA's API",
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}
