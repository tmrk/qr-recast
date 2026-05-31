import { Alert, Button, Snackbar } from '@mui/material';
import { strings } from '../../strings.js';

/**
 * @param {{
 *   canUndo: boolean,
 *   message: string,
 *   onClearMessage: () => void,
 *   onClearWarning: () => void,
 *   onUndo: () => void,
 *   warning: string,
 * }} props
 */
export function BatchFeedback({
  canUndo,
  message,
  onClearMessage,
  onClearWarning,
  onUndo,
  warning,
}) {
  return (
    <>
      <Snackbar autoHideDuration={3200} onClose={onClearMessage} open={Boolean(message)}>
        <Alert
          action={
            canUndo ? (
              <Button color="inherit" onClick={onUndo} size="small">
                {strings.batch.undo}
              </Button>
            ) : null
          }
          severity="success"
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
      <Snackbar autoHideDuration={4200} onClose={onClearWarning} open={Boolean(warning)}>
        <Alert severity="warning" variant="filled">
          {warning}
        </Alert>
      </Snackbar>
    </>
  );
}
