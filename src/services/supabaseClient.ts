/**
 * Supabase 클라이언트 연동 도우미
 * Review Focus 5: VITE_SUPABASE_URL 및 VITE_SUPABASE_ANON_KEY가 설정되지 않아도
 * 앱이 멈추거나 에러가 나지 않고 자동으로 안전하게 LocalStorage 모드로 동작합니다.
 */

export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== 'https://your-project.supabase.co');
};

export const getSupabaseConfig = () => {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };
};
