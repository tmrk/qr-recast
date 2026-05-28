import CameraswitchRounded from '@mui/icons-material/CameraswitchRounded';
import FlashlightOffRounded from '@mui/icons-material/FlashlightOffRounded';
import FlashlightOnRounded from '@mui/icons-material/FlashlightOnRounded';
import PhotoLibraryRounded from '@mui/icons-material/PhotoLibraryRounded';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import QrCodeScannerRounded from '@mui/icons-material/QrCodeScannerRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import { Box, Button, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { decodeImageFile, decodeVideoFrame } from '../../lib/decode.js';
import { strings } from '../../strings.js';

const CAMERA_CONSTRAINTS = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
};

const statusCopy = {
  idle: {
    title: strings.camera.idleTitle,
    body: strings.camera.idleBody,
  },
  pending: {
    title: strings.camera.pendingTitle,
    body: strings.camera.pendingBody,
  },
  denied: {
    title: strings.camera.deniedTitle,
    body: strings.camera.deniedBody,
  },
  unsupported: {
    title: strings.camera.unsupportedTitle,
    body: strings.camera.unsupportedBody,
  },
  error: {
    title: strings.camera.errorTitle,
    body: strings.camera.errorBody,
  },
};

/**
 * @param {{ onDetected: (text: string) => void }} props
 */
