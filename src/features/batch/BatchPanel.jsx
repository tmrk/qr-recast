import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import ArticleRounded from '@mui/icons-material/ArticleRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded';
import ImageRounded from '@mui/icons-material/ImageRounded';
import PhotoLibraryRounded from '@mui/icons-material/PhotoLibraryRounded';
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded';
import QrCodeScannerRounded from '@mui/icons-material/QrCodeScannerRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { batchNameMaxLength, normaliseBatchName } from './store.js';
import { BatchThumbnail } from './BatchThumbnail.jsx';
import { useHistoryLayer } from '../../lib/history-layers.js';
import { strings } from '../../strings.js';
import './BatchPanel.css';

const batchExportActions = [
  {
    format: 'svg',
    hint: strings.result.svgHint,
    icon: DescriptionRounded,
    label: strings.result.svg,
  },
  { format: 'png', hint: strings.result.pngHint, icon: ImageRounded, label: strings.result.png },
  {
    format: 'pdf',
    hint: strings.result.pdfHint,
    icon: PictureAsPdfRounded,
    label: strings.result.pdf,
  },
  {
    format: 'docx',
    hint: strings.result.docxHint,
    icon: ArticleRounded,
    label: strings.result.docx,
  },
];

/**
 * @param {{
 *   batch: { items: Array<object> },
 *   busyFormat: string,
 *   cameraStatus: string,
 *   onClear: () => void,
 *   onDelete: (itemId: string) => void,
 *   onExport: (format: string) => void,
 *   onMove: (itemId: string, targetIndex: number) => void,
 *   onRename: (itemId: string, name: string) => void,
 *   onBrandingChange: (itemId: string, enabled: boolean) => void,
 *   onStartScan: () => void,
 *   onUploadImage: () => void,
 *   persistenceError: boolean,
 * }} props
 */
