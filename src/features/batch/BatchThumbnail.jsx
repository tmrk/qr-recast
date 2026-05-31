import { CircularProgress } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { createQrSvg } from '../../lib/qr.js';
import { createDecoratedQrSvg } from '../branding/decorator.js';
import { strings } from '../../strings.js';

/**
 * @param {{ item: { id: string, payload: string, type: object, branding: { enabled: boolean } } }} props
 */
export function BatchThumbnail({ item }) {
  const [thumbnailState, setThumbnailState] = useState({ id: '', svg: '' });
  const svgString = thumbnailState.id === item.id ? thumbnailState.svg : '';
  const brandingEnabled = item.branding?.enabled !== false;
  const typeKey = useMemo(() => JSON.stringify(item.type), [item.type]);

  useEffect(() => {
    let active = true;

    createQrSvg(item.payload)
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
  }, [brandingEnabled, item.id, item.payload, item.type, typeKey]);

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
