'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

export function useVisitorCount() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('git-bubble-last-visit');

        if (lastVisit !== today) {
          const { data } = await supabase.rpc('increment_visitor');
          if (data) {
            setVisitorCount(data);
            localStorage.setItem('git-bubble-last-visit', today);
          }
        } else {
          const { data } = await supabase.rpc('get_visitor_count');
          if (data) {
            setVisitorCount(data);
          }
        }
      } catch {
        // ignore
      }
    };
    trackVisitor();
  }, []);

  return visitorCount;
}
