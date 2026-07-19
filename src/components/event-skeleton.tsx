export default function EventSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden group flex flex-col animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-48 w-full bg-white/10 relative" />
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Title Skeleton */}
        <div className="h-6 bg-white/20 rounded w-3/4 mb-4" />
        
        {/* Description Skeletons */}
        <div className="h-3 bg-white/10 rounded w-full mb-2" />
        <div className="h-3 bg-white/10 rounded w-5/6 mb-6" />
        
        {/* Details Box Skeleton */}
        <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5 mb-6">
          <div className="flex justify-between">
            <div className="h-3 bg-white/10 rounded w-12" />
            <div className="h-3 bg-white/20 rounded w-20" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-white/10 rounded w-12" />
            <div className="h-3 bg-white/20 rounded w-16" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-white/10 rounded w-20" />
            <div className="h-3 bg-white/20 rounded w-8" />
          </div>
        </div>
        
        {/* Button Skeleton */}
        <div className="h-12 bg-white/10 rounded-lg w-full mt-auto" />
      </div>
    </div>
  );
}
