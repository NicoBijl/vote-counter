import {useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useCollaborationStore} from '../hooks/useCollaborationStore';

export function CollaborationModal() {
    const { 
        isActive, 
        myKey, 
        syncStatus,
        startPairing, 
        stopPairing, 
        setPeerKey
    } = useCollaborationStore();
    
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState('');
    
    const handleStart = () => {
        startPairing();
    };
    
    const handleConnect = () => {
        if (!inputKey.trim()) {
            setError('Please enter the pairing key from your partner');
            return;
        }
        
        const normalizedInput = inputKey.toUpperCase().replace(/\s/g, '');
        setPeerKey(normalizedInput);
        setError('');
    };
    
    const handleDisconnect = () => {
        stopPairing();
        setInputKey('');
        setError('');
    };
    
    const copyToClipboard = () => {
        if (myKey) {
            navigator.clipboard.writeText(myKey.replace(/-/g, ''));
        }
    };
    
    if (!isActive) {
        return (
            <Button 
                variant="outlined" 
                onClick={handleStart}
                sx={{ mr: 1 }}
            >
                Start Collaboration
            </Button>
        );
    }
    
    return (
        <Dialog open={isActive} onClose={handleDisconnect} maxWidth="sm" fullWidth>
            <DialogTitle>Collaboration Mode</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Your pairing key
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontFamily: 'monospace',
                                letterSpacing: 2,
                                p: 2,
                                bgcolor: 'grey.100',
                                borderRadius: 1,
                                flex: 1,
                                textAlign: 'center'
                            }}
                        >
                            {myKey}
                        </Typography>
                        <Button 
                            variant="text"
                            onClick={copyToClipboard}
                            title="Copy to clipboard"
                        >
                            <ContentCopyIcon />
                        </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Share this key with your partner
                    </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Enter your partner's key
                    </Typography>
                    <TextField
                        fullWidth
                        value={inputKey}
                        onChange={(e) => {
                            setInputKey(e.target.value.toUpperCase());
                            setError('');
                        }}
                        placeholder="XXX-YYY"
                        error={!!error}
                        helperText={error}
                        disabled={syncStatus === 'connecting' || syncStatus === 'synced'}
                        inputProps={{
                            maxLength: 7,
                            style: { textAlign: 'center', letterSpacing: 2, fontFamily: 'monospace' }
                        }}
                    />
                </Box>
                
                {syncStatus === 'incoming' && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Connection incoming! Please enter your partner's key to establish secure link.
                    </Alert>
                )}
                
                {syncStatus === 'connecting' && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Connecting to your partner...
                    </Alert>
                )}
                
                {syncStatus === 'synced' && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Connected! You can now see sync status.
                    </Alert>
                )}
                
                <Typography variant="body2" color="text.secondary">
                    Both partners need to enter each other's keys to establish a secure connection.
                    No master/slave - both devices have equal status.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDisconnect} color="error">
                    End Collaboration
                </Button>
                {syncStatus !== 'synced' && (
                    <Button 
                        onClick={handleConnect} 
                        variant="contained"
                        disabled={syncStatus === 'connecting'}
                        startIcon={syncStatus === 'connecting' ? <CircularProgress size={16} /> : null}
                    >
                        {syncStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
