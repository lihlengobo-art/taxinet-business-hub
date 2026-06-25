import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function TopContent({
  items,
}: {
  items: { target: string | null; clicks: number }[]
}) {
  const max = Math.max(1, ...items.map((i) => i.clicks))
  return (
    <Card className="p-5">
      <h2 className="font-semibold">Most engaged categories</h2>
      <p className="text-sm text-muted-foreground">Top content clicks across all users</p>
      <ul className="mt-4 flex flex-col gap-3">
        {items.length === 0 && (
          <li className="text-sm text-muted-foreground">No engagement recorded yet.</li>
        )}
        {items.map((item) => (
          <li key={item.target ?? 'unknown'} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.target ?? 'Unknown'}</span>
              <span className="text-muted-foreground">{item.clicks.toLocaleString()}</span>
            </div>
            <Progress value={(item.clicks / max) * 100} className="h-2" />
          </li>
        ))}
      </ul>
    </Card>
  )
}
