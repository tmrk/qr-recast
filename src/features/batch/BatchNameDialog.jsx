import CloseRounded from '@mui/icons-material/CloseRounded';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { batchNameMaxLength, normaliseBatchName } from './store.js';
import { strings } from '../../strings.js';

/**
 * @param {{
 *   item: { id: string, name: string } | null,
 *   onClose: () => void,
 *   onSave: (itemId: string, name: string) => void,
 * }} props
 */
export function BatchNameDialog({ item, onClose, onSave }) {
  const [draftState, setDraftState] = useState({ itemId: '', name: '' });
  const name = draftState.itemId === item?.id ? draftState.name : (item?.name ?? '');

  function saveName() {
    if (!item) {
      return;
    }

    onSave(item.id, normaliseBatchName(name, item.name));
    onClose();
  }

  return (
    <Dialog fullWidth maxWidth="xs" onClose={onClose} open={Boolean(item)}>
      <DialogTitle>{strings.batch.nameTitle}</DialogTitle>
      <IconButton
        aria-label={strings.batch.closeName}
        className="batch-name-dialog__close"
        onClick={onClose}
      >
        <CloseRounded />
      </IconButton>
      <DialogContent>
        <TextField
          fullWidth
          label={strings.batch.nameLabel}
          onChange={(event) => setDraftState({ itemId: item?.id ?? '', name: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              saveName();
            }
          }}
          slotProps={{ htmlInput: { maxLength: batchNameMaxLength } }}
          value={name}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{strings.batch.keepScanning}</Button>
        <Button onClick={saveName} variant="contained">
          {strings.batch.saveName}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