export function BatchPanel({
  batch,
  busyFormat,
  cameraStatus,
  onClear,
  onDelete,
  onExport,
  onMove,
  onRename,
  onBrandingChange,
  onStartScan,
  onUploadImage,
  persistenceError,
}) {
  const [clearOpen, setClearOpen] = useState(false);
  const [exportAnchorElement, setExportAnchorElement] = useState(null);
  const [draggedItemId, setDraggedItemId] = useState('');
  const items = batch.items;
  const exportMenuOpen = Boolean(exportAnchorElement);

  useHistoryLayer(exportMenuOpen, () => setExportAnchorElement(null));
  useHistoryLayer(clearOpen, () => setClearOpen(false));

  const countLabel =
    items.length === 1
      ? strings.batch.oneCode.replace('{count}', String(items.length))
      : strings.batch.manyCodes.replace('{count}', String(items.length));
  const cameraStarting = cameraStatus === 'pending';
  const cameraReady = cameraStatus === 'ready';
  const startScanDisabled = cameraStarting || cameraReady || cameraStatus === 'unsupported';
  const startScanLabel = cameraReady
    ? strings.batch.scanning
    : cameraStarting
      ? strings.camera.pendingTitle
      : strings.batch.startScanning;
  const addCodeLabel = cameraReady
    ? strings.batch.scanning
    : cameraStarting
      ? strings.camera.pendingTitle
      : strings.batch.addCode;
  const panelClassName = [
    'batch-panel',
    items.length ? 'batch-panel--populated' : 'batch-panel--empty',
    `batch-panel--camera-${cameraStatus}`,
  ].join(' ');

  function confirmClear() {
    onClear();
    setClearOpen(false);
  }

  return (
    <Paper className={panelClassName} elevation={0}>
      <div className="batch-panel__header">
        <div className="batch-panel__heading">
          <Typography component="h2" variant="h2">
            {strings.batch.title}
          </Typography>
          <Typography aria-live="polite" color="text.secondary" variant="body2">
            {countLabel}
          </Typography>
        </div>
        <div className="batch-panel__header-actions">
          {items.length ? (
            <Tooltip title={strings.camera.upload}>
              <IconButton aria-label={strings.camera.upload} onClick={onUploadImage}>
                <PhotoLibraryRounded />
              </IconButton>
            </Tooltip>
          ) : null}
          <Button
            disabled={!items.length}
            onClick={() => setClearOpen(true)}
            startIcon={<DeleteRounded />}
            variant="text"
          >
            {strings.batch.clear}
          </Button>
        </div>
      </div>

      {persistenceError ? (
        <Alert icon={<WarningAmberRounded />} severity="warning" variant="outlined">
          {strings.batch.persistenceError}
        </Alert>
      ) : null}

      {items.length ? (
        <div aria-label={strings.batch.title} className="batch-panel__list" role="list">
          {items.map((item, index) => (
            <BatchItem
              dragging={draggedItemId === item.id}
              key={item.id}
              index={index}
              item={item}
              itemCount={items.length}
              onDelete={onDelete}
              onDragStart={setDraggedItemId}
              onDrop={(targetIndex) => {
                if (draggedItemId) {
                  onMove(draggedItemId, targetIndex);
                  setDraggedItemId('');
                }
              }}
              onMove={onMove}
              onRename={onRename}
              onBrandingChange={onBrandingChange}
            />
          ))}
        </div>
      ) : (
        <div className="batch-panel__empty">
          <div aria-hidden="true" className="batch-panel__empty-mark">
            <QrCodeScannerRounded />
          </div>
          <div className="batch-panel__empty-copy">
            <Typography component="h3" variant="h2">
              {strings.batch.emptyTitle}
            </Typography>
            <Typography color="text.secondary">{strings.batch.emptyBody}</Typography>
          </div>
          <div className="batch-panel__empty-actions">
            <Button
              disabled={startScanDisabled}
              onClick={onStartScan}
              size="large"
              startIcon={cameraStarting ? <CircularProgress size={18} /> : <QrCodeScannerRounded />}
              variant="contained"
            >
              {startScanLabel}
            </Button>
            <Button
              onClick={onUploadImage}
              size="large"
              startIcon={<ImageRounded />}
              variant="outlined"
            >
              {strings.camera.upload}
            </Button>
          </div>
        </div>
      )}

      {items.length ? (
        <div className="batch-panel__footer">
          <Button
            disabled={startScanDisabled}
            onClick={onStartScan}
            size="large"
            startIcon={cameraStarting ? <CircularProgress size={18} /> : <QrCodeScannerRounded />}
            variant="outlined"
          >
            {addCodeLabel}
          </Button>
          <Button
            aria-controls={exportMenuOpen ? 'batch-export-menu' : undefined}
            aria-expanded={exportMenuOpen ? 'true' : undefined}
            aria-haspopup="menu"
            disabled={Boolean(busyFormat)}
            onClick={(event) => setExportAnchorElement(event.currentTarget)}
            size="large"
            startIcon={busyFormat ? <CircularProgress size={18} /> : <FileDownloadRounded />}
            variant="contained"
          >
            {strings.batch.export}
          </Button>
        </div>
      ) : null}
      <Menu
        anchorEl={exportAnchorElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        id="batch-export-menu"
        onClose={() => setExportAnchorElement(null)}
        open={exportMenuOpen}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {batchExportActions.map((action) => {
          const Icon = action.icon;
          const loading = busyFormat === action.format;

          return (
            <MenuItem
              key={action.format}
              disabled={Boolean(busyFormat)}
              onClick={() => {
                setExportAnchorElement(null);
                onExport(action.format);
              }}
            >
              <ListItemIcon>
                {loading ? <CircularProgress size={18} /> : <Icon fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary={action.label} secondary={action.hint} />
            </MenuItem>
          );
        })}
      </Menu>

      <Dialog onClose={() => setClearOpen(false)} open={clearOpen}>
        <DialogTitle>{strings.batch.clearTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{strings.batch.clearBody}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearOpen(false)}>{strings.batch.clearCancel}</Button>
          <Button color="error" onClick={confirmClear} variant="contained">
            {strings.batch.clearConfirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function BatchItem({
  dragging,
  index,
  item,
  itemCount,
  onDelete,
  onDragStart,
  onDrop,
  onMove,
  onRename,
  onBrandingChange,
}) {
  const [draftState, setDraftState] = useState({ itemId: '', name: '' });
  const name = draftState.itemId === item.id ? draftState.name : item.name;
  const itemClassName = `batch-panel__item${dragging ? ' batch-panel__item--dragging' : ''}`;
  const labelled = item.branding?.enabled !== false;

  function commitName() {
    const nextName = normaliseBatchName(name, item.name);

    setDraftState({ itemId: item.id, name: nextName });
    onRename(item.id, nextName);
  }

  return (
    <article
      className={itemClassName}
      draggable
      onDragEnd={() => onDragStart('')}
      onDragOver={(event) => event.preventDefault()}
      onDragStart={() => onDragStart(item.id)}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(index);
      }}
      role="listitem"
    >
      <div className="batch-panel__proof-visual">
        <BatchThumbnail item={item} />
        <span className="batch-panel__drag" aria-label={strings.batch.drag} role="img">
          <DragIndicatorRounded />
        </span>
      </div>
      <div className="batch-panel__item-main">
        <div className="batch-panel__item-head">
          <span aria-hidden="true" className="batch-panel__proof-number">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="batch-panel__type">{item.type.label}</span>
        </div>
        <TextField
          fullWidth
          label={strings.batch.nameLabel}
          onBlur={commitName}
          onChange={(event) => setDraftState({ itemId: item.id, name: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
          size="small"
          slotProps={{ htmlInput: { maxLength: batchNameMaxLength } }}
          value={name}
        />
        <div className="batch-panel__item-meta">
          <Button
            aria-label={`${strings.result.outputStyle}: ${labelled ? strings.result.labelledStyle : strings.result.cleanStyle}`}
            aria-pressed={labelled}
            className="batch-panel__style-toggle"
            onClick={() => onBrandingChange(item.id, !labelled)}
            size="small"
            variant="outlined"
          >
            {labelled ? strings.result.labelledStyle : strings.result.cleanStyle}
          </Button>
          <div className="batch-panel__item-actions">
            <Tooltip title={strings.batch.moveUp}>
              <span>
                <IconButton
                  aria-label={strings.batch.moveUp}
                  disabled={index === 0}
                  onClick={() => onMove(item.id, index - 1)}
                >
                  <ArrowUpwardRounded fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={strings.batch.moveDown}>
              <span>
                <IconButton
                  aria-label={strings.batch.moveDown}
                  disabled={index === itemCount - 1}
                  onClick={() => onMove(item.id, index + 1)}
                >
                  <ArrowDownwardRounded fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={strings.batch.delete}>
              <IconButton
                aria-label={strings.batch.delete}
                className="batch-panel__delete-action"
                onClick={() => onDelete(item.id)}
              >
                <DeleteRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
    </article>
  );
}
