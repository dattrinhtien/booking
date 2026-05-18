import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const mockCollaborators = [
  { id: '1', email: 'collab1@example.com', name: 'CTV Nguyễn', active: true },
  { id: '2', email: 'collab2@example.com', name: 'CTV Trần', active: false },
]

export default function CollaboratorsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cộng tác viên</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm CTV
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCollaborators.map((collab) => (
                <TableRow key={collab.id}>
                  <TableCell className="font-medium">{collab.name}</TableCell>
                  <TableCell>{collab.email}</TableCell>
                  <TableCell>
                    {collab.active ? (
                      <Badge className="bg-green-500">Hoạt động</Badge>
                    ) : (
                      <Badge variant="secondary">Đã khóa</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Sửa</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
