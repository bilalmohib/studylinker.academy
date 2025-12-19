"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/db/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Custom hook for Supabase Realtime subscriptions
 */
export function useRealtime<T = any>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabaseClient();
    const channelName = `realtime:${table}${filter ? `:${filter}` : ""}`;

    const newChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: filter || undefined,
        },
        (payload) => {
          console.log("Realtime event:", payload);
          if (payload.eventType === "INSERT" && onInsert) {
            onInsert(payload.new as T);
          } else if (payload.eventType === "UPDATE" && onUpdate) {
            onUpdate(payload.new as T);
          } else if (payload.eventType === "DELETE" && onDelete) {
            onDelete(payload.old as T);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") {
          console.log(`Realtime subscription active for ${table}`);
        }
      });

    setChannel(newChannel);

    return () => {
      if (newChannel) {
        supabase.removeChannel(newChannel);
        setIsConnected(false);
      }
    };
  }, [table, filter, enabled, onInsert, onUpdate, onDelete]);

  return { channel, isConnected };
}

/**
 * Hook for realtime teacher applications (admin)
 */
export function useRealtimeTeacherApplications(
  onUpdate: (application: any) => void,
  enabled = true
) {
  return useRealtime({
    table: "TeacherApplication",
    onInsert: onUpdate,
    onUpdate,
    enabled,
  });
}

/**
 * Hook for realtime contact submissions (admin)
 */
export function useRealtimeContacts(
  onUpdate: (contact: any) => void,
  enabled = true
) {
  return useRealtime({
    table: "Contact",
    onInsert: onUpdate,
    onUpdate,
    enabled,
  });
}

/**
 * Hook for realtime applications (for teachers/parents)
 */
export function useRealtimeApplications(
  jobId: string | null,
  onUpdate: (application: any) => void,
  enabled = true
) {
  return useRealtime({
    table: "Application",
    filter: jobId ? `jobId=eq.${jobId}` : undefined,
    onInsert: onUpdate,
    onUpdate,
    enabled: enabled && !!jobId,
  });
}

/**
 * Hook for realtime messages
 */
export function useRealtimeMessages(
  contractId: string | null,
  onUpdate: (message: any) => void,
  enabled = true
) {
  return useRealtime({
    table: "Message",
    filter: contractId ? `contractId=eq.${contractId}` : undefined,
    onInsert: onUpdate,
    onUpdate,
    enabled: enabled && !!contractId,
  });
}

/**
 * Hook for realtime classes
 */
export function useRealtimeClasses(
  contractId: string | null,
  onUpdate: (classItem: any) => void,
  enabled = true
) {
  return useRealtime({
    table: "Class",
    filter: contractId ? `contractId=eq.${contractId}` : undefined,
    onInsert: onUpdate,
    onUpdate,
    onDelete: onUpdate,
    enabled: enabled && !!contractId,
  });
}

