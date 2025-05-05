
// IP 기반 언어 감지 유틸리티
import { Language } from "@/i18n/types";

// 사용자 IP가 한국/일본 범위에 있는지 확인하는 함수 (간소화된 버전)
export const detectLanguageFromIP = async (): Promise<Language> => {
  try {
    // ipinfo.io API를 사용하여 사용자의 국가 코드를 가져옴
    const response = await fetch('https://ipinfo.io/json?token=9cb6f1c6097078');
    const data = await response.json();
    
    // 국가 코드에 따라 언어 결정
    if (data.country === 'JP') {
      return 'ja';
    } else {
      // 기본값은 한국어
      return 'ko';
    }
  } catch (error) {
    console.error('IP 기반 언어 감지 오류:', error);
    // 오류 발생 시 기본값으로 한국어 반환
    return 'ko';
  }
};
