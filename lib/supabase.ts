import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// --- MOCK SYSTEM FOR OFFLINE SIMULATION ---

// Simple event emitter for local realtime simulation
class MockEmitter {
  private listeners: Record<string, ((payload: any) => void)[]> = {};

  on(event: string, callback: (payload: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event: string, payload: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(payload));
    }
  }
}

export const mockEmitter = new MockEmitter();

const isMockMode = !supabaseUrl || supabaseUrl.includes('your-project-id') || !supabaseAnonKey || supabaseAnonKey.includes('your-anon-key');

const createMockClient = () => {
  return {
    from: (table: string) => ({
      select: () => ({
        data: [], 
        error: null,
      }),
      update: (values: any) => ({
        eq: (column: string, value: any) => {
          console.log(`[MOCK] Update ${table} where ${column}=${value}:`, values);
          mockEmitter.emit(`${table}_updated`, { new: { ...values, id: value } });
          return { error: null };
        },
      }),
      insert: (values: any) => {
        console.log(`[MOCK] Insert into ${table}:`, values);
        mockEmitter.emit(`${table}_inserted`, { new: { ...values, id: Math.random().toString() } });
        return { error: null };
      },
    }),
    channel: (name: string) => ({
      on: (type: string, filter: any, callback: any) => {
        const table = filter.table;
        const eventType = filter.event;
        
        if (eventType === 'INSERT') {
          mockEmitter.on(`${table}_inserted`, callback);
        } else if (eventType === 'UPDATE') {
          mockEmitter.on(`${table}_updated`, callback);
        }
        
        return {
          subscribe: () => ({
            unsubscribe: () => console.log(`[MOCK] Unsubscribed from ${name}`)
          })
        };
      },
      subscribe: () => ({
        unsubscribe: () => console.log(`[MOCK] Unsubscribed from ${name}`)
      })
    }),
    removeChannel: (channel: any) => console.log('[MOCK] Channel removed'),
    auth: {
      // Return a dummy session so middleware/hooks don't crash or block
      getSession: async () => ({ 
        data: { 
          session: { 
            user: { 
              id: 'dummy-user-001', 
              email: 'demo@awake.os',
              user_metadata: { role: 'admin_guardian' }
            } 
          } 
        }, 
        error: null 
      }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    }
  } as any;
};

// --- EXPORT CLIENT ---

export const supabase = isMockMode 
  ? createMockClient() 
  : createClient<Database>(supabaseUrl, supabaseAnonKey);

if (isMockMode) {
  console.warn("AWAKE OS: Running in OFFLINE SIMULATION mode. No connection to Supabase.");
}
