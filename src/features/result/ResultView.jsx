import ArticleRounded from '@mui/icons-material/ArticleRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import ImageRounded from '@mui/icons-material/ImageRounded';
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
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  createDocxExport,
  createPdfExport,
  createPngExport,
  createSvgExport,
} from '../../lib/exporters.js';
import { shareOrCopyUrl, shareOrSaveBlob, statusToMessage } from '../../lib/files.js';
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
  const urlActionStyle = urlActionCopied
    ? {
        backgroundColor: 'var(--qr-palette-success-main)',
        color: 'var(--qr-palette-success-contrastText)',
      }
    : undefined;
  const showDesktopSharePreview = Boolean(
    !hasCoarsePointer && copiedShareUrl && copiedShareUrl === shareUrl && !shareUrlTooLarge,
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

  async function runExport(action) {
    if (!svgString || !fileStem) {
      return;
    }

    await runBusyAction(action.format, async () => {
      const blob = await action.createBlob(svgString);
      const exportBlob = blob.type ? blob : new Blob([blob], { type: action.mime });
      const status = await shareOrSaveBlob({
        blob: exportBlob,
        fileName: `${fileStem}.${action.format}`,
        title: strings.appName,
      });

      setMessage(statusToMessage(status, strings.result));
    });
  }

  async function runShareUrl() {
    if (!shareUrl) {
      return;
    }

    if (shareUrlTooLarge) {
      setError(strings.result.urlTooLarge);
      return;
    }

    await runBusyAction('url', async () => {
      const status = await shareOrCopyUrl(shareUrl, { useNativeShare: canShareUrlNatively });
      if (status === 'copied') {
        setCopiedShareUrlState({ text, url: shareUrl });
      }

      setMessage(statusToMessage(status, strings.result));
    });
  }

  async function runBusyAction(actionName, work) {
    setError('');
    setMessage('');

    const timer = window.setTimeout(() => setBusyAction(actionName), 150);

    try {
      await work();
    } catch {
      setError(strings.result.exportError);
    } finally {
      window.clearTimeout(timer);
      setBusyAction('');
    }
  }

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
          <IconButton aria-label={strings.result.scanAgain} onClick={onScanAgain}>
            <QrCodeScannerRounded />
          </IconButton>
        </Stack>

        <Paper className="result-view__qr-card" elevation={0}>
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
            onClick={() => setTextOpen(true)}
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

        <Button onClick={onScanAgain} startIcon={<QrCodeScannerRounded />} variant="outlined">
          {strings.result.scanAgain}
        </Button>
      </Stack>

      <Dialog fullWidth maxWidth="sm" onClose={() => setTextOpen(false)} open={textOpen}>
        <DialogTitle>{strings.result.decodedText}</DialogTitle>
        <IconButton
          aria-label={strings.result.closeText}
          className="result-view__dialog-close"
          onClick={() => setTextOpen(false)}
        >
          <CloseRounded />
        </IconButton>
        <DialogContent>
          <pre className="result-view__payload">
            <code>{payloadPreview}</code>
          </pre>
        </DialogContent>
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
