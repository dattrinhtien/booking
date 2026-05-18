'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import { createClient } from '@/lib/supabase/client'
import { bookingSchema, type BookingFormValues } from '@/lib/validations'
import { BOOKING_STATUS } from '@/lib/constants'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Camera, Upload, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingFormProps {
  initialDate: { start: Date; end: Date } | null;
  bookingId: string | null;
  onSuccess: () => void;
}

export function BookingForm({ initialDate, bookingId, onSuccess }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [apartmentsList, setApartmentsList] = useState<any[]>([])
  
  // Camera state
  const [showCamera, setShowCamera] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guest_name: '',
      guest_phone: '',
      guest_id_card: '',
      check_in: initialDate?.start || new Date(),
      check_out: initialDate?.end || dayjs().add(1, 'day').toDate(),
      price_per_night: 1000000,
      status: BOOKING_STATUS.HOLDING,
      notes: '',
      apartment_id: '',
      id_card_url: '',
    },
  })

  // 1. Fetch apartments and set default
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const { data, error } = await supabase.from('apartments').select('*')
        if (!error && data && data.length > 0) {
          setApartmentsList(data)
          if (!bookingId) {
            form.setValue('apartment_id', data[0].id)
          }
        } else {
          // If no apartments exist, auto-create a default one
          const { data: newApartment, error: createError } = await supabase
            .from('apartments')
            .insert({
              name: 'Căn hộ Mẫu 01',
              address: '123 Đường Bao Biển, Hạ Long',
              max_guests: 4,
              base_price: 1000000
            })
            .select()
            .single()
          
          if (!createError && newApartment) {
            setApartmentsList([newApartment])
            if (!bookingId) {
              form.setValue('apartment_id', newApartment.id)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching apartments: ", err)
      }
    }
    fetchApartments()
  }, [bookingId])

  // 2. Fetch booking details for Edit mode
  useEffect(() => {
    if (bookingId) {
      const fetchBooking = async () => {
        setIsLoading(true)
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()
            
          if (error) throw error
          if (data) {
            form.reset({
              guest_name: data.guest_name,
              guest_phone: data.guest_phone || '',
              guest_id_card: data.guest_id_card || '',
              check_in: new Date(data.check_in),
              check_out: new Date(data.check_out),
              price_per_night: Number(data.price_per_night),
              status: data.status as any,
              notes: data.notes || '',
              apartment_id: data.apartment_id,
              id_card_url: data.id_card_url || '',
            })
            if (data.id_card_url) {
              setPhotoPreview(data.id_card_url)
            }
          }
        } catch (err: any) {
          toast.error('Lỗi khi tải thông tin booking: ' + err.message)
        } finally {
          setIsLoading(false)
        }
      }
      fetchBooking()
    }
  }, [bookingId])

  // Watch for dates and price to auto-calculate nights and total
  const watchCheckIn = form.watch('check_in')
  const watchCheckOut = form.watch('check_out')
  const watchPrice = form.watch('price_per_night')

  const nights = dayjs(watchCheckOut).diff(dayjs(watchCheckIn), 'day')
  const totalPrice = nights > 0 ? nights * watchPrice : 0

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        form.setValue('id_card_url', base64String)
        setPhotoPreview(base64String)
        
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}.${fileExt}`
          const filePath = `id-cards/${fileName}`

          const { error } = await supabase.storage
            .from('bookings')
            .upload(filePath, file)

          if (!error) {
            const { data: { publicUrl } } = supabase.storage
              .from('bookings')
              .getPublicUrl(filePath)
            form.setValue('id_card_url', publicUrl)
          }
        } catch (storageError) {
          console.warn("Storage upload skipped, using base64 fallback.")
        }

        toast.success('Tải ảnh CCCD thành công')
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      toast.error('Lỗi khi tải ảnh: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // Camera Handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setVideoStream(stream)
      setShowCamera(true)
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (err) {
      toast.error('Không thể mở camera. Vui lòng cấp quyền hoặc tải ảnh lên.')
    }
  }

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(videoRef.current, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')
      
      form.setValue('id_card_url', dataUrl)
      setPhotoPreview(dataUrl)
      stopCamera()
      toast.success('Chụp ảnh CCCD thành công')
    }
  }

  const removePhoto = () => {
    form.setValue('id_card_url', '')
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.info('Đã gỡ ảnh CCCD')
  }

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [videoStream])

  // Save Booking Submit Handler
  async function onSubmit(data: BookingFormValues) {
    setIsLoading(true)
    try {
      // Get current logged-in user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Chưa đăng nhập! Vui lòng đăng nhập lại.")

      const checkInStr = dayjs(data.check_in).format('YYYY-MM-DD')
      const checkOutStr = dayjs(data.check_out).format('YYYY-MM-DD')

      if (bookingId) {
        // --- EDIT EXISTING BOOKING ---
        // 1. Rollback support: Fetch original booking days
        const { data: originalDays } = await supabase.from('booking_days').select().eq('booking_id', bookingId)
        
        // 2. Remove old days
        await supabase.from('booking_days').delete().eq('booking_id', bookingId)
        
        // 3. Attempt insert new days
        const daysToInsert = []
        let current = dayjs(data.check_in)
        const end = dayjs(data.check_out)
        while (current.isBefore(end, 'day')) {
          daysToInsert.push({
            booking_id: bookingId,
            apartment_id: data.apartment_id,
            day: current.format('YYYY-MM-DD'),
            status: data.status === 'booked' ? 'booked' : 'holding'
          })
          current = current.add(1, 'day')
        }

        const { error: daysError } = await supabase.from('booking_days').insert(daysToInsert)
        if (daysError) {
          // Restore original days on duplicate conflict
          if (originalDays && originalDays.length > 0) {
            await supabase.from('booking_days').insert(originalDays.map(od => ({
              booking_id: od.booking_id,
              apartment_id: od.apartment_id,
              day: od.day,
              status: od.status
            })))
          }
          if (daysError.code === '23505') {
            throw new Error('Trùng lịch! Căn hộ đã có người đặt trong những ngày này.')
          }
          throw daysError
        }

        // 4. Update booking row
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            guest_name: data.guest_name,
            guest_phone: data.guest_phone,
            guest_id_card: data.guest_id_card,
            check_in: checkInStr,
            check_out: checkOutStr,
            nights,
            price_per_night: data.price_per_night,
            total_price: totalPrice,
            status: data.status,
            notes: data.notes,
            id_card_url: data.id_card_url,
            apartment_id: data.apartment_id
          })
          .eq('id', bookingId)

        if (bookingError) throw bookingError
        toast.success('Cập nhật booking thành công!')

      } else {
        // --- INSERT NEW BOOKING ---
        // 1. Create booking entry
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert({
            apartment_id: data.apartment_id,
            created_by: user.id,
            guest_name: data.guest_name,
            guest_phone: data.guest_phone,
            guest_id_card: data.guest_id_card,
            check_in: checkInStr,
            check_out: checkOutStr,
            nights,
            price_per_night: data.price_per_night,
            total_price: totalPrice,
            status: data.status,
            notes: data.notes,
            id_card_url: data.id_card_url
          })
          .select()
          .single()

        if (bookingError) throw bookingError

        // 2. Create calendar blocking booking_days entries
        const daysToInsert = []
        let current = dayjs(data.check_in)
        const end = dayjs(data.check_out)
        while (current.isBefore(end, 'day')) {
          daysToInsert.push({
            booking_id: booking.id,
            apartment_id: data.apartment_id,
            day: current.format('YYYY-MM-DD'),
            status: data.status === 'booked' ? 'booked' : 'holding'
          })
          current = current.add(1, 'day')
        }

        const { error: daysError } = await supabase.from('booking_days').insert(daysToInsert)
        if (daysError) {
          // Delete booking row to maintain integrity if days insert fails
          await supabase.from('bookings').delete().eq('id', booking.id)
          if (daysError.code === '23505') {
            throw new Error('Trùng lịch! Căn hộ đã có người đặt trong những ngày này.')
          }
          throw daysError
        }

        toast.success('Tạo đặt phòng mới thành công!')
      }
      onSuccess()
    } catch (error: any) {
      toast.error('Lỗi khi lưu booking: ' + error.message)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Guest name and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="guest_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên khách hàng *</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="guest_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="0987654321" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: CCCD/ID Card and Upload ID Photo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="guest_id_card"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số Căn cước công dân (CCCD)</FormLabel>
                <FormControl>
                  <Input placeholder="001202000123" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col space-y-2">
            <FormLabel>Tải ảnh / Chụp ảnh CCCD</FormLabel>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
                disabled={isLoading || isUploading}
              />
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Tải ảnh lên
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-2"
                onClick={showCamera ? stopCamera : startCamera}
                disabled={isLoading || isUploading}
              >
                <Camera className="h-4 w-4" />
                {showCamera ? 'Đóng camera' : 'Chụp ảnh'}
              </Button>
            </div>
          </div>
        </div>

        {/* Camera capture screen */}
        {showCamera && (
          <div className="relative rounded-lg overflow-hidden border bg-black aspect-video flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              id="camera-video"
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 flex gap-2">
              <Button type="button" onClick={capturePhoto} className="bg-sky-600 hover:bg-sky-700">
                Chụp ảnh
              </Button>
              <Button type="button" variant="secondary" onClick={stopCamera}>
                Đóng
              </Button>
            </div>
          </div>
        )}

        {/* Photo Preview */}
        {photoPreview && !showCamera && (
          <div className="relative border rounded-lg p-2 flex items-center justify-between bg-slate-50 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="h-16 w-24 rounded overflow-hidden border relative bg-zinc-200">
                <img src={photoPreview} alt="CCCD Preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
                  ✓ Đã đính kèm ảnh CCCD
                </p>
                <p className="text-[10px] text-muted-foreground">Kích thước ảnh hoàn hảo cho lưu trữ</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={removePhoto}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Apartment Selection Dropdown */}
        <FormField
          control={form.control}
          name="apartment_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Căn hộ đặt chỗ *</FormLabel>
              <Select 
                onValueChange={(val) => field.onChange(val || '')} 
                value={field.value} 
                disabled={isLoading || apartmentsList.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <span className="text-sm font-medium">
                      {apartmentsList.find(apt => apt.id === field.value)?.name || "Chọn căn hộ"}
                    </span>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {apartmentsList.map(apt => (
                    <SelectItem key={apt.id} value={apt.id}>{apt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 3: Check-in and Check-out */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="check_in"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày Check-in *</FormLabel>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full pl-3 text-left font-normal flex items-center justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {field.value ? (
                      dayjs(field.value).format("DD/MM/YYYY")
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="check_out"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày Check-out *</FormLabel>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full pl-3 text-left font-normal flex items-center justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    {field.value ? (
                      dayjs(field.value).format("DD/MM/YYYY")
                    ) : (
                      <span>Chọn ngày</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date <= watchCheckIn}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Nights & total price summary card */}
        <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-lg flex justify-between items-center border">
          <div>
            <p className="text-sm text-muted-foreground">Số đêm lưu trú</p>
            <p className="text-xl font-bold">{nights > 0 ? nights : 0} đêm</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Tổng tiền (VNĐ)</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {new Intl.NumberFormat('vi-VN').format(totalPrice)}
            </p>
          </div>
        </div>

        {/* Row 4: Price per night & status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price_per_night"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá mỗi đêm (VNĐ)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                    disabled={isLoading} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <span className="text-sm font-medium">
                        {field.value === BOOKING_STATUS.BOOKED ? "Đã cọc/Thanh toán" : "Giữ phòng"}
                      </span>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={BOOKING_STATUS.HOLDING}>Giữ phòng</SelectItem>
                    <SelectItem value={BOOKING_STATUS.BOOKED}>Đã cọc/Thanh toán</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ghi chú */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Yêu cầu đặc biệt..." 
                  className="resize-none h-16" 
                  {...field} 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : 'Lưu Booking'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
