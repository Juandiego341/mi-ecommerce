export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-zinc-800 rounded-lg ${className}`} />
)

export const ProductCardSkeleton = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <Skeleton className="w-full h-44 mb-4" />
    <Skeleton className="h-3 w-1/3 mb-2" />
    <Skeleton className="h-4 w-2/3 mb-3" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
)

export const ProductGridSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
)

export const ListRowSkeleton = () => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <Skeleton className="h-4 w-1/2 mb-3" />
    <Skeleton className="h-3 w-1/3" />
  </div>
)
