import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Verification } from '../Verification';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    type: 'basic',
    url: '',
    redirected: false,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('{}'),
    headers: { get: () => null },
    clone: () => undefined,
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
  } as unknown as Response)
);

// supabase 클라이언트 mock
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: {}, error: null }),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test-url.com/test.png' } })),
      })),
    },
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } } }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// useAuth mock (user 항상 존재)
jest.mock('@/context/AuthContext', () => {
  const actual = jest.requireActual('@/context/AuthContext');
  return {
    ...actual,
    useAuth: jest.fn(() => ({
      user: { id: 'test-user', email: 'test@example.com' },
      session: {},
      loading: false,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
    })),
  };
});

describe('Verification 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderWithProvider(props: any) {
    return render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <Verification {...props} />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
  }

  it('필수 입력값 입력 후 제출 시 users, identity_verifications 모두 DB 저장 함수가 호출된다', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    const onComplete = jest.fn();
    const { container } = renderWithProvider({
      onComplete,
      tempData: {
        docType: 'passport',
        frontUploaded: false,
        file: null,
      },
      countryCode: 'ko',
      updateTempData: jest.fn(),
      allTempData: {
        countryCode: 'ko',
        photos: [],
        basicInfo: {
          name: '홍길동',
          gender: 'male',
          birthdate: '1990-01-01',
          city: '서울',
        },
        questions: {
          job: '개발자',
          education: 'bachelors',
          bio: '테스트 소개',
          interests: ['음악'],
          koreanLevel: 'native',
          japaneseLevel: 'beginner',
        },
        verification: {
          docType: 'passport',
          frontUploaded: false,
          file: null,
        },
      },
    });

    // 파일 업로드 input이 등장할 때까지 대기 후 업로드
    let fileInput;
    try {
      fileInput = container.querySelector('input[type="file"]');
      if (!fileInput) throw new Error();
    } catch (e) {
      screen.debug();
      throw new Error('파일 업로드 input을 찾을 수 없습니다.');
    }
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 제출 버튼 클릭
    const submitButton = await screen.findByRole('button', { name: /제출|submit|신분증이 제출되었습니다|완료|finish/i });
    fireEvent.click(submitButton);

    // users update, identity_verifications insert가 모두 호출되는지 확인
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from).toHaveBeenCalledWith('identity_verifications');
    });
  });

  it('건너뛰기 버튼 클릭 시 users만 DB 저장 함수가 호출되고 identity_verifications는 호출되지 않는다', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    const onComplete = jest.fn();
    const { container } = renderWithProvider({
      onComplete,
      tempData: {
        docType: '',
        frontUploaded: false,
        file: null,
      },
      countryCode: 'ko',
      updateTempData: jest.fn(),
      allTempData: {
        countryCode: 'ko',
        photos: [],
        basicInfo: {
          name: '홍길동',
          gender: 'male',
          birthdate: '1990-01-01',
          city: '서울',
        },
        questions: {
          job: '개발자',
          education: 'bachelors',
          bio: '테스트 소개',
          interests: ['음악'],
          koreanLevel: 'native',
          japaneseLevel: 'beginner',
        },
        verification: {
          docType: '',
          frontUploaded: false,
          file: null,
        },
      },
    });

    // 건너뛰기 버튼 클릭
    const skipButton = await screen.findByRole('button', { name: /나중에 하기|skip|later/i });
    fireEvent.click(skipButton);

    // users는 호출되어야 하고, identity_verifications는 호출되지 않아야 함
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from).not.toHaveBeenCalledWith('identity_verifications');
    });
  });
}); 