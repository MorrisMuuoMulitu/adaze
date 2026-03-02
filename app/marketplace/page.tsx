import { Suspense } from 'react'
import { ProductList } from '@/components/product-list'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl bg-gray-200" />
          <Skeleton className="h-6 w-3/4 bg-gray-200" />
          <Skeleton className="h-8 w-1/2 bg-gray-200" />
          <Skeleton className="h-10 w-full rounded-lg bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      {/* Search Header - Statically Rendered */}
      <header className="mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Adaze Marketplace V2
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl">
          Discover high-quality, pre-loved fashion curated for you with AI precision.
        </p>
        
        <div className="relative max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
          <Input 
            className="pl-12 h-14 text-lg border-2 border-gray-100 bg-white/50 backdrop-blur-md rounded-2xl focus:ring-purple-600 focus:border-purple-600 transition-all shadow-sm group-hover:shadow-md"
            placeholder="Search fashion with AI intelligence..."
          />
        </div>
      </header>

      {/* Dynamic Product Grid - Streamed via Suspense */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          <div className="flex gap-2">
            {['All', 'Dresses', 'Shirts', 'Shoes', 'Accessories'].map(cat => (
              <button key={cat} className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList />
        </Suspense>
      </section>
    </div>
  )
}
