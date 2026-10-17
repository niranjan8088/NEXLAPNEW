export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col gap-6 bg-nex-black px-5 pt-32 sm:px-8">
      <div className="skeleton mx-auto h-10 w-64" />
      <div className="skeleton mx-auto h-16 w-full max-w-2xl" />
      <div className="skeleton mx-auto h-12 w-80" />
      <div className="mx-auto mt-10 grid w-full max-w-6xl grid-cols-2 gap-5 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-56 w-full" />
        ))}
      </div>
    </div>
  );
}