export function Viewfinder({ onDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const detectedRef = useRef(false);
  const decodingRef = useRef(false);

  const [status, setStatus] = useState('idle');
  const [facingMode, setFacingMode] = useState('environment');
  const [canFlip, setCanFlip] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [detected, setDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setTorchAvailable(false);
    setTorchOn(false);
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setCanFlip(false);
      return;
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    setCanFlip(devices.filter((device) => device.kind === 'videoinput').length > 1);
  }, []);

  const handleDetected = useCallback(
    (text) => {
      if (!text || detectedRef.current) {
        return;
      }

      detectedRef.current = true;
      setDetected(true);
      navigator.vibrate?.(15);

      window.setTimeout(() => {
        stopStream();
        onDetected(text);
      }, 250);
    },
    [onDetected, stopStream],
  );

  const startCamera = useCallback(
    async (nextFacingMode = facingMode) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported');
        return;
      }

      setStatus('pending');
      setErrorMessage('');
      setDetected(false);
      detectedRef.current = false;
      stopStream();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            ...CAMERA_CONSTRAINTS,
            facingMode: { ideal: nextFacingMode },
          },
        });
        const video = videoRef.current;
        streamRef.current = stream;

        if (video) {
          video.srcObject = stream;
          await video.play();
        }

        const track = stream.getVideoTracks()[0];
        const capabilities = track?.getCapabilities?.() ?? {};

        setFacingMode(nextFacingMode);
        setTorchAvailable(Boolean(capabilities.torch));
        setStatus('ready');
        await refreshDevices();
      } catch (error) {
        stopStream();
        setErrorMessage(error instanceof Error ? error.message : '');
        setStatus(isPermissionError(error) ? 'denied' : 'error');
      }
    },
    [facingMode, refreshDevices, stopStream],
  );

  const handleFlip = useCallback(() => {
    const nextFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextFacingMode);
  }, [facingMode, startCamera]);

  const handleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];

    if (!track?.applyConstraints) {
      setTorchAvailable(false);
      return;
    }

    const nextTorchState = !torchOn;

    try {
      await track.applyConstraints({ advanced: [{ torch: nextTorchState }] });
      setTorchOn(nextTorchState);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : strings.camera.torchError);
      setTorchAvailable(false);
    }
  }, [torchOn]);

  const handleUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file) {
        return;
      }

      setStatus('pending');
      setErrorMessage('');
      setDetected(false);
      detectedRef.current = false;

      try {
        const result = await decodeImageFile(file);

        if (result?.data) {
          handleDetected(result.data);
          return;
        }

        setErrorMessage(strings.camera.noCode);
        setStatus(streamRef.current ? 'ready' : 'idle');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : strings.camera.uploadError);
        setStatus('error');
      }
    },
    [handleDetected],
  );

  useEffect(() => {
    if (status !== 'ready') {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      if (decodingRef.current || detectedRef.current) {
        return;
      }

      decodingRef.current = true;

      try {
        const result = await decodeVideoFrame(videoRef.current, canvasRef.current);

        if (result?.data) {
          handleDetected(result.data);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : strings.camera.errorBody);
        setStatus('error');
      } finally {
        decodingRef.current = false;
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [handleDetected, status]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopStream();
        setStatus((currentStatus) => (currentStatus === 'ready' ? 'idle' : currentStatus));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stopStream]);

  useEffect(() => () => stopStream(), [stopStream]);

  const showStatusPanel = status !== 'ready' && !detected;
  const copy = statusCopy[status] ?? statusCopy.error;

  return (
    <section className="viewfinder" aria-label={strings.camera.viewfinderLabel}>
      <video ref={videoRef} autoPlay className="viewfinder__video" muted playsInline />
      <canvas ref={canvasRef} className="viewfinder__canvas" />

      {status === 'ready' || detected ? (
        <Box
          className={
            detected ? 'viewfinder__frame viewfinder__frame--detected' : 'viewfinder__frame'
          }
        >
          <span className="viewfinder__corner viewfinder__corner--top-left" />
          <span className="viewfinder__corner viewfinder__corner--top-right" />
          <span className="viewfinder__corner viewfinder__corner--bottom-left" />
          <span className="viewfinder__corner viewfinder__corner--bottom-right" />
          <span className="viewfinder__sweep" />
          <QrCodeScannerRounded className="viewfinder__detected-icon" />
        </Box>
      ) : null}

      {status === 'ready' ? (
        <Typography className="viewfinder__hint" variant="body1">
          {strings.camera.hint}
        </Typography>
      ) : null}

      {showStatusPanel ? (
        <Paper className="viewfinder__status" elevation={0}>
          <QrCodeScannerRounded color="primary" fontSize="large" />
          <Stack spacing={1}>
            <Typography component="h1" variant="h2">
              {copy.title}
            </Typography>
            <Typography color="text.secondary">{errorMessage || copy.body}</Typography>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1.25}>
            {status !== 'pending' && status !== 'unsupported' ? (
              <Button
                onClick={() => startCamera()}
                startIcon={<PlayArrowRounded />}
                variant="contained"
              >
                {strings.camera.start}
              </Button>
            ) : null}
            <Button
              onClick={() => fileInputRef.current?.click()}
              startIcon={<PhotoLibraryRounded />}
              variant="outlined"
            >
              {strings.camera.upload}
            </Button>
          </Stack>
          <Stack alignItems="center" className="viewfinder__privacy" direction="row" spacing={1}>
            <ShieldRounded color="primary" fontSize="small" />
            <Typography color="text.secondary" variant="body2">
              {strings.privacyNote}
            </Typography>
          </Stack>
        </Paper>
      ) : null}

      {status === 'ready' ? (
        <Stack className="viewfinder__controls" direction="row" spacing={1}>
          {torchAvailable ? (
            <Tooltip title={torchOn ? strings.camera.torchOff : strings.camera.torchOn}>
              <IconButton
                aria-label={torchOn ? strings.camera.torchOff : strings.camera.torchOn}
                onClick={handleTorch}
              >
                {torchOn ? <FlashlightOffRounded /> : <FlashlightOnRounded />}
              </IconButton>
            </Tooltip>
          ) : null}
          {canFlip ? (
            <Tooltip title={strings.camera.flip}>
              <IconButton aria-label={strings.camera.flip} onClick={handleFlip}>
                <CameraswitchRounded />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title={strings.camera.upload}>
            <IconButton
              aria-label={strings.camera.upload}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoLibraryRounded />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : null}

      <input
        ref={fileInputRef}
        accept="image/*"
        aria-label={strings.camera.upload}
        className="viewfinder__file"
        onChange={handleUpload}
        type="file"
      />
    </section>
  );
}

function isPermissionError(error) {
  return (
    error instanceof DOMException &&
    ['NotAllowedError', 'PermissionDeniedError'].includes(error.name)
  );
}
