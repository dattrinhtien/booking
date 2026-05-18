'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FileDown, TrendingUp, Calendar, Building2, Users } from 'lucide-react'
import { toast } from 'sonner'

// Mock Data representing a realistic year's bookings
interface BookingRecord {
  id: string
  apartmentId: string
  apartmentName: string
  collaboratorId: string
  collaboratorName: string
  month: string // YYYY-MM
  revenue: number
  bookingsCount: number
  nights: number
}

const mockBookingsData: BookingRecord[] = [
  // Căn hộ Mẫu 01
  { id: '1', apartmentId: '1', apartmentName: 'Căn hộ Mẫu 01', collaboratorId: 'collab1', collaboratorName: 'CTV Nguyễn', month: '2026-03', revenue: 15000000, bookingsCount: 6, nights: 12 },
  { id: '2', apartmentId: '1', apartmentName: 'Căn hộ Mẫu 01', collaboratorId: 'collab2', collaboratorName: 'CTV Trần', month: '2026-03', revenue: 8000000, bookingsCount: 3, nights: 6 },
  { id: '3', apartmentId: '1', apartmentName: 'Căn hộ Mẫu 01', collaboratorId: 'collab1', collaboratorName: 'CTV Nguyễn', month: '2026-04', revenue: 22000000, bookingsCount: 8, nights: 16 },
  { id: '4', apartmentId: '1', apartmentName: 'Căn hộ Mẫu 01', collaboratorId: 'collab2', collaboratorName: 'CTV Trần', month: '2026-04', revenue: 12000000, bookingsCount: 4, nights: 8 },
  { id: '5', apartmentId: '1', apartmentName: 'Căn hộ Mẫu 01', collaboratorId: 'collab1', collaboratorName: 'CTV Nguyễn', month: '2026-05', revenue: 35000000, bookingsCount: 12, nights: 24 },
  { id: '6', apartmentId: '1', apartmentName: 'Căn hộ Mẫu 01', collaboratorId: 'collab2', collaboratorName: 'CTV Trần', month: '2026-05', revenue: 18000000, bookingsCount: 6, nights: 12 },
  
  // Căn hộ Mẫu 02
  { id: '7', apartmentId: '2', apartmentName: 'Căn hộ Mẫu 02', collaboratorId: 'collab1', collaboratorName: 'CTV Nguyễn', month: '2026-03', revenue: 10000000, bookingsCount: 4, nights: 8 },
  { id: '8', apartmentId: '2', apartmentName: 'Căn hộ Mẫu 02', collaboratorId: 'collab2', collaboratorName: 'CTV Trần', month: '2026-03', revenue: 12000000, bookingsCount: 5, nights: 10 },
  { id: '9', apartmentId: '2', apartmentName: 'Căn hộ Mẫu 02', collaboratorId: 'collab1', collaboratorName: 'CTV Nguyễn', month: '2026-04', revenue: 18000000, bookingsCount: 7, nights: 14 },
  { id: '10', apartmentId: '2', apartmentName: 'Căn hộ Mẫu 02', collaboratorId: 'collab2', collaboratorName: 'CTV Trần', month: '2026-04', revenue: 16000000, bookingsCount: 6, nights: 12 },
  { id: '11', apartmentId: '2', apartmentName: 'Căn hộ Mẫu 02', collaboratorId: 'collab1', collaboratorName: 'CTV Nguyễn', month: '2026-05', revenue: 28000000, bookingsCount: 10, nights: 20 },
  { id: '12', apartmentId: '2', apartmentName: 'Căn hộ Mẫu 02', collaboratorId: 'collab2', collaboratorName: 'CTV Trần', month: '2026-05', revenue: 25000000, bookingsCount: 9, nights: 18 },
]

