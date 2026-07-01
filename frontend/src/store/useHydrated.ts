import { useEffect, useState } from 'react';
import { useStore } from './index';

/**
 * 等待 Zustand persist 从 localStorage 恢复数据完成。
 * 返回 true 表示持久化状态已经就绪，可以安全地读取 user/token 了。
 * hydration 完成前不应做任何登录状态判断，否则会因为 user 为 null 而误踢用户去登录页。
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // 如果 useEffect 执行时已经 hydration 完成，直接标记（防止 listener 已错过）
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    // 否则订阅 onFinishHydration
    const unsub = useStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  return hydrated;
}
