import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded';
import QrCodeScannerRounded from '@mui/icons-material/QrCodeScannerRounded';
import ImageRounded from '@mui/icons-material/ImageRounded';
import ArticleRounded from '@mui/icons-material/ArticleRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import {
  Alert,
  Button,
  Chip,
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
import { strings } from '../../strings.js';
import './BatchPanel.css';

const batchExportActions = [
  { format: 'svg', icon: DescriptionRounded, label: strings.result.svg },
  { format: 'png', icon: ImageRounded, label: strings.result.png },
  { format: 'pdf', icon: PictureAsPdfRounded, label: strings.result.pdf },
  { format: 'docx', icon: ArticleRounded, label: strings.result.docx },
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
        <div aria-hidden="true" className="batch-panel__folio">
          <span>{String(items.length).padStart(2, '0')}</span>
          <i />
        </div>
        <div className="batch-panel__heading">
          <Typography component="h2" variant="h2">
            {strings.batch.title}
          </Typography>
          <Typography aria-live="polite" color="text.secondary" variant="body2">
            {countLabel}
          </Typography>
        </div>
        <div className="batch-panel__header-actions">
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
              startIcon={cameraStarting ? <CircularProgress size={18} /> : <QrCodeScannerRounded />}
              variant="contained"
            >
              {startScanLabel}
            </Button>
            <Button onClick={onUploadImage} startIcon={<ImageRounded />} variant="outlined">
              {strings.camera.upload}
            </Button>
          </div>
        </div>
      )}

      <div className={`batch-panel__footer${items.length ? ' batch-panel__footer--split' : ''}`}>
        {items.length ? (
          <Button
            disabled={startScanDisabled}
            onClick={onStartScan}
            startIcon={cameraStarting ? <CircularProgress size={18} /> : <QrCodeScannerRounded />}
            variant="outlined"
          >
            {strings.batch.addCode}
          </Button>
        ) : null}
        <Button
          aria-controls={exportMenuOpen ? 'batch-export-menu' : undefined}
          aria-expanded={exportMenuOpen ? 'true' : undefined}
          aria-haspopup="menu"
          disabled={!items.length || Boolean(busyFormat)}
          onClick={(event) => setExportAnchorElement(event.currentTarget)}
          startIcon={busyFormat ? <CircularProgress size={18} /> : <FileDownloadRounded />}
          variant="contained"
        >
          {strings.batch.export}
        </Button>
      </div>
      <Menu
        anchorEl={exportAnchorElement}
        id="batch-export-menu"
        onClose={() => setExportAnchorElement(null)}
        open={exportMenuOpen}
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
              <ListItemText>{action.label}</ListItemText>
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
          <Button onClick={() => setClearOpen(false)}>{strings.common.no}</Button>
          <Button color="error" onClick={confirmClear} variant="contained">
            {strings.common.yes}
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
      <div className="batch-panel__proof-rail">
        <span aria-hidden="true" className="batch-panel__proof-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="batch-panel__drag" aria-label={strings.batch.drag} role="img">
          <DragIndicatorRounded />
        </span>
      </div>
      <div className="batch-panel__proof-visual">
        <BatchThumbnail item={item} />
        <Chip className="batch-panel__type-chip" label={item.type.label} size="small" />
      </div>
      <div className="batch-panel__item-main">
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
            aria-label={`${strings.result.outputStyle}: ${item.branding?.enabled === false ? strings.result.cleanStyle : strings.result.labelledStyle}`}
            aria-pressed={item.branding?.enabled !== false}
            className="batch-panel__style-toggle"
            onClick={() => onBrandingChange(item.id, item.branding?.enabled === false)}
            size="small"
            variant="text"
          >
            {item.branding?.enabled === false
              ? strings.result.cleanStyle
              : strings.result.labelledStyle}
          </Button>
          <div className="batch-panel__item-actions">
            <Tooltip title={strings.batch.moveUp}>
              <span>
                <IconButton
                  aria-label={strings.batch.moveUp}
                  disabled={index === 0}
                  onClick={() => onMove(item.id, index - 1)}
                  size="small"
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
                  size="small"
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
                size="small"
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
