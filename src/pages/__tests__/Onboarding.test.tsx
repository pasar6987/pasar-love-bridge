import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Onboarding from '../Onboarding';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// supabase 클라이언트 mock
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    rpc: jest.fn().mockResolvedValue({ data: {}, error: null }),
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

describe('Onboarding 마지막 단계', () => {
  function renderWithProvider() {
    return render(
      <MemoryRouter initialEntries={['/onboarding/1']}>
        <LanguageProvider>
          <AuthProvider>
            <Onboarding />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
  }

  it('Verification 단계에서 본인인증을 선택하면 supabase DB 저장 함수가 호출된다', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    renderWithProvider();

    // 1단계: 국적 선택
    const koreaButton = await screen.findByRole('button', { name: /한국|korea/i });
    fireEvent.click(koreaButton);
    const next1 = await screen.findByRole('button', { name: /다음|next/i });
    fireEvent.click(next1);
    // 1단계 후 DOM 출력
    // eslint-disable-next-line no-console
    console.log('--- 1단계 후 DOM ---', document.body.innerHTML);

    // 2단계: 사진 업로드(사진 업로드 input이 있다면 mock 파일 업로드)
    let next2 = await screen.findByRole('button', { name: /다음|next/i });
    if ((next2 as HTMLButtonElement).disabled) {
      const fileInput = screen.queryByLabelText(/사진|photo|file/i);
      if (fileInput) {
        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }
      next2 = await screen.findByRole('button', { name: /다음|next/i });
    }
    fireEvent.click(next2);
    // 2단계 후 DOM 출력
    // eslint-disable-next-line no-console
    console.log('--- 2단계 후 DOM ---', document.body.innerHTML);

    // 3단계: 기본정보 입력
    const nameInput = screen.queryByLabelText(/이름|name/i);
    if (nameInput) fireEvent.change(nameInput, { target: { value: '홍길동' } });
    const cityInput = screen.queryByLabelText(/도시|city/i);
    if (cityInput) fireEvent.change(cityInput, { target: { value: '서울' } });
    const birthInput = screen.queryByLabelText(/생년월일|birth/i);
    if (birthInput) fireEvent.change(birthInput, { target: { value: '1990-01-01' } });
    const next3 = await screen.findByRole('button', { name: /다음|next/i });
    fireEvent.click(next3);
    // 3단계 후 DOM 출력
    // eslint-disable-next-line no-console
    console.log('--- 3단계 후 DOM ---', document.body.innerHTML);

    // 4단계: 질문 입력
    const jobInput = screen.queryByLabelText(/직업|job/i);
    if (jobInput) fireEvent.change(jobInput, { target: { value: '개발자' } });
    const bioInput = screen.queryByLabelText(/자기소개|bio/i);
    if (bioInput) fireEvent.change(bioInput, { target: { value: '테스트 소개' } });
    const next4 = await screen.findByRole('button', { name: /다음|next/i });
    fireEvent.click(next4);
    // 4단계 후 DOM 출력
    // eslint-disable-next-line no-console
    console.log('--- 4단계 후 DOM ---', document.body.innerHTML);

    // 5단계: Verification - mock file 등 필수 입력값 입력
    const docTypeSelect = screen.queryByLabelText(/신분증 종류|docType/i);
    if (docTypeSelect) fireEvent.change(docTypeSelect, { target: { value: 'passport' } });
    const fileInput = screen.queryByLabelText(/파일|file/i);
    if (fileInput) {
      const file = new File(['dummy'], 'test.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [file] } });
    }
    // 5단계(Verification) DOM 출력
    // eslint-disable-next-line no-console
    console.log('--- 5단계(Verification) DOM ---', document.body.innerHTML);

    // '제출' 버튼 클릭
    const submitButton = await screen.findByRole('button', { name: /제출|신분증이 제출되었습니다|submit|verify/i });
    fireEvent.click(submitButton);

    // supabase.from('users').update 또는 rpc가 호출되는지 확인
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled();
      // 또는 expect(supabase.rpc).toHaveBeenCalled();
    });
  });
});

describe('Onboarding Verification 단계 단독 테스트', () => {
  function renderVerificationStep() {
    return render(
      <MemoryRouter initialEntries={['/onboarding/5']}>
        <LanguageProvider>
          <AuthProvider>
            <Onboarding />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
  }

  it('Verification 단계에서 필수 입력값 입력 후 제출 시 supabase DB 저장 함수가 호출된다', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    renderVerificationStep();

    // Verification 단계: 신분증 종류 선택
    const docTypeSelect = await screen.findByLabelText(/신분증 종류|docType/i);
    fireEvent.change(docTypeSelect, { target: { value: 'passport' } });

    // 파일 업로드
    const fileInput = await screen.findByLabelText(/파일|file/i);
    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // 제출 버튼 클릭 (버튼 텍스트에 맞게 조정)
    const submitButton = await screen.findByRole('button', { name: /제출|submit|신분증이 제출되었습니다|완료|finish/i });
    fireEvent.click(submitButton);

    // supabase.from('users').update 또는 rpc가 호출되는지 확인
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled();
      // 또는 expect(supabase.rpc).toHaveBeenCalled();
    });
  });
}); 