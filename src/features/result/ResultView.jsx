import ArticleRounded from '@mui/icons-material/ArticleRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import ImageRounded from '@mui/icons-material/ImageRounded';
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded';
import PictureAsPdfRounded from '@mui/icons-material/PictureAsPdfRounded';
import QrCodeScannerRounded from '@mui/icons-material/QrCodeScannerRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import TextSnippetRounded from '@mui/icons-material/TextSnippetRounded';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { trackAnalyticsEvent } from '../analytics/events.js';
import {
  createDocxExport,
  createPdfExport,
  createPngExport,
  createSvgExport,
} from '../../lib/exporters.js';
import { shareOrCopyUrl, shareOrSaveBlob, statusToMessage } from '../../lib/files.js';
import { detectPayloadKind, extractPayloadUrl } from '../../lib/payload.js';
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

/**
 * @param {{ onScanAgain: () => void, text: string }} props
 */
export function ResultView({ onScanAgain, text }) {
  const [svgString, setSvgString] = useState('');
  const [fileStem, setFileStem] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [textOpen, setTextOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [shareUrlState, setShareUrlState] = useState({ text: '', url: '' });
  const [copiedShareUrlState, setCopiedShareUrlState] = useState({ text: '', url: '' });
  const [shareUrlSvgState, setShareUrlSvgState] = useState({ url: '', svg: '' });
  const [copiedDecodedText, setCopiedDecodedText] = useState('');
  const [qrCopyPressing, setQrCopyPressing] = useState(false);
  const qrCopyTimerRef = useRef(0);
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');

  useEffect(() => {
    let active = true;

    Promise.all([createQrSvg(text), hashTextPrefix(text)])
      .then(([svg, hash]) => {
        if (!active) {
          return;
        }

        setSvgString(svg);
        setFileStem(`qr-recast-${hash}`);
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
  const payloadKind = useMemo(() => detectPayloadKind(text), [text]);
  const payloadUrl = useMemo(() => extractPayloadUrl(text), [text]);
  const payloadKindLabel =
    strings.result.payloadKinds[payloadKind] ?? strings.result.payloadKinds.text;
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
      {decodedPayloadBlock}
    </Stack>
  );
  const decodedPanelHeading = (
    <Stack alignItems="center" className="result-view__decoded-heading" direction="row" spacing={1}>
      <Typography component="span" variant="h2">
        {strings.result.decodedText}
      </Typography>
      <Chip className="result-view__kind-chip" label={payloadKindLabel} size="small" />
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
      className={`result-view__qr-card${qrCopyPressing ? ' result-view__qr-card--pressing' : ''}`}
      elevation={0}
      onContextMenu={preventQrContextMenu}
      onPointerCancel={cancelQrCopyPress}
      onPointerDown={startQrCopyPress}
      onPointerLeave={cancelQrCopyPress}
      onPointerUp={cancelQrCopyPress}
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

  return (
    <section className="result-view" aria-labelledby="result-title">
      <Stack className="result-view__stack" spacing={2.5}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
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

        <div className="result-view__actions">
          {exportActions.map((action) => {
            const Icon = action.icon;
            const loading = busyAction === action.format;

            return (
              <Button
                key={action.format}
                disabled={!svgString || Boolean(busyAction)}
                onClick={() => runExport(action)}
                startIcon={loading ? <CircularProgress size={18} /> : <Icon />}
                variant="contained"
              >
                {action.label}
              </Button>
            );
          })}
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
            disabled={Boolean(busyAction)}
            onClick={openDecodedText}
            startIcon={<TextSnippetRounded />}
            variant="contained"
          >
            {strings.result.showText}
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

        <Button onClick={scanAgain} startIcon={<QrCodeScannerRounded />} variant="outlined">
          {strings.result.scanAgain}
        </Button>
      </Stack>

      <Drawer
        anchor="bottom"
        onClose={() => setTextOpen(false)}
        open={textOpen && useTextBottomSheet}
        slotProps={{
          paper: {
            className: 'result-view__text-sheet',
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
