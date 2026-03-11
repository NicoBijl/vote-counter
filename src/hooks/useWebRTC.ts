import { useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { useCollaborationStore } from './useCollaborationStore';
import { useBallotStore } from './useBallotStore';
import { computeBallotHash } from '../utils/syncUtils';

export type MessageType = 
    | { type: 'HASH_CHECK'; hash: string }
    | { type: 'REQUEST_DELTAS' }
    | { type: 'DELTAS'; ballots: any[] };

export function useWebRTC() {
    const { 
        isActive, 
        myKey, 
        peerKey, 
        setSyncStatus, 
        setMismatchDetails,
        setIncoming,
        syncStatus,
    } = useCollaborationStore();
    
    const { ballots } = useBallotStore();
    
    const peerRef = useRef<Peer | null>(null);
    const connRef = useRef<DataConnection | null>(null);
    const lastHashRef = useRef<string | null>(null);
    
    const sendMessage = useCallback((msg: MessageType) => {
        if (connRef.current && connRef.current.open) {
            connRef.current.send(msg);
        }
    }, []);

    const handleMessage = useCallback((data: any) => {
        const msg = data as MessageType;
        
        switch (msg.type) {
            case 'HASH_CHECK':
                computeBallotHash(ballots).then(localHash => {
                    if (localHash !== msg.hash) {
                        setSyncStatus('out-of-sync');
                    } else {
                        setSyncStatus('synced');
                        setMismatchDetails([]);
                    }
                });
                break;
                
            case 'REQUEST_DELTAS':
                sendMessage({ type: 'DELTAS', ballots });
                break;
                
            case 'DELTAS':
                break;
        }
    }, [ballots, sendMessage, setSyncStatus, setMismatchDetails]);

    const setupConnection = useCallback((conn: DataConnection) => {
        conn.on('open', () => {
            if (useCollaborationStore.getState().peerKey) {
                setSyncStatus('synced');
                computeBallotHash(ballots).then(hash => {
                    sendMessage({ type: 'HASH_CHECK', hash });
                });
            } else {
                setSyncStatus('incoming');
            }
        });

        conn.on('data', (data) => {
            handleMessage(data);
        });

        conn.on('close', () => {
            setSyncStatus('disconnected');
            connRef.current = null;
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            setSyncStatus('disconnected');
        });
    }, [ballots, sendMessage, handleMessage, setSyncStatus]);

    useEffect(() => {
        if (!isActive || !myKey) {
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
            return;
        }

        const normalizedMyKey = myKey.replace(/-/g, '');
        const peer = new Peer(`vote-counter-${normalizedMyKey}`);
        peerRef.current = peer;

        peer.on('connection', (conn) => {
            connRef.current = conn;
            setIncoming(true);
            setupConnection(conn);
        });

        peer.on('error', (err) => {
            console.error('Peer error:', err);
        });

        return () => {
            peer.destroy();
        };
    }, [isActive, myKey, setIncoming, setupConnection]);

    useEffect(() => {
        if (isActive && peerKey && peerRef.current && !connRef.current) {
            const normalizedPeerKey = peerKey.replace(/-/g, '');
            const conn = peerRef.current.connect(`vote-counter-${normalizedPeerKey}`);
            connRef.current = conn;
            setupConnection(conn);
        }
    }, [isActive, peerKey, setupConnection]);

    useEffect(() => {
        if (syncStatus === 'synced' || syncStatus === 'out-of-sync') {
            const interval = setInterval(async () => {
                const currentHash = await computeBallotHash(ballots);
                if (currentHash !== lastHashRef.current) {
                    lastHashRef.current = currentHash;
                    sendMessage({ type: 'HASH_CHECK', hash: currentHash });
                }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [syncStatus, ballots, sendMessage]);

    return { sendMessage };
}
