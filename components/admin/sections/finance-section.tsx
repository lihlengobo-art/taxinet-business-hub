'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DashboardData } from '@/app/actions/admin-dashboard'
import type { DateRange } from '@/app/actions/admin-analytics'
import { downloadCsv, formatDay, formatZAR } from '@/lib/admin/format'
import { Banknote, Download, Printer, TrendingDown, Wallet, Wifi } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts'
import { KpiCard } from '../kpi-card'
import { RecordExpenseDialog, RecordSaleDialog } from '../finance-dialogs'

type Finance = NonNullable<DashboardData['finance']>

export function FinanceSection({
  data,
  range,
  onChange,
}: {
  data: Finance
  range: DateRange
  onChange: () => void
}) {
  const revenue = data.revenueByDay.map((d) => ({ ...d, label: formatDay(d.day) }))

  function exportSales() {
    downloadCsv(
      `sales-${range.from}-to-${range.to}`,
      ['Date', 'Partner', 'Description', 'Category', 'Amount', 'Commission %', 'Commission'],
      data.sales.map((s) => [
        s.saleDate,
        s.partnerName,
        s.description ?? '',
        s.category ?? '',
        Number(s.amount),
        Number(s.commissionRate),
        Number(s.commissionAmount),
      ]),
    )
  }

  function exportExpenses() {
    downloadCsv(
      `expenses-${range.from}-to-${range.to}`,
      ['Date', 'Category', 'Description', 'Amount'],
      data.expenses.map((e) => [e.expenseDate, e.category, e.description ?? '', Number(e.amount)]),
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <RecordSaleDialog onSaved={onChange} />
        <RecordExpenseDialog onSaved={onChange} />
        <Button size="sm" variant="outline" onClick={() => window.print()}>
          <Printer className="mr-1.5 h-4 w-4" />
          Print report
        </Button>
      </div>

      {/* Printable report header */}
      <div className="hidden print:block">
        <h1 className="text-xl font-bold">Wanderers Taxi Rank — Financial Report</h1>
        <p className="text-sm">
          {range.from} to {range.to}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard
          label="Wi-Fi revenue"
          value={formatZAR(data.summary.connectionRevenue)}
          hint={`${data.summary.connectionCount} connections`}
          icon={Wifi}
        />
        <KpiCard
          label="Partner revenue"
          value={formatZAR(data.summary.revenue)}
          hint={`${data.summary.salesCount} sales`}
          icon={Banknote}
        />
        <KpiCard
          label="Commission"
          value={formatZAR(data.summary.commission)}
          icon={Wallet}
          accent="accent"
        />
        <KpiCard
          label="Expenses"
          value={formatZAR(data.summary.expenses)}
          icon={TrendingDown}
          accent="destructive"
        />
        <KpiCard
          label="Net profit"
          value={formatZAR(data.summary.netProfit)}
          hint={`Avg sale ${formatZAR(data.summary.avgSale)}`}
          icon={Wallet}
          accent={data.summary.netProfit >= 0 ? 'positive' : 'destructive'}
        />
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Daily income</h2>
        <p className="text-sm text-muted-foreground">
          Wi-Fi connections, partner revenue & commission
        </p>
        <ChartContainer
          config={{
            wifi: { label: 'Wi-Fi', color: 'var(--chart-1)' },
            revenue: { label: 'Partner revenue', color: 'var(--chart-3)' },
            commission: { label: 'Commission', color: 'var(--chart-2)' },
          }}
          className="mt-4 h-[240px] w-full"
        >
          <BarChart data={revenue} margin={{ left: 0, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} width={40} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="wifi" fill="var(--color-wifi)" radius={4} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            <Bar dataKey="commission" fill="var(--color-commission)" radius={4} />
          </BarChart>
        </ChartContainer>
      </Card>

      {/* Sales table */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Sales</h2>
            <p className="text-sm text-muted-foreground">Recorded partner revenue</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportSales} className="print:hidden">
            <Download className="mr-1.5 h-4 w-4" />
            CSV
          </Button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No sales recorded for this period.
                  </TableCell>
                </TableRow>
              )}
              {data.sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDay(s.saleDate)}
                  </TableCell>
                  <TableCell className="font-medium">{s.partnerName}</TableCell>
                  <TableCell className="text-right">{formatZAR(Number(s.amount))}</TableCell>
                  <TableCell className="text-right text-primary">
                    {formatZAR(Number(s.commissionAmount))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Expenses table */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Expenses</h2>
            <p className="text-sm text-muted-foreground">Operating costs</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportExpenses} className="print:hidden">
            <Download className="mr-1.5 h-4 w-4" />
            CSV
          </Button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No expenses recorded for this period.
                  </TableCell>
                </TableRow>
              )}
              {data.expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDay(e.expenseDate)}
                  </TableCell>
                  <TableCell className="font-medium">{e.category}</TableCell>
                  <TableCell className="text-right">{formatZAR(Number(e.amount))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
