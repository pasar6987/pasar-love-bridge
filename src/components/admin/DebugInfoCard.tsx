
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";

interface DebugInfoCardProps {
  user: User | null;
  isAdmin: boolean;
  adminCheckComplete: boolean;
  loading: boolean;
}

export const DebugInfoCard = ({ user, isAdmin, adminCheckComplete, loading }: DebugInfoCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>디버깅 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>키</TableHead>
              <TableHead>값</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>사용자 ID</TableCell>
              <TableCell>{user?.id || '없음'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>관리자 상태</TableCell>
              <TableCell>{isAdmin ? '관리자임' : '관리자 아님'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>관리자 확인 완료</TableCell>
              <TableCell>{adminCheckComplete ? '완료' : '진행 중'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>로딩 상태</TableCell>
              <TableCell>{loading ? '로딩 중' : '로딩 완료'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
