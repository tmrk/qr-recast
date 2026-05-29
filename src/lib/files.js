import FileSaver from 'file-saver';

const { saveAs } = FileSaver;

export function canShareFiles(files) {
  return Boolean(navigator.canShare?.({ files }));
}

export async function shareOrSaveBlob({ blob, fileName, title }) {
  const file = new File([blob], fileName, { type: blob.type });

  if (navigator.share && canShareFiles([file])) {
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (error) {
      if (isShareCancelled(error)) {
        return 'cancelled';
      }

      throw error;
    }
  }

  saveAs(blob, fileName);
  return 'saved';
}

export async function shareOrCopyUrl(url, { useNativeShare = false } = {}) {
  if (useNativeShare && navigator.share) {
    try {
      await navigator.share({ url });
      return 'shared';
    } catch (error) {
      if (isShareCancelled(error)) {
        return 'cancelled';
      }

      throw error;
    }
  }

  await navigator.clipboard.writeText(url);
  return 'copied';
}

export function statusToMessage(status, strings) {
  if (status === 'shared') {
    return strings.shared;
  }

  if (status === 'saved') {
    return strings.saved;
  }

  if (status === 'copied') {
    return strings.copied;
  }

  return strings.cancelled;
}

function isShareCancelled(error) {
  return error instanceof DOMException && ['AbortError', 'NotAllowedError'].includes(error.name);
}
