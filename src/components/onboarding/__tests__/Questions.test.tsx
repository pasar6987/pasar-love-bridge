import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Questions } from '../Questions';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

jest.mock('@/context/AuthContext', () => {
  const actual = jest.requireActual('@/context/AuthContext');
  return {
    ...actual,
    useAuth: jest.fn(),
  };
});

const mockUser = { id: 'test-user-id', email: 'test@example.com' };

(useAuth as jest.Mock).mockReturnValue({
  user: mockUser,
  session: {},
  loading: false,
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
});

describe('Questions 컴포넌트', () => {
  const baseTempData = {
    job: '',
    education: '',
    bio: '',
    interests: [],
    koreanLevel: 'native',
    japaneseLevel: 'beginner',
  };

  function renderWithProvider(ui: React.ReactElement) {
    return render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            {ui}
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
  }

  it('기본 렌더링이 정상적으로 동작한다', () => {
    renderWithProvider(
      <Questions
        onComplete={jest.fn()}
        tempData={baseTempData}
        updateTempData={jest.fn()}
      />
    );
    expect(screen.getByText(/몇 가지 질문에 답해주세요|いくつかの質問に答えてください/)).toBeInTheDocument();
  });

  it('onComplete 콜백이 정상적으로 호출된다', () => {
    const onComplete = jest.fn();
    const updateTempData = jest.fn();
    renderWithProvider(
      <Questions
        onComplete={onComplete}
        tempData={{
          ...baseTempData,
          job: '',
          bio: '',
          interests: [],
        }}
        updateTempData={updateTempData}
      />
    );
    // 필수 입력값 입력
    fireEvent.change(screen.getByLabelText(/직업|職業/), { target: { value: '개발자' } });
    fireEvent.change(screen.getByLabelText(/자기소개|自己紹介/), { target: { value: '소개' } });
    // 관심사(체크박스) 하나 선택 (있다면)
    const interestCheckbox = screen.queryAllByRole('checkbox')[0];
    if (interestCheckbox) {
      fireEvent.click(interestCheckbox);
    }
    // 폼 제출
    fireEvent.click(screen.getByRole('button', { name: /다음|次へ|next/i }));
    // onComplete가 호출되는지 확인
    expect(onComplete).toHaveBeenCalled();
  });
}); 