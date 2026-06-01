import ArticleRounded from '@mui/icons-material/ArticleRounded';
import AppsRounded from '@mui/icons-material/AppsRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ContactPageRounded from '@mui/icons-material/ContactPageRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CurrencyBitcoinRounded from '@mui/icons-material/CurrencyBitcoinRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import DeviceHubRounded from '@mui/icons-material/DeviceHubRounded';
import EmailRounded from '@mui/icons-material/EmailRounded';
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import ImageRounded from '@mui/icons-material/ImageRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import PhoneRounded from '@mui/icons-material/PhoneRounded';
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded';
import QrCodeScannerRounded from '@mui/icons-material/QrCodeScannerRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import SmsRounded from '@mui/icons-material/SmsRounded';
import TextFieldsRounded from '@mui/icons-material/TextFieldsRounded';
import TextSnippetRounded from '@mui/icons-material/TextSnippetRounded';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import WifiRounded from '@mui/icons-material/WifiRounded';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trackAnalyticsEvent } from '../analytics/events.js';
import { createDecoratedQrSvg } from '../branding/decorator.js';
import { useBrandingPreference } from '../branding/preferences.js';
import {
  createDocxExport,
  createPdfExport,
  createPngExport,
  createSvgExport,
} from '../../lib/exporters.js';
import { shareOrCopyUrl, shareOrSaveBlob, statusToMessage } from '../../lib/files.js';
import { extractPayloadUrl } from '../../lib/payload.js';
import { detectQrType, payloadKindFromQrType } from '../../lib/qr-types/index.js';
import { SHARE_URL_MAX_LENGTH, buildShareUrl, createQrSvg, hashTextPrefix } from '../../lib/qr.js';
import { strings } from '../../strings.js';

const exportActions = [
  {
    format: 'svg',
    label: strings.result.svg,
    icon: DescriptionRounded,
    createBlob: createSvgExport,
    mime: 'image/svg+xml',
  },
  {
    format: 'png',
    label: strings.result.png,
    icon: ImageRounded,
    createBlob: createPngExport,
    mime: 'image/png',
  },
  {
    format: 'pdf',
    label: strings.result.pdf,
    icon: PictureAsPdfRounded,
    createBlob: createPdfExport,
    mime: 'application/pdf',
  },
  {
    format: 'docx',
    label: strings.result.docx,
    icon: ArticleRounded,
    createBlob: createDocxExport,
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
];
const decodedTextTitleId = 'decoded-text-title';
const typeIcons = Object.freeze({
  'app-link': AppsRounded,
  calendar: CalendarMonthRounded,
  contact: ContactPageRounded,
  crypto: CurrencyBitcoinRounded,
  email: EmailRounded,
  geo: LocationOnRounded,
  homekit: HomeRounded,
  matter: DeviceHubRounded,
  'plain-text': TextFieldsRounded,
  sms: SmsRounded,
  tel: PhoneRounded,
  url: LinkRounded,
  wifi: WifiRounded,
});

/**
 * @param {{ onScanAgain: () => void, text: string }} props
 */
export function ResultView({ onScanAgain, text }) {
  const [qrAssetState, setQrAssetState] = useState({ fileStem: '', svg: '', text: '' });
  const [busyAction, setBusyAction] = useState('');
  const [textOpen, setTextOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [downloadAnchorElement, setDownloadAnchorElement] = useState(null);
  const [shareUrlState, setShareUrlState] = useState({ text: '', url: '' });
  const [copiedShareUrlState, setCopiedShareUrlState] = useState({ text: '', url: '' });
  const [shareUrlSvgState, setShareUrlSvgState] = useState({ url: '', svg: '' });
  const [copiedDecodedText, setCopiedDecodedText] = useState('');
  const [copiedFieldState, setCopiedFieldState] = useState({ key: '', text: '' });
  const [revealedFieldState, setRevealedFieldState] = useState({ fields: {}, text: '' });
  const [brandingOverrideState, setBrandingOverrideState] = useState({ enabled: null, text: '' });
  const [qrCopyPressing, setQrCopyPressing] = useState(false);
  const [globalBrandingEnabled] = useBrandingPreference();
  const qrCopyTimerRef = useRef(0);
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');

  useEffect(() => {
    let active = true;

    Promise.all([createQrSvg(text), hashTextPrefix(text)])
      .then(([svg, hash]) => {
        if (!active) {
          return;
        }

        setQrAssetState({ fileStem: `qr-recast-${hash}`, svg, text });
      })
      .catch(() => {
        if (active) {
          setError(strings.result.qrError);
        }
      });

    return () => {
      active = false;
    };
  }, [text]);

  const payloadPreview = useMemo(() => text.trim() || strings.result.emptyPayload, [text]);
  const qrType = useMemo(() => detectQrType(text), [text]);
  const payloadKind = useMemo(() => payloadKindFromQrType(qrType), [qrType]);
  const payloadUrl = useMemo(() => extractPayloadUrl(text), [text]);
  const canonicalSvgString = qrAssetState.text === text ? qrAssetState.svg : '';
  const fileStem = qrAssetState.text === text ? qrAssetState.fileStem : '';
  const payloadKindLabel =
    qrType.label || strings.result.payloadKinds[payloadKind] || strings.result.payloadKinds.text;
  const TypeIcon = typeIcons[qrType.type] ?? TextFieldsRounded;
  const brandingOverride =
    brandingOverrideState.text === text ? brandingOverrideState.enabled : null;
  const brandingEnabled = brandingOverride ?? globalBrandingEnabled;
  const svgString = useMemo(
    () => createDecoratedQrSvg(canonicalSvgString, qrType, { enabled: brandingEnabled }),
    [brandingEnabled, canonicalSvgString, qrType],
  );
  const copiedFieldKey = copiedFieldState.text === text ? copiedFieldState.key : '';
  const revealedFields = revealedFieldState.text === text ? revealedFieldState.fields : {};
  const decodedTextCopied = copiedDecodedText === text;
  const shareUrl = shareUrlState.text === text ? shareUrlState.url : '';
  const copiedShareUrl = copiedShareUrlState.text === text ? copiedShareUrlState.url : '';
  const shareUrlSvg = shareUrlSvgState.url === copiedShareUrl ? shareUrlSvgState.svg : '';
  const shareUrlTooLarge = shareUrl.length > SHARE_URL_MAX_LENGTH;
  const shareUrlDisabled = Boolean(busyAction) || !shareUrl || shareUrlTooLarge;
  const canShareUrlNatively =
    hasCoarsePointer && typeof navigator !== 'undefined' && Boolean(navigator.share);
  const ShareUrlIcon = canShareUrlNatively ? ShareRounded : ContentCopyRounded;
  const urlActionCopied = Boolean(
    copiedShareUrl && copiedShareUrl === shareUrl && !shareUrlTooLarge,
  );
  const UrlActionIcon = urlActionCopied ? CheckRounded : ShareUrlIcon;
  const urlActionClassName = `result-view__url-action${
    urlActionCopied ? ' result-view__url-action--copied' : ''
  }`;
  const copiedActionStyle = {
    backgroundColor: 'var(--qr-palette-success-main)',
    color: 'var(--qr-palette-success-contrastText)',
  };
  const urlActionStyle = urlActionCopied ? copiedActionStyle : undefined;
  const TextCopyIcon = decodedTextCopied ? CheckRounded : ContentCopyRounded;
  const textCopyActionClassName = `result-view__text-copy-action${
    decodedTextCopied ? ' result-view__text-copy-action--copied' : ''
  }`;
  const textCopyActionStyle = decodedTextCopied ? copiedActionStyle : undefined;
  const showDesktopSharePreview = Boolean(
    !hasCoarsePointer && copiedShareUrl && copiedShareUrl === shareUrl && !shareUrlTooLarge,
  );
  const useTextBottomSheet = hasCoarsePointer;
  const downloadMenuOpen = Boolean(downloadAnchorElement);
  const exportInProgress = exportActions.some((action) => busyAction === action.format);
  const decodedPayloadBlock = (
    <pre className="result-view__payload">
      <code>{payloadPreview}</code>
    </pre>
  );
  const decodedPanelBody = (
    <Stack spacing={1.5}>
      <div className="result-view__decoded-tools">
        {payloadUrl ? (
          <Button
            className="result-view__external-link"
            component="a"
            href={payloadUrl}
            onClick={openPayloadLink}
            rel="noopener noreferrer"
            startIcon={<OpenInNewRounded />}
            target="_blank"
            variant="outlined"
          >
            {strings.result.openLink}
          </Button>
        ) : null}
        <Button
          className={textCopyActionClassName}
          color={decodedTextCopied ? 'success' : 'primary'}
          disabled={Boolean(busyAction)}
          onClick={runCopyDecodedText}
          startIcon={
            busyAction === 'text-copy' ? (
              <CircularProgress size={18} />
            ) : (
              <span
                key={decodedTextCopied ? 'copied' : 'ready'}
                className="result-view__text-copy-action-icon"
              >
                <TextCopyIcon />
              </span>
            )
          }
          style={textCopyActionStyle}
          variant="contained"
        >
          {strings.result.copyText}
        </Button>
      </div>
      <Typography color="text.secondary" variant="overline">
        {strings.result.rawPayload}
      </Typography>
      {decodedPayloadBlock}
    </Stack>
  );
  const decodedPanelHeading = (
    <Stack alignItems="center" className="result-view__decoded-heading" direction="row" spacing={1}>
      <Typography component="h2" id={decodedTextTitleId} variant="h2">
        {strings.result.decodedText}
      </Typography>
      <Chip
        className="result-view__kind-chip"
        icon={<TypeIcon />}
        label={payloadKindLabel}
        size="small"
      />
    </Stack>
  );

  useEffect(() => {
    let active = true;

    buildShareUrl(text)
      .then((url) => {
        if (active) {
          setShareUrlState({ text, url });
        }
      })
      .catch(() => {
        if (active) {
          setError(strings.result.shareUrlError);
        }
      });

    return () => {
      active = false;
    };
  }, [text]);

  useEffect(() => {
    if (!showDesktopSharePreview || shareUrlSvgState.url === copiedShareUrl) {
      return undefined;
    }

    let active = true;

    createQrSvg(copiedShareUrl)
      .then((svg) => {
        if (active) {
          setShareUrlSvgState({ url: copiedShareUrl, svg });
        }
      })
      .catch(() => {
        if (active) {
          setError(strings.result.shareUrlError);
        }
      });

    return () => {
      active = false;
    };
  }, [copiedShareUrl, shareUrlSvgState.url, showDesktopSharePreview]);

  useEffect(
    () => () => {
      window.clearTimeout(qrCopyTimerRef.current);
    },
    [],
  );

  async function runExport(action) {
    if (!svgString || !fileStem) {
      return;
    }

    setDownloadAnchorElement(null);

    await runBusyAction(
      action.format,
      async () => {
        const blob = await action.createBlob(svgString);
        const exportBlob = blob.type ? blob : new Blob([blob], { type: action.mime });
        const status = await shareOrSaveBlob({
          blob: exportBlob,
          fileName: `${fileStem}.${action.format}`,
          title: strings.appName,
        });

        trackAnalyticsEvent('qr_export', {
          format: action.format,
          method: ['cancelled', 'shared'].includes(status) ? 'file_share' : 'download',
          payload_kind: payloadKind,
          result: status,
        });
        setMessage(statusToMessage(status, strings.result));
      },
      strings.result.exportError,
      () => {
        trackAnalyticsEvent('qr_export', {
          format: action.format,
          payload_kind: payloadKind,
          result: 'error',
        });
      },
    );
  }

  async function runShareUrl() {
    if (!shareUrl) {
      return;
    }

    if (shareUrlTooLarge) {
      trackAnalyticsEvent('share_url', {
        payload_kind: payloadKind,
        result: 'too_large',
      });
      setError(strings.result.urlTooLarge);
      return;
    }

    await runBusyAction(
      'url',
      async () => {
        const status = await shareOrCopyUrl(shareUrl, { useNativeShare: canShareUrlNatively });
        if (status === 'copied') {
          setCopiedShareUrlState({ text, url: shareUrl });
        }

        trackAnalyticsEvent('share_url', {
          method: canShareUrlNatively ? 'native_share' : 'clipboard',
          payload_kind: payloadKind,
          result: status,
        });
        setMessage(statusToMessage(status, strings.result));
      },
      strings.result.shareUrlError,
      () => {
        trackAnalyticsEvent('share_url', {
          method: canShareUrlNatively ? 'native_share' : 'clipboard',
          payload_kind: payloadKind,
          result: 'error',
        });
      },
    );
  }

  async function runCopyDecodedText() {
    await runBusyAction(
      'text-copy',
      async () => {
        await navigator.clipboard.writeText(text);
        setCopiedDecodedText(text);
        trackAnalyticsEvent('decoded_text_copy', {
          payload_kind: payloadKind,
          result: 'success',
        });
        setMessage(strings.result.copied);
      },
      strings.result.copyError,
      () => {
        trackAnalyticsEvent('decoded_text_copy', {
          payload_kind: payloadKind,
          result: 'error',
        });
      },
    );
  }

  async function runCopyField(field) {
    await runBusyAction(
      `field-copy-${field.key}`,
      async () => {
        await navigator.clipboard.writeText(field.value);
        setCopiedFieldState({ key: field.key, text });
        setMessage(strings.result.valueCopied);
      },
      strings.result.copyError,
    );
  }

  function toggleFieldVisibility(field) {
    setRevealedFieldState((currentState) => ({
      fields: {
        ...(currentState.text === text ? currentState.fields : {}),
        [field.key]: !revealedFields[field.key],
      },
      text,
    }));
  }

  function updateResultBranding(event) {
    const enabled = event.target.checked;

    setBrandingOverrideState({ enabled, text });
    trackAnalyticsEvent('branding_toggled', {
      state: enabled ? 'enabled' : 'disabled',
      surface: 'result',
    });
  }

  async function runCopyQrImage() {
    if (!svgString || busyAction) {
      return;
    }

    await runBusyAction(
      'qr-copy',
      async () => {
        if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
          throw new Error('Clipboard image writing is unavailable.');
        }

        const pngBlob = await createPngExport(svgString);

        await navigator.clipboard.write([
          new ClipboardItem({
            [pngBlob.type || 'image/png']: pngBlob,
          }),
        ]);
        setMessage(strings.result.qrCopied);
      },
      strings.result.qrCopyError,
    );
  }

  function startQrCopyPress() {
    if (!svgString || busyAction || qrCopyTimerRef.current) {
      return;
    }

    setQrCopyPressing(true);
    qrCopyTimerRef.current = window.setTimeout(() => {
      qrCopyTimerRef.current = 0;
      setQrCopyPressing(false);
      runCopyQrImage();
    }, 560);
  }

  function cancelQrCopyPress() {
    window.clearTimeout(qrCopyTimerRef.current);
    qrCopyTimerRef.current = 0;
    setQrCopyPressing(false);
  }

  function preventQrContextMenu(event) {
    if (hasCoarsePointer || qrCopyPressing) {
      event.preventDefault();
    }
  }

  function handleQrCopyKeyDown(event) {
    if (![' ', 'Enter'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    runCopyQrImage();
  }

  function openDecodedText() {
    trackAnalyticsEvent('decoded_text_open', {
      payload_kind: payloadKind,
      surface: 'result',
    });
    setTextOpen(true);
  }

  function openPayloadLink() {
    trackAnalyticsEvent('payload_link_open', {
      payload_kind: 'url',
      surface: 'decoded_text',
    });
  }

  function scanAgain() {
    trackAnalyticsEvent('scan_again', {
      payload_kind: payloadKind,
      surface: 'result',
    });
    onScanAgain();
  }

  async function runBusyAction(
    actionName,
    work,
    errorMessage = strings.result.exportError,
    onError = undefined,
  ) {
    setError('');
    setMessage('');

    const timer = window.setTimeout(() => setBusyAction(actionName), 150);

    try {
      await work();
    } catch {
      onError?.();
      setError(errorMessage);
    } finally {
      window.clearTimeout(timer);
      setBusyAction('');
    }
  }

  const qrCard = (
    <Paper
      aria-label={strings.result.copyQrAction}
      className={`result-view__qr-card${qrCopyPressing ? ' result-view__qr-card--pressing' : ''}`}
      elevation={0}
      onContextMenu={preventQrContextMenu}
      onKeyDown={handleQrCopyKeyDown}
      onPointerCancel={cancelQrCopyPress}
      onPointerDown={startQrCopyPress}
      onPointerLeave={cancelQrCopyPress}
      onPointerUp={cancelQrCopyPress}
      role="button"
      tabIndex={svgString ? 0 : -1}
    >
      {svgString ? (
        <div
          aria-label={strings.result.qrAlt}
          className="result-view__qr"
          dangerouslySetInnerHTML={{ __html: svgString }}
          role="img"
        />
      ) : (
        <CircularProgress aria-label={strings.result.generating} />
      )}
    </Paper>
  );
  const typeDetails = (
    <Paper className="result-view__type-card" elevation={0}>
      <Stack
        alignItems="center"
        className="result-view__type-card-heading"
        direction="row"
        spacing={1.25}
      >
        <span className="result-view__type-icon" aria-hidden="true">
          <TypeIcon />
        </span>
        <Stack minWidth={0} spacing={0.25}>
          <Typography color="text.secondary" variant="overline">
            {strings.result.detailsTitle}
          </Typography>
          <Typography component="h2" variant="h2">
            {payloadKindLabel}
          </Typography>
        </Stack>
      </Stack>
      {qrType.fields.length ? (
        <div className="result-view__fields">
          {qrType.fields.map((field) => {
            const fieldRevealed = !field.sensitive || Boolean(revealedFields[field.key]);
            const fieldCopied = copiedFieldKey === field.key;
            const CopyIcon = fieldCopied ? CheckRounded : ContentCopyRounded;

            return (
              <div key={field.key} className="result-view__field">
                <div className="result-view__field-text">
                  <Typography color="text.secondary" variant="overline">
                    {field.label}
                  </Typography>
                  <Typography className="result-view__field-value">
                    {fieldRevealed ? field.value : strings.result.hiddenValue}
                  </Typography>
                </div>
                <div className="result-view__field-actions">
                  {field.sensitive ? (
                    <Tooltip
                      title={fieldRevealed ? strings.result.hideValue : strings.result.revealValue}
                    >
                      <IconButton
                        aria-label={
                          fieldRevealed ? strings.result.hideValue : strings.result.revealValue
                        }
                        onClick={() => toggleFieldVisibility(field)}
                      >
                        {fieldRevealed ? <VisibilityOffRounded /> : <VisibilityRounded />}
                      </IconButton>
                    </Tooltip>
                  ) : null}
                  <Tooltip title={strings.result.copyValue}>
                    <IconButton
                      aria-label={`${strings.result.copyValue}: ${field.label}`}
                      disabled={field.sensitive && !fieldRevealed}
                      onClick={() => runCopyField(field)}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </Paper>
  );

  return (
    <section className="result-view" aria-labelledby="result-title">
      <Stack className="result-view__stack" spacing={2.5}>
        <Stack
          alignItems="flex-start"
          className="result-view__header"
          direction="row"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Chip
              className="result-view__kind-chip"
              icon={<TypeIcon />}
              label={payloadKindLabel}
              size="small"
            />
            <Typography component="h1" id="result-title" variant="h1">
              {strings.result.title}
            </Typography>
            <Typography color="text.secondary">{strings.result.supporting}</Typography>
          </Stack>
          <IconButton aria-label={strings.result.scanAgain} onClick={scanAgain}>
            <QrCodeScannerRounded />
          </IconButton>
        </Stack>

        <Tooltip
          disableFocusListener={hasCoarsePointer}
          disableHoverListener={hasCoarsePointer}
          disableTouchListener
          title={strings.result.copyQrTooltip}
        >
          {qrCard}
        </Tooltip>

        <Paper className="result-view__branding-control" elevation={0}>
          <FormControlLabel
            control={
              <Switch
                checked={brandingEnabled}
                inputProps={{ 'aria-label': strings.result.brandingToggle }}
                onChange={updateResultBranding}
              />
            }
            label={strings.result.brandingToggle}
            labelPlacement="start"
          />
        </Paper>

        {typeDetails}

        <div className="result-view__primary-actions">
          <Button
            aria-describedby={shareUrlTooLarge ? 'share-url-guidance' : undefined}
            className={urlActionClassName}
            color={urlActionCopied ? 'success' : 'primary'}
            disabled={shareUrlDisabled}
            onClick={runShareUrl}
            startIcon={
              busyAction === 'url' ? (
                <CircularProgress size={18} />
              ) : (
                <span
                  key={urlActionCopied ? 'copied' : 'ready'}
                  className="result-view__url-action-icon"
                >
                  <UrlActionIcon />
                </span>
              )
            }
            style={urlActionStyle}
            variant="contained"
          >
            {canShareUrlNatively ? strings.result.shareUrl : strings.result.copyUrl}
          </Button>
          <Button
            aria-controls={downloadMenuOpen ? 'result-download-menu' : undefined}
            aria-expanded={downloadMenuOpen ? 'true' : undefined}
            aria-haspopup="menu"
            disabled={!svgString || Boolean(busyAction)}
            endIcon={<KeyboardArrowDownRounded />}
            onClick={(event) => setDownloadAnchorElement(event.currentTarget)}
            startIcon={exportInProgress ? <CircularProgress size={18} /> : <FileDownloadRounded />}
            variant="contained"
          >
            {strings.result.download}
          </Button>
        </div>

        <Menu
          anchorEl={downloadAnchorElement}
          id="result-download-menu"
          onClose={() => setDownloadAnchorElement(null)}
          open={downloadMenuOpen}
        >
          {exportActions.map((action) => {
            const Icon = action.icon;
            const loading = busyAction === action.format;

            return (
              <MenuItem
                key={action.format}
                disabled={!svgString || Boolean(busyAction)}
                onClick={() => runExport(action)}
              >
                <ListItemIcon>
                  {loading ? <CircularProgress size={18} /> : <Icon fontSize="small" />}
                </ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            );
          })}
        </Menu>

        <div className="result-view__secondary-actions">
          <Button
            disabled={Boolean(busyAction)}
            onClick={openDecodedText}
            startIcon={<TextSnippetRounded />}
            variant="outlined"
          >
            {strings.result.showText}
          </Button>
          <Button onClick={scanAgain} startIcon={<QrCodeScannerRounded />} variant="outlined">
            {strings.result.scanAgain}
          </Button>
        </div>

        {shareUrlTooLarge ? (
          <Alert id="share-url-guidance" severity="warning" variant="outlined">
            {strings.result.urlTooLargeGuidance}
          </Alert>
        ) : null}

        {showDesktopSharePreview ? (
          <Paper
            aria-label={strings.result.copiedUrlPreview}
            className="result-view__desktop-share"
            elevation={0}
            role="status"
          >
            <Stack className="result-view__copied-url" spacing={1}>
              <Typography color="text.secondary" variant="overline">
                {strings.result.copiedUrl}
              </Typography>
              <Chip
                className="result-view__url-pill"
                icon={<ContentCopyRounded />}
                label={copiedShareUrl}
                variant="outlined"
              />
            </Stack>
            {shareUrlSvg ? (
              <div
                aria-label={strings.result.shareUrlQrAlt}
                className="result-view__share-qr"
                dangerouslySetInnerHTML={{ __html: shareUrlSvg }}
                role="img"
              />
            ) : (
              <div className="result-view__share-qr result-view__share-qr--loading">
                <CircularProgress aria-label={strings.result.generatingShareUrlQr} size={24} />
              </div>
            )}
          </Paper>
        ) : null}
      </Stack>

      <Drawer
        anchor="bottom"
        onClose={() => setTextOpen(false)}
        open={textOpen && useTextBottomSheet}
        slotProps={{
          paper: {
            'aria-labelledby': decodedTextTitleId,
            className: 'result-view__text-sheet',
            role: 'dialog',
          },
        }}
      >
        <div aria-hidden="true" className="result-view__sheet-handle" />
        <Stack
          alignItems="center"
          className="result-view__sheet-header"
          direction="row"
          justifyContent="space-between"
          spacing={2}
        >
          {decodedPanelHeading}
          <IconButton aria-label={strings.result.closeText} onClick={() => setTextOpen(false)}>
            <CloseRounded />
          </IconButton>
        </Stack>
        <div className="result-view__sheet-content">{decodedPanelBody}</div>
      </Drawer>

      <Dialog
        aria-labelledby={decodedTextTitleId}
        fullWidth
        maxWidth="sm"
        onClose={() => setTextOpen(false)}
        open={textOpen && !useTextBottomSheet}
      >
        <DialogTitle component="div">{decodedPanelHeading}</DialogTitle>
        <IconButton
          aria-label={strings.result.closeText}
          className="result-view__dialog-close"
          onClick={() => setTextOpen(false)}
        >
          <CloseRounded />
        </IconButton>
        <DialogContent>{decodedPanelBody}</DialogContent>
      </Dialog>

      <Snackbar autoHideDuration={2800} onClose={() => setMessage('')} open={Boolean(message)}>
        <Alert severity="success" variant="filled">
          {message}
        </Alert>
      </Snackbar>
      <Snackbar autoHideDuration={4200} onClose={() => setError('')} open={Boolean(error)}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </section>
  );
}
