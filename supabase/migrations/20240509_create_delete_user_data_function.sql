CREATE OR REPLACE FUNCTION public.delete_user_data(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_error_message TEXT;
BEGIN
  -- 트랜잭션 시작
  BEGIN
    -- 프로필 사진 삭제
    DELETE FROM profile_photos WHERE user_id = $1;
    
    -- 매칭 데이터 삭제
    DELETE FROM matches WHERE user1_id = $1 OR user2_id = $1;
    
    -- 채팅 메시지 삭제
    DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1;
    
    -- 알림 삭제
    DELETE FROM notifications WHERE user_id = $1 OR sender_id = $1;
    
    -- 인증 요청 삭제
    DELETE FROM verification_requests WHERE user_id = $1;
    
    -- 신분증 인증 삭제
    DELETE FROM identity_verifications WHERE user_id = $1;
    
    -- 사용자 관심사 삭제
    DELETE FROM user_interests WHERE user_id = $1;
    
    -- 사용자 국적 삭제
    DELETE FROM user_nationalities WHERE user_id = $1;
    
    -- 마지막으로 사용자 프로필 삭제
    DELETE FROM users WHERE id = $1;
    
    -- 트랜잭션 커밋
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      -- 오류 발생 시 롤백
      ROLLBACK;
      v_error_message := 'Error deleting user data: ' || SQLERRM;
      RAISE EXCEPTION '%', v_error_message;
  END;
END;
$$; 