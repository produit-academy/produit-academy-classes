import { useEffect, useRef, useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Custom hook for instant real-time slot synchronization ("like firebase instant update").
 * Combines ultra-fast background polling (2.5s) with BroadcastChannel (0ms multi-tab sync).
 * Automatically updates slot statuses (available, held, booked).
 */
export function useLiveSlots(teacherId, initialSlots = [], onSlotTaken) {
    const [slots, setSlots] = useState(initialSlots);
    const [version, setVersion] = useState(null);
    const lastVersionRef = useRef(null);
    const channelRef = useRef(null);
    const isFetchingRef = useRef(false);

    // Keep slots synced if initialSlots updates from parent
    useEffect(() => {
        if (initialSlots && initialSlots.length > 0) {
            setSlots(prev => {
                if (!prev || prev.length === 0) return initialSlots;
                // Merge initialSlots with current statuses
                const map = new Map(prev.map(s => [s.id, s]));
                return initialSlots.map(s => {
                    const existing = map.get(s.id);
                    if (existing) {
                        return { ...s, is_booked: s.is_booked || existing.is_booked, is_held: s.is_held || existing.is_held };
                    }
                    return s;
                });
            });
        }
    }, [initialSlots]);

    const syncLiveSlots = useCallback(async () => {
        if (!teacherId || isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const res = await fetch(`${API_BASE}/api/classes/teacher/${teacherId}/live-slots/`, {
                headers: { 'Cache-Control': 'no-cache' }
            });
            if (!res.ok) return;
            const data = await res.json();
            
            if (data.version && data.version !== lastVersionRef.current) {
                lastVersionRef.current = data.version;
                setVersion(data.version);
            }

            if (Array.isArray(data.slots)) {
                setSlots(prevSlots => {
                    const liveMap = new Map(data.slots.map(s => [s.id, s]));
                    let hasChanged = false;
                    const newlyTakenSlotIds = [];

                    const updated = prevSlots.map(prevSlot => {
                        const live = liveMap.get(prevSlot.id);
                        if (!live) return prevSlot;

                        const wasAvailable = !prevSlot.is_booked && !prevSlot.is_held;
                        const isNowUnavailable = live.is_booked || live.is_held;

                        if (wasAvailable && isNowUnavailable) {
                            newlyTakenSlotIds.push(prevSlot.id);
                        }

                        if (prevSlot.is_booked !== live.is_booked || prevSlot.is_held !== live.is_held) {
                            hasChanged = true;
                            return {
                                ...prevSlot,
                                is_booked: live.is_booked,
                                is_held: live.is_held,
                            };
                        }
                        return prevSlot;
                    });

                    // If previously selected or active slot was taken, notify callback
                    if (newlyTakenSlotIds.length > 0 && typeof onSlotTaken === 'function') {
                        onSlotTaken(newlyTakenSlotIds);
                    }

                    return hasChanged ? updated : prevSlots;
                });
            }
        } catch (e) {
            // Silently fail network dropouts without disrupting UI
        } finally {
            isFetchingRef.current = false;
        }
    }, [teacherId, onSlotTaken]);

    // 1. Cross-tab Broadcast Channel listener (0ms latency sync on same device)
    useEffect(() => {
        if (typeof window === 'undefined' || !window.BroadcastChannel) return;

        try {
            const channel = new BroadcastChannel('produit_slot_sync');
            channelRef.current = channel;

            channel.onmessage = (event) => {
                if (event.data?.teacherId === Number(teacherId) || event.data?.teacherId === String(teacherId)) {
                    syncLiveSlots();
                }
            };

            return () => {
                channel.close();
            };
        } catch (e) {
            // Fallback gracefully if BroadcastChannel restricted
        }
    }, [teacherId, syncLiveSlots]);

    // 2. High-speed live poller (every 2.5 seconds when tab is active)
    useEffect(() => {
        if (!teacherId) return;

        // Sync immediately on mount
        syncLiveSlots();

        const interval = setInterval(() => {
            // Only poll if tab is currently visible
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                syncLiveSlots();
            }
        }, 2500);

        // Immediate sync whenever user refocuses the browser tab
        const handleFocus = () => {
            syncLiveSlots();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                syncLiveSlots();
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [teacherId, syncLiveSlots]);

    // Broadcast helper to notify other tabs/browsers immediately
    const broadcastSlotUpdate = useCallback((slotIds = []) => {
        if (channelRef.current) {
            try {
                channelRef.current.postMessage({
                    teacherId,
                    action: 'slots_updated',
                    slotIds,
                    timestamp: Date.now()
                });
            } catch (e) {}
        }
        // Also re-sync locally immediately
        syncLiveSlots();
    }, [teacherId, syncLiveSlots]);

    return {
        slots,
        version,
        refreshSlots: syncLiveSlots,
        broadcastSlotUpdate
    };
}
