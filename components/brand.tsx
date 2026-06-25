import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Brand({
  className,
  showName = true,
}: {
  className?: string
  showName?: boolean
}) {
  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/images/taxinet-logo.jpg"
        alt="Taxinet Connect"
        width={200}
        height={200}
        priority
        className={cn(
          'w-auto object-contain mix-blend-multiply',
          showName ? 'h-20' : 'h-14',
        )}
      />
    </div>
  )
}
