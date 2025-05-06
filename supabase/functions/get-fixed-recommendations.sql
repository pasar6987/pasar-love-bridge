
-- Fixed function to properly qualify the nationality column references
CREATE OR REPLACE FUNCTION public.get_recommended_profiles_by_nationality_fixed(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age INT,
  location TEXT,
  photo TEXT,
  bio TEXT,
  job TEXT,
  nationality TEXT
)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  user_nationality TEXT;
BEGIN
  -- Get the user's nationality - explicitly qualify the column
  SELECT un.nationality INTO user_nationality 
  FROM user_nationalities un
  WHERE un.user_id = p_user_id
  LIMIT 1;

  -- If we can't determine the user's nationality, default to Japanese
  IF user_nationality IS NULL THEN
    user_nationality := 'ja';
  END IF;
  
  -- For now, return some mock data filtered by nationality
  -- In a real implementation, this would query profiles from a real table
  RETURN QUERY
  WITH recommended_profiles AS (
    SELECT 
      gen_random_uuid() as id,
      profile_data.name,
      profile_data.age,
      profile_data.location,
      profile_data.photo,
      profile_data.bio,
      profile_data.job,
      profile_data.nationality
    FROM (
      VALUES
        ('花子', 28, '東京', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60', 'こんにちは！東京に住んでいる花子です。韓国の文化とK-Popに興味があります。', 'デザイナー', 'ja'),
        ('ゆか', 25, '大阪', 'https://images.unsplash.com/photo-1606406054219-619c4c2e2100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60', '大阪でカフェを経営しています。趣味は旅行と写真撮影です。韓国語を勉強中です！', 'カフェオーナー', 'ja'),
        ('まい', 27, '福岡', 'https://images.unsplash.com/photo-1609132718484-cc90df3417f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60', '音楽を愛する教師です。韓国ドラマが好きで、韓国語を独学で勉強しています。', '教師', 'ja'),
        ('민수', 29, '서울', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a29yZWFuJTIwbWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60', '안녕하세요! 서울에 사는 민수입니다. 일본 문화와 음식에 관심이 많아요.', '프로그래머', 'ko'),
        ('준호', 27, '부산', 'https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YXNpYW4lMjBtYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60', '부산에서 근무하는 의사입니다. 일본어 공부 중이며 일본 여행을 좋아해요!', '의사', 'ko')
      ) AS profile_data(name, age, location, photo, bio, job, nationality)
    )
    SELECT * FROM recommended_profiles r
    WHERE 
      -- Korean users see Japanese profiles, Japanese users see Korean profiles
      (user_nationality = 'ko' AND r.nationality = 'ja') OR
      (user_nationality = 'ja' AND r.nationality = 'ko');
END;
$$;
