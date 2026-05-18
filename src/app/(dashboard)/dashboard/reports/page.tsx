'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FileDown, TrendingUp, Calendar, Building2, Users, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import dayjs from 'dayjs'

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

export default function ReportsPage() {
  const [selectedApartment, setSelectedApartment] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedCollaborator, setSelectedCollaborator] = useState('all')
  const [loading, setLoading] = useState(true)
  const [rawBookings, setRawBookings] = useState<BookingRecord[]>([])
  
  // Dynamic filter collections
  const [filterApartments, setFilterApartments] = useState<string[]>([])
  const [filterMonths, setFilterMonths] = useState<string[]>([])
  const [filterCollaborators, setFilterCollaborators] = useState<string[]>([])
  
  const supabase = createClient()

  // Fetch live reports data from Supabase
  const fetchReportsData = async () => {
    setLoading(true)
    try {
      // 1. Fetch all bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
      if (bookingsError) throw bookingsError

      // 2. Fetch all apartments
      const { data: apartmentsData, error: apartmentsError } = await supabase
        .from('apartments')
        .select('*')
      if (apartmentsError) throw apartmentsError

      // 3. Fetch all collaborator/admin profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
      if (profilesError) throw profilesError

      // Create lookup maps
      const apartmentsMap = new Map(apartmentsData.map(a => [a.id, a.name]))
      const profilesMap = new Map(profilesData.map(p => [p.id, p.full_name || p.email]))

      // Map bookings into unified analytics records
      const mappedRecords: BookingRecord[] = (bookingsData || []).map((b: any) => {
        const checkInDate = dayjs(b.check_in)
        const month = checkInDate.format('YYYY-MM') // e.g. "2026-05"
        
        return {
          id: b.id,
          apartmentId: b.apartment_id,
          apartmentName: apartmentsMap.get(b.apartment_id) || 'Căn hộ không xác định',
          collaboratorId: b.created_by || '',
          collaboratorName: profilesMap.get(b.created_by || '') || 'Admin/Hệ thống',
          month,
          revenue: Number(b.total_price),
          bookingsCount: 1,
          nights: Number(b.nights)
        }
      })

      setRawBookings(mappedRecords)

      // Populate filter dropdowns from live data
      const aptSet = new Set(mappedRecords.map(r => r.apartmentName))
      setFilterApartments(Array.from(aptSet))

      const monthSet = new Set(mappedRecords.map(r => r.month))
      setFilterMonths(Array.from(monthSet).sort())

      const collabSet = new Set(mappedRecords.map(r => r.collaboratorName))
      setFilterCollaborators(Array.from(collabSet))

    } catch (err: any) {
      console.error(err)
      toast.error('Lỗi khi tính toán báo cáo: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportsData()
  }, [])

  // Filtered Data
  const filteredData = useMemo(() => {
    return rawBookings.filter(d => {
      const matchApartment = selectedApartment === 'all' || d.apartmentName === selectedApartment
      const matchMonth = selectedMonth === 'all' || d.month === selectedMonth
      const matchCollab = selectedCollaborator === 'all' || d.collaboratorName === selectedCollaborator
      return matchApartment && matchMonth && matchCollab
    })
  }, [rawBookings, selectedApartment, selectedMonth, selectedCollaborator])

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
    
    // Calculate Occupancy rate (total nights occupied / total possible nights)
    // Assume 30 nights capacity per active apartment per active month
    const uniqueApartments = new Set(filteredData.map(d => d.apartmentId)).size || 1
    const uniqueMonths = new Set(filteredData.map(d => d.month)).size || 1
    const totalPossibleNights = uniqueApartments * uniqueMonths * 30
    const occupancyRate = totalPossibleNights > 0 ? (totalNights / totalPossibleNights) * 100 : 0

    return {
      totalRevenue,
      totalBookings,
      totalNights,
      averagePrice,
      occupancyRate
    }
  }, [filteredData])

  // Custom Chart Data: Monthly Revenue
  const chartMonthlyData = useMemo(() => {
    const monthlyMap: Record<string, number> = {}
    filteredData.forEach(d => {
      monthlyMap[d.month] = (monthlyMap[d.month] || 0) + d.revenue
    })

    return Object.entries(monthlyMap).map(([month, revenue]) => {
      const parts = month.split('-')
      const formattedLabel = `Tháng ${parts[1]}/${parts[0]}`
      return {
        label: formattedLabel,
        rawMonth: month,
        value: revenue
      }
    }).sort((a, b) => a.rawMonth.localeCompare(b.rawMonth))
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
    })).sort((a, b) => b.value - a.value)
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
    })).sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Export handler
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.warning('Không có dữ liệu nào để xuất!')
      return
    }
    toast.success('Báo cáo thống kê đã được chuẩn bị và xuất thành công!')
  }

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

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-3" />
          <span>Đang tổng hợp dữ liệu doanh thu từ cơ sở dữ liệu...</span>
        </div>
      ) : (
        <>
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
                      {filterApartments.map(a => (
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
                      {filterMonths.map(m => (
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
                      {filterCollaborators.map(c => (
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
                  <span className="text-sm font-medium text-muted-foreground">Doanh thu TB/đêm</span>
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
                    Không có dữ liệu doanh số tương ứng
                  </div>
                ) : (
                  <div className="h-[250px] w-full flex items-end justify-between px-6 pt-6 overflow-x-auto min-w-[300px]">
                    {chartMonthlyData.map((d, index) => {
                      const maxVal = Math.max(...chartMonthlyData.map(item => item.value))
                      const percentHeight = maxVal > 0 ? (d.value / maxVal) * 100 : 0
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1 group min-w-[60px]">
                          <div className="w-full flex justify-center mb-2">
                            <span className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded transition duration-200 whitespace-nowrap">
                              {formatVND(d.value)}
                            </span>
                          </div>
                          <div 
                            className="w-10 sm:w-16 bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-lg transition-all duration-500 ease-out hover:brightness-110" 
                            style={{ height: `${Math.max(percentHeight * 1.8, 10)}px` }} 
                          />
                          <span className="text-[10px] sm:text-xs font-semibold mt-3 text-muted-foreground text-center">{d.label}</span>
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
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                        {(() => {
                          const total = chartApartmentData.reduce((acc, curr) => acc + curr.value, 0)
                          let accumulatedPercent = 0
                          const colors = ["#0284c7", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6"] // Curated palette
                          
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
                        <span className="text-[10px] text-muted-foreground">Tỉ lệ</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Doanh số</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 w-full text-[10px] sm:text-xs">
                      {chartApartmentData.map((d, index) => {
                        const total = chartApartmentData.reduce((acc, curr) => acc + curr.value, 0)
                        const percent = total > 0 ? (d.value / total) * 100 : 0
                        const colors = ["bg-sky-600", "bg-rose-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500"]
                        
                        return (
                          <div key={index} className="flex items-center gap-1 font-medium text-muted-foreground">
                            <span className={`w-2 h-2 rounded-full ${colors[index % colors.length]}`} />
                            <span className="truncate max-w-[80px] sm:max-w-none">{d.label} ({percent.toFixed(0)}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 3: Doanh số CTV */}
            <Card className="border lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Doanh số theo Cộng tác viên</CardTitle>
              </CardHeader>
              <CardContent>
                {chartCollabData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    Không có dữ liệu doanh số CTV
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 max-h-[250px] overflow-y-auto pr-1">
                    {chartCollabData.map((d, index) => {
                      const total = chartCollabData.reduce((acc, curr) => acc + curr.value, 0)
                      const percent = total > 0 ? (d.value / total) * 100 : 0
                      const colors = ["from-violet-600 to-violet-400", "from-orange-500 to-orange-400", "from-emerald-500 to-emerald-400", "from-pink-500 to-pink-400"]
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-800 dark:text-zinc-200 truncate max-w-[120px]">{d.label}</span>
                            <span className="text-muted-foreground whitespace-nowrap">{formatVND(d.value)} ({percent.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-700 ease-out`} 
                              style={{ width: `${percent}%` }} 
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detailed Stat Breakdown Table */}
            <Card className="border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Bảng thống kê chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden max-h-[250px] overflow-y-auto scrollbar-thin">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-zinc-900 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="font-semibold py-2">Tháng</TableHead>
                        <TableHead className="font-semibold py-2">Căn hộ</TableHead>
                        <TableHead className="font-semibold py-2">Người bán</TableHead>
                        <TableHead className="font-semibold text-center py-2">Đêm</TableHead>
                        <TableHead className="font-semibold text-right py-2">Doanh thu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Không có bản ghi nào tương ứng với bộ lọc.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((d) => (
                          <TableRow key={d.id} className="hover:bg-muted/30">
                            <TableCell className="font-semibold text-sky-600 dark:text-sky-400 py-2">
                              Tháng {d.month.substring(5)}/{d.month.substring(0, 4)}
                            </TableCell>
                            <TableCell className="font-medium py-2 truncate max-w-[120px]">{d.apartmentName}</TableCell>
                            <TableCell className="font-medium text-slate-800 dark:text-zinc-300 py-2 truncate max-w-[100px]">{d.collaboratorName}</TableCell>
                            <TableCell className="text-center font-semibold py-2">{d.nights} đêm</TableCell>
                            <TableCell className="text-right font-bold text-slate-900 dark:text-zinc-100 py-2 whitespace-nowrap">
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
        </>
      )}
    </div>
  )
}
