import {create} from "zustand";
import {persist} from "zustand/middleware";

export type SyncStatus = 'disconnected' | 'connecting' | 'incoming' | 'synced' | 'syncing' | 'out-of-sync';

interface CollaborationState {
    // Connection state
    isActive: boolean;
    myKey: string | null;
    peerKey: string | null;
    peerId: string | null;
    isIncoming: boolean;
    
    // Sync state
    syncStatus: SyncStatus;
    mismatchDetails: string[];
    lastSyncTimestamp: number;
    
    // Actions
    startPairing: () => void;
    stopPairing: () => void;
    setPeerKey: (key: string) => void;
    setPeerId: (id: string) => void;
    setSyncStatus: (status: SyncStatus) => void;
    setMismatchDetails: (details: string[]) => void;
    setIncoming: (incoming: boolean) => void;
    disconnect: () => void;
}

// Generate a random 6-character key
function generatePairingKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
    let key = '';
    for (let i = 0; i < 3; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i < 2) key += '-';
    }
    return key;
}

export const useCollaborationStore = create<CollaborationState>()(persist(
    (set) => ({
        isActive: false,
        myKey: null,
        peerKey: null,
        peerId: null,
        isIncoming: false,
        syncStatus: 'disconnected',
        mismatchDetails: [],
        lastSyncTimestamp: 0,
        
        startPairing: () => set({
            isActive: true,
            myKey: generatePairingKey(),
            peerKey: null,
            peerId: null,
            isIncoming: false,
            syncStatus: 'disconnected',
            mismatchDetails: [],
        }),
        
        stopPairing: () => set({
            isActive: false,
            myKey: null,
            peerKey: null,
            peerId: null,
            isIncoming: false,
            syncStatus: 'disconnected',
            mismatchDetails: [],
        }),
        
        setPeerKey: (key: string) => set({ 
            peerKey: key,
            syncStatus: 'connecting'
        }),
        
        setPeerId: (id: string) => set({ 
            peerId: id,
            syncStatus: 'synced',
            lastSyncTimestamp: Date.now()
        }),
        
        setSyncStatus: (status: SyncStatus) => set((state) => ({ 
            syncStatus: status,
            lastSyncTimestamp: status === 'synced' ? Date.now() : state.lastSyncTimestamp
        })),
        
        setMismatchDetails: (details: string[]) => set({ 
            mismatchDetails: details 
        }),
        
        setIncoming: (incoming: boolean) => set({
            isIncoming: incoming
        }),
        
        disconnect: () => set({
            isActive: false,
            peerId: null,
            peerKey: null,
            isIncoming: false,
            syncStatus: 'disconnected',
            mismatchDetails: [],
        }),
    }),
    {
        name: 'collaboration-store',
        partialize: (state) => ({
            // Only persist connection info for session recovery
            isActive: state.isActive,
            myKey: state.myKey,
            peerKey: state.peerKey,
            peerId: state.peerId,
            syncStatus: state.syncStatus,
        }),
    }
));
