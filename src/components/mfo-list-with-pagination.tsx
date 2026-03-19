"use client"

import * as React from 'react'
import { OffersGrid } from '@/components/offers'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Offer } from '@/types/offer'

interface MfoListWithPaginationProps {
  mfos: Offer[]
  initialLimit?: number
  step?: number
}

export function MfoListWithPagination({ 
  mfos, 
  initialLimit = 21,
  step = 21 
}: MfoListWithPaginationProps) {
  const [limit, setLimit] = React.useState(initialLimit)
  
  const visibleMfos = mfos.slice(0, limit)
  const hasMore = limit < mfos.length
  const remaining = mfos.length - limit
  
  const handleShowMore = () => {
    setLimit(prev => prev + step)
  }
  
  if (mfos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          МФО пока не добавлены
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <OffersGrid
        offers={visibleMfos}
        featuredIds={mfos.filter((m) => m.isFeatured).map((m) => m.id)}
      />
      
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={handleShowMore}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            Показать ещё
            <span className="text-muted-foreground">
              ({remaining} предложений)
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}