export default function ReportsPage() {
  const [selectedApartment, setSelectedApartment] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedCollaborator, setSelectedCollaborator] = useState('all')

  // Available Filter Options
  const apartments = useMemo(() => {
    const list = new Set(mockBookingsData.map(d => d.apartmentName))
    return ['all', ...Array.from(list)]
  }, [])

  const months = useMemo(() => {
    const list = new Set(mockBookingsData.map(d => d.month))
    return ['all', ...Array.from(list).sort()]
  }, [])

  const collaborators = useMemo(() => {
    const list = new Set(mockBookingsData.map(d => d.collaboratorName))
    return ['all', ...Array.from(list)]
  }, [])

  // Filtered Data
  const filteredData = useMemo(() => {
    return mockBookingsData.filter(d => {
      const matchApartment = selectedApartment === 'all' || d.apartmentName === selectedApartment
      const matchMonth = selectedMonth === 'all' || d.month === selectedMonth
      const matchCollab = selectedCollaborator === 'all' || d.collaboratorName === selectedCollaborator
      return matchApartment && matchMonth && matchCollab
    })
  }, [selectedApartment, selectedMonth, selectedCollaborator])

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0
    let totalBookings = 0
    let totalNights = 0

    filteredData.forEach(d => {
      totalRevenue += d.revenue
      totalBookings += d.bookingsCount
      totalNights += d.nights
    })

    const averagePrice = totalNights > 0 ? totalRevenue / totalNights : 0
    // Assume max capacity is 30 nights per month per apartment * total active apartments
    const activeApartmentsCount = selectedApartment === 'all' ? 2 : 1
    const activeMonthsCount = selectedMonth === 'all' ? 3 : 1
    const totalPossibleNights = activeApartmentsCount * activeMonthsCount * 30
    const occupancyRate = totalPossibleNights > 0 ? (totalNights / totalPossibleNights) * 100 : 0

    return {
      totalRevenue,
      totalBookings,
      totalNights,
      averagePrice,
      occupancyRate
    }
  }, [filteredData, selectedApartment, selectedMonth])

  // Custom Chart Data: Monthly Revenue
  const chartMonthlyData = useMemo(() => {
    const monthlyMap: Record<string, number> = {}
    filteredData.forEach(d => {
      monthlyMap[d.month] = (monthlyMap[d.month] || 0) + d.revenue
    })

    return Object.entries(monthlyMap).map(([month, revenue]) => ({
      label: month === '2026-03' ? 'Tháng 3' : month === '2026-04' ? 'Tháng 4' : 'Tháng 5',
      value: revenue
    })).sort((a, b) => a.label.localeCompare(b.label))
  }, [filteredData])

  // Custom Chart Data: Collaborator Sales
  const chartCollabData = useMemo(() => {
    const collabMap: Record<string, number> = {}
    filteredData.forEach(d => {
      collabMap[d.collaboratorName] = (collabMap[d.collaboratorName] || 0) + d.revenue
    })

    return Object.entries(collabMap).map(([name, revenue]) => ({
      label: name,
      value: revenue
    }))
  }, [filteredData])

  // Custom Chart Data: Apartment Sales Share
  const chartApartmentData = useMemo(() => {
    const apartMap: Record<string, number> = {}
    filteredData.forEach(d => {
      apartMap[d.apartmentName] = (apartMap[d.apartmentName] || 0) + d.revenue
    })

    return Object.entries(apartMap).map(([name, revenue]) => ({
      label: name,
      value: revenue
    }))
  }, [filteredData])

  // Export handler
  const handleExportExcel = () => {
    toast.success('Báo cáo Excel đã được tải xuống thành công!')
  }

  // Helper formatting values
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Báo cáo Doanh thu</h2>
          <p className="text-muted-foreground">Thống kê chi tiết doanh số căn hộ và hiệu suất bán hàng của CTV.</p>
        </div>
        <Button onClick={handleExportExcel} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <FileDown className="h-4 w-4" /> Xuất Excel
        </Button>
      </div>

      {/* Filters Block */}
      <Card className="border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Apartment Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Căn hộ</label>
              <Select value={selectedApartment} onValueChange={(val) => setSelectedApartment(val || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả căn hộ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả căn hộ</SelectItem>
                  {apartments.filter(a => a !== 'all').map(a => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tháng</label>
              <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thời gian</SelectItem>
                  {months.filter(m => m !== 'all').map(m => (
                    <SelectItem key={m} value={m}>Tháng {m.substring(5)}/{m.substring(0, 4)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Collaborator Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cộng tác viên</label>
              <Select value={selectedCollaborator} onValueChange={(val) => setSelectedCollaborator(val || 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả CTV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả CTV</SelectItem>
                  {collaborators.filter(c => c !== 'all').map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <Card className="bg-sky-50/50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Tổng doanh thu</span>
              <TrendingUp className="h-4 w-4 text-sky-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-sky-700 dark:text-sky-400">
                {formatVND(metrics.totalRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Lượt Booking */}
        <Card className="bg-violet-50/50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Tổng lượt Booking</span>
              <Calendar className="h-4 w-4 text-violet-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-violet-700 dark:text-violet-400">
                {metrics.totalBookings} lượt
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Công suất phòng */}
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Công suất phòng</span>
              <Building2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                {metrics.occupancyRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Giá trị trung bình/đêm */}
        <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Doanh thu trung bình/đêm</span>
              <Users className="h-4 w-4 text-orange-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold tracking-tight text-orange-700 dark:text-orange-400">
                {formatVND(metrics.averagePrice)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Doanh thu theo tháng */}
        <Card className="lg:col-span-2 border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Xu hướng doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {chartMonthlyData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu
              </div>
            ) : (
              <div className="h-[250px] w-full flex items-end justify-between px-6 pt-6">
                {chartMonthlyData.map((d, index) => {
                  const maxVal = Math.max(...chartMonthlyData.map(item => item.value))
                  const percentHeight = maxVal > 0 ? (d.value / maxVal) * 100 : 0
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                      <div className="w-full flex justify-center mb-2">
                        <span className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded transition duration-200">
                          {formatVND(d.value)}
                        </span>
                      </div>
                      <div className="w-16 bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-lg transition-all duration-500 ease-out hover:brightness-110" style={{ height: `${Math.max(percentHeight * 1.8, 10)}px` }} />
                      <span className="text-xs font-semibold mt-3 text-muted-foreground">{d.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Tỉ lệ đóng góp của căn hộ */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Cơ cấu doanh thu theo căn hộ</CardTitle>
          </CardHeader>
          <CardContent>
            {chartApartmentData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] space-y-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  {/* Clean SVG Circle representation */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    {(() => {
                      const total = chartApartmentData.reduce((acc, curr) => acc + curr.value, 0)
                      let accumulatedPercent = 0
                      const colors = ["#0284c7", "#f43f5e"] // Sky and Rose
                      
                      return chartApartmentData.map((d, index) => {
                        const percent = total > 0 ? (d.value / total) * 100 : 0
                        const strokeDasharray = `${percent} ${100 - percent}`
                        const strokeDashoffset = 100 - accumulatedPercent
                        accumulatedPercent += percent
                        
                        return (
                          <circle
                            key={index}
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="none"
                            stroke={colors[index % colors.length]}
                            strokeWidth="3.2"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                          />
                        )
                      })
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground">Tỉ lệ</span>
                    <span className="text-base font-bold text-slate-800 dark:text-zinc-200">Doanh số</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 w-full text-xs">
                  {chartApartmentData.map((d, index) => {
                    const total = chartApartmentData.reduce((acc, curr) => acc + curr.value, 0)
                    const percent = total > 0 ? (d.value / total) * 100 : 0
                    const colors = ["bg-sky-600", "bg-rose-500"]
                    
                    return (
                      <div key={index} className="flex items-center gap-1.5 font-medium text-muted-foreground">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[index % colors.length]}`} />
                        <span>{d.label} ({percent.toFixed(0)}%)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart 3: Doanh số CTV */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Doanh số theo Cộng tác viên</CardTitle>
        </CardHeader>
        <CardContent>
          {chartCollabData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Không có dữ liệu
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {chartCollabData.map((d, index) => {
                const total = chartCollabData.reduce((acc, curr) => acc + curr.value, 0)
                const percent = total > 0 ? (d.value / total) * 100 : 0
                const colors = ["from-violet-600 to-violet-400", "from-orange-500 to-orange-400"]
                
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-800 dark:text-zinc-200">{d.label}</span>
                      <span className="text-muted-foreground">{formatVND(d.value)} ({percent.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-700 ease-out`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Stat Breakdown Table */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Bảng thống kê chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-zinc-900">
                <TableRow>
                  <TableHead className="font-semibold">Tháng</TableHead>
                  <TableHead className="font-semibold">Căn hộ</TableHead>
                  <TableHead className="font-semibold">Cộng tác viên</TableHead>
                  <TableHead className="font-semibold text-center">Số booking</TableHead>
                  <TableHead className="font-semibold text-center">Số đêm</TableHead>
                  <TableHead className="font-semibold text-right">Doanh thu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Không có bản ghi nào tương ứng với bộ lọc.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-sky-600 dark:text-sky-400">
                        Tháng {d.month.substring(5)}/{d.month.substring(0, 4)}
                      </TableCell>
                      <TableCell className="font-medium">{d.apartmentName}</TableCell>
                      <TableCell className="font-medium text-slate-800 dark:text-zinc-300">{d.collaboratorName}</TableCell>
                      <TableCell className="text-center font-semibold">{d.bookingsCount} lượt</TableCell>
                      <TableCell className="text-center font-semibold">{d.nights} đêm</TableCell>
                      <TableCell className="text-right font-bold text-slate-900 dark:text-zinc-100">
                        {formatVND(d.revenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
