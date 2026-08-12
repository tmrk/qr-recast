import { CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { createQrSvg } from '../../lib/qr.js';
import { createDecoratedQrSvg } from '../branding/decorator.js';
import { strings } from '../../strings.js';

/**
 * @param {{ item: { id: string, payload: string, version?: number, modulesGrid?: boolean[][], maskPattern?: number, errorCorrectionLevel?: string, type: object, branding: { enabled: boolean } } }} props
 */
export function BatchThumbnail({ item }) {
  const [thumbnailState, setThumbnailState] = useState({ id: '', svg: '' });
  const svgString = thumbnailState.id === item.id ? thumbnailState.svg : '';
  const brandingEnabled = item.branding?.enabled !== false;
  const typeKey = useMemo(() => JSON.stringify(item.type), [item.type]);

  useEffect(() => {
    let active = true;

    let qrInput = item.payload;
    if (Array.isArray(item.modulesGrid) && item.modulesGrid.length) {
      qrInput = { text: item.payload, version: item.version, modulesGrid: item.modulesGrid };
    } else if (item.version != null || item.maskPattern != null || item.errorCorrectionLevel) {
      qrInput = {
        text: item.payload,
        version: item.version,
        maskPattern: item.maskPattern,
        errorCorrectionLevel: item.errorCorrectionLevel,
      };
    }
    createQrSvg(qrInput)
      .then((canonicalSvg) => {
        if (!active) {
          return;
        }

        setThumbnailState({
          id: item.id,
          svg: createDecoratedQrSvg(canonicalSvg, item.type, { enabled: brandingEnabled }),
        });
      })
      .catch(() => {
        if (active) {
          setThumbnailState({ id: item.id, svg: '' });
        }
      });

    return () => {
      active = false;
    };
  }, [
    brandingEnabled,
    item.id,
    item.payload,
    item.type,
    item.version,
    item.modulesGrid,
    item.maskPattern,
    item.errorCorrectionLevel,
    typeKey,
  ]);

  return (
    <div aria-label={strings.batch.thumbnail} className="batch-panel__thumbnail" role="img">
      {svgString ? (
        <span dangerouslySetInnerHTML={{ __html: svgString }} />
      ) : (
        <CircularProgress aria-label={strings.result.generating} size={20} />
      )}
    </div>
  );
}
