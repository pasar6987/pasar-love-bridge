
// IP 기반 언어 감지 유틸리티
import { Language } from "@/i18n/types";

interface IPInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
}

// 국가에 따른 언어 매핑
const countryToLanguageMap: Record<string, Language> = {
  'JP': 'ja',  // 일본
  'KR': 'ko',  // 한국
  // 기타 국가는 필요에 따라 추가 가능
};

// IP 주소를 가져오는 함수
const getIPInfo = async (): Promise<IPInfo | null> => {
  try {
    // ipinfo.io API를 사용하여 사용자의 IP 정보를 가져옴
    const response = await fetch('https://ipinfo.io/json?token=9cb6f1c6097078');
    if (!response.ok) {
      throw new Error('Failed to fetch IP info');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('IP 정보 가져오기 오류:', error);
    return null;
  }
};

// IP 기반으로 언어를 감지하는 함수
export const detectLanguageFromIP = async (): Promise<Language> => {
  try {
    // 먼저 로컬 스토리지에서 이전에 감지된 언어 확인
    const savedLanguage = localStorage.getItem('detected_language') as Language | null;
    if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'ja')) {
      return savedLanguage;
    }
    
    // IP 정보 가져오기
    const ipInfo = await getIPInfo();
    if (!ipInfo) {
      throw new Error('IP 정보를 가져올 수 없음');
    }
    
    // 국가 코드에 따라 언어 결정
    const detectedLanguage = countryToLanguageMap[ipInfo.country] || 'ko'; // 기본값은 한국어
    
    // 감지된 언어를 로컬 스토리지에 저장
    localStorage.setItem('detected_language', detectedLanguage);
    
    console.log(`IP 기반 감지된 국가: ${ipInfo.country}, 언어: ${detectedLanguage}`);
    return detectedLanguage;
  } catch (error) {
    console.error('IP 기반 언어 감지 오류:', error);
    // 오류 발생 시 기본값으로 한국어 반환
    return 'ko';
  }
};

// 브라우저 언어 설정 기반으로 언어 감지
export const detectLanguageFromBrowser = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }
  
  if (browserLang.startsWith('ko')) {
    return 'ko';
  }
  
  return 'ko'; // 기본값은 한국어
};

// 가장 적합한 언어를 결정하는 함수
export const determineBestLanguage = async (): Promise<Language> => {
  // 1. 로컬 스토리지에서 사용자가 명시적으로 선택한 언어 확인
  const userSelectedLanguage = localStorage.getItem('user_selected_language') as Language | null;
  if (userSelectedLanguage && (userSelectedLanguage === 'ko' || userSelectedLanguage === 'ja')) {
    return userSelectedLanguage;
  }
  
  // 2. IP 기반 언어 감지 시도
  try {
    return await detectLanguageFromIP();
  } catch {
    // 3. IP 기반 감지 실패 시 브라우저 설정 기반 언어 감지
    return detectLanguageFromBrowser();
  }
};
