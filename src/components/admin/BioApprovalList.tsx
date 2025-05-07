
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";

export function BioApprovalList() {
  const { toast } = useToast();
  const [pendingBios, setPendingBios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPendingBios = async () => {
      try {
        setLoading(true);
        
        // Get all pending bio update requests
        const { data, error } = await supabase
          .from('verification_requests')
          .select(`
            id,
            user_id,
            created_at,
            users (
              id,
              nickname,
              bio
            )
          `)
          .eq('type', 'bio_update')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPendingBios(data || []);
      } catch (error) {
        console.error("Error fetching pending bio approvals:", error);
        toast({
          title: "Error",
          description: "Failed to load pending bio approvals",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingBios();
    
    // Set up a subscription for real-time updates
    const channel = supabase
      .channel('verification_requests_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'verification_requests',
        filter: 'type=eq.bio_update'
      }, () => {
        fetchPendingBios();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleApprove = async (requestId: string, userId: string) => {
    setProcessingIds(prev => ({ ...prev, [requestId]: true }));
    
    try {
      // Update the verification request
      const { error } = await supabase
        .from('verification_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Create notification for user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'bio_approved',
          title: '자기소개 승인 완료',
          body: '회원님의 자기소개가 승인되었습니다.',
          is_read: false
        });
        
      if (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
      
      // Update local state
      setPendingBios(prev => prev.filter(item => item.id !== requestId));
      
      toast({
        title: "Approved",
        description: "Bio has been approved successfully",
      });
    } catch (error) {
      console.error("Error approving bio:", error);
      toast({
        title: "Error",
        description: "Failed to approve bio",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId: string, userId: string) => {
    setProcessingIds(prev => ({ ...prev, [requestId]: true }));
    
    try {
      // Update the verification request
      const { error } = await supabase
        .from('verification_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Create notification for user
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'bio_rejected',
          title: '자기소개 반려됨',
          body: '회원님의 자기소개가 반려되었습니다. 내용을 수정하여 다시 제출해주세요.',
          is_read: false
        });
        
      if (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
      
      // Update local state
      setPendingBios(prev => prev.filter(item => item.id !== requestId));
      
      toast({
        title: "Rejected",
        description: "Bio has been rejected",
      });
    } catch (error) {
      console.error("Error rejecting bio:", error);
      toast({
        title: "Error",
        description: "Failed to reject bio",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => ({ ...prev, [requestId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pendingBios.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No pending bio approvals</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingBios.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Bio Update from {request.users?.nickname || 'Unknown User'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-1">Bio Content:</h3>
              <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                {request.users?.bio || 'No content'}
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(request.id, request.user_id)}
                disabled={processingIds[request.id]}
                className="flex items-center"
              >
                {processingIds[request.id] ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <X className="mr-1 h-3 w-3" />
                )}
                Reject
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleApprove(request.id, request.user_id)}
                disabled={processingIds[request.id]}
                className="flex items-center"
              >
                {processingIds[request.id] ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Check className="mr-1 h-3 w-3" />
                )}
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
