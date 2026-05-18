import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ApartmentsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Căn hộ</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm Căn hộ
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Căn hộ Mẫu 01</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Địa chỉ:</span> 123 Đường Bao Biển, Hạ Long</p>
              <p><span className="font-semibold">Sức chứa:</span> 4 khách</p>
              <p><span className="font-semibold">Giá cơ bản:</span> 1,000,000 đ/đêm</p>
              <div className="pt-4 flex gap-2">
                <Button variant="outline" size="sm">Sửa</Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">Xóa</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
