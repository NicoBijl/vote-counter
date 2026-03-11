import {Chip} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SyncIcon from '@mui/icons-material/Sync';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import {useCollaborationStore, SyncStatus} from "../hooks/useCollaborationStore";

interface SyncIndicatorProps {
    showDetails?: boolean;
}

function getStatusConfig(status: SyncStatus): { 
    label: string; 
    color: 'success' | 'warning' | 'error' | 'default'; 
    icon: React.ReactNode;
} {
    switch (status) {
        case 'synced':
            return { 
                label: 'In sync', 
                color: 'success',
                icon: <CheckCircleIcon />
            };
        case 'syncing':
            return { 
                label: 'Syncing...', 
                color: 'default',
                icon: <SyncIcon className="sync-spin" />
            };
        case 'out-of-sync':
            return { 
                label: 'Out of sync', 
                color: 'error',
                icon: <ErrorIcon />
            };
        case 'connecting':
            return { 
                label: 'Connecting...', 
                color: 'warning',
                icon: <SyncIcon className="sync-spin" />
            };
        default:
            return { 
                label: 'Offline', 
                color: 'default',
                icon: <CloudOffIcon />
            };
    }
}

export function SyncIndicator({ showDetails = false }: SyncIndicatorProps) {
    const { syncStatus, mismatchDetails } = useCollaborationStore();
    const config = getStatusConfig(syncStatus);
    
    const label = showDetails && mismatchDetails.length > 0
        ? `${config.label}: Ballots ${mismatchDetails.join(', ')} differ`
        : config.label;
    
    return (
        <Chip
            icon={config.icon as React.ReactElement}
            label={label}
            color={config.color}
            size="small"
            aria-live="polite"
            aria-label={`Sync status: ${config.label}${mismatchDetails.length > 0 ? `. ${mismatchDetails.length} ballots differ` : ''}`}
            sx={{
                '& .sync-spin': {
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                    },
                },
            }}
        />
    );
}
