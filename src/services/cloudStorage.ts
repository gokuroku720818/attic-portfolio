import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AtticData } from './storage';

const TABLE_NAME = 'attic_store';
const RECORD_KEY = 'main_state';

/**
 * 클라우드(Supabase)에서 다락방 포트폴리오 데이터를 불러옵니다.
 */
export async function fetchCloudAtticData(): Promise<AtticData | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data, updated_at')
      .eq('key', RECORD_KEY)
      .maybeSingle();

    if (error) {
      console.warn('Supabase 데이터 로드 중 경고 (테이블 생성 전일 수 있음):', error.message);
      return null;
    }

    if (data && data.data) {
      return data.data as AtticData;
    }

    return null;
  } catch (err) {
    console.warn('Supabase 통신 오류:', err);
    return null;
  }
}

/**
 * 클라우드(Supabase)에 다락방 포트폴리오 데이터를 저장합니다.
 */
export async function saveCloudAtticData(atticData: AtticData): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase.from(TABLE_NAME).upsert(
      {
        key: RECORD_KEY,
        data: atticData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      console.warn('Supabase 데이터 저장 중 경고:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Supabase 저장 오류:', err);
    return false;
  }
}

/**
 * 실시간 변경사항을 구독합니다.
 */
export function subscribeCloudAtticData(onUpdate: (data: AtticData) => void): () => void {
  if (!isSupabaseConfigured()) return () => {};

  try {
    const channel = supabase
      .channel('public:attic_store')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE_NAME },
        (payload: any) => {
          if (payload.new && payload.new.key === RECORD_KEY && payload.new.data) {
            onUpdate(payload.new.data as AtticData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime 구독 실패:', err);
    return () => {};
  }
}
