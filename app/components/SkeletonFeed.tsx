export default function SkeletonFeed() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-gray-200 animate-pulse">
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            <div className="h-6 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}