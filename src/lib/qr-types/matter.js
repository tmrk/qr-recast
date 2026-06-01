const base38Alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-.';
const base38ChunkLengths = Object.freeze([2, 4, 5]);
const matterStandardFlow = 0;
const matterMaximumSetupPin = 0x5f5e0fe;
const verhoeffMultiplication = Object.freeze([
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]);
const verhoeffPermutation = Object.freeze([
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]);
const verhoeffInverse = Object.freeze([0, 4, 3, 2, 1, 5, 6, 7, 8, 9]);

export function parseMatterQrPayload(raw) {
  const match = String(raw ?? '')
    .trim()
    .match(/^MT:([0-9A-Z.-]+)(?:\*[0-9A-Z.-]+)*$/i);

  if (!match) {
    return null;
  }

  try {
    const decodedBytes = decodeBase38(match[1].toUpperCase());

    if (decodedBytes.length < 11) {
      return null;
    }

    const reader = createBitReader(decodedBytes);
    const version = reader.read(3);
    const vendorId = reader.read(16);
    const productId = reader.read(16);
    const flow = reader.read(2);
    const discovery = reader.read(8);
    const discriminator = reader.read(12);
    const pincode = reader.read(27);
    const padding = reader.read(4);

    if (
      reader.invalid ||
      version !== 0 ||
      padding !== 0 ||
      pincode < 1 ||
      pincode > matterMaximumSetupPin
    ) {
      return null;
    }

    return {
      discovery,
      discriminator,
      flow,
      manualCode: createMatterManualCode({ discriminator, flow, pincode, productId, vendorId }),
      pincode,
      productId,
      vendorId,
      version,
    };
  } catch {
    return null;
  }
}

export function formatMatterManualCode(code) {
  const digits = String(code ?? '').replace(/\D/g, '');

  if (digits.length === 11) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 21) {
    return [
      digits.slice(0, 4),
      digits.slice(4, 7),
      digits.slice(7, 11),
      digits.slice(11, 16),
      digits.slice(16),
    ].join('-');
  }

  return digits;
}

function decodeBase38(input) {
  const bytes = [];

  for (let index = 0; index < input.length; index += 5) {
    const charactersInChunk = Math.min(5, input.length - index);
    const bytesInChunk = base38ChunkLengths.indexOf(charactersInChunk) + 1;

    if (bytesInChunk < 1) {
      throw new Error('Invalid Matter Base-38 length.');
    }

    let value = 0;

    for (
      let characterIndex = index + charactersInChunk - 1;
      characterIndex >= index;
      characterIndex -= 1
    ) {
      const characterValue = base38Alphabet.indexOf(input[characterIndex]);

      if (characterValue < 0) {
        throw new Error('Invalid Matter Base-38 character.');
      }

      value = value * base38Alphabet.length + characterValue;
    }

    for (let byteIndex = 0; byteIndex < bytesInChunk; byteIndex += 1) {
      bytes.push(value & 0xff);
      value = Math.floor(value / 256);
    }

    if (value > 0) {
      throw new Error('Invalid Matter Base-38 chunk.');
    }
  }

  return bytes;
}

function createBitReader(bytes) {
  let offset = 0;

  return {
    invalid: false,
    read(length) {
      const nextOffset = offset + length;

      if (nextOffset > bytes.length * 8) {
        this.invalid = true;
        return 0;
      }

      let value = 0;

      for (let bitsRead = 0; bitsRead < length; bitsRead += 1) {
        const bitIndex = offset + bitsRead;

        if (bytes[Math.floor(bitIndex / 8)] & (1 << (bitIndex % 8))) {
          value += 2 ** bitsRead;
        }
      }

      offset = nextOffset;

      return value;
    },
  };
}

function createMatterManualCode({ discriminator, flow, pincode, productId, vendorId }) {
  const shortDiscriminator = discriminator >> 8;
  const hasVendorProduct = flow !== matterStandardFlow;
  const chunk1 = ((shortDiscriminator >> 2) & 0x3) | (hasVendorProduct ? 0x4 : 0);
  const chunk2 = ((shortDiscriminator & 0x3) << 14) | (pincode & 0x3fff);
  const chunk3 = (pincode >> 14) & 0x1fff;
  let payload = `${chunk1}${padNumber(chunk2, 5)}${padNumber(chunk3, 4)}`;

  if (hasVendorProduct) {
    payload = `${payload}${padNumber(vendorId, 5)}${padNumber(productId, 5)}`;
  }

  return `${payload}${calculateVerhoeffCheckDigit(payload)}`;
}

function padNumber(value, length) {
  return String(value).padStart(length, '0');
}

function calculateVerhoeffCheckDigit(value) {
  const digits = String(value);
  let checksum = 0;

  for (let index = 0; index < digits.length; index += 1) {
    const digit = Number(digits[digits.length - 1 - index]);
    checksum = verhoeffMultiplication[checksum][verhoeffPermutation[(index + 1) % 8][digit]];
  }

  return verhoeffInverse[checksum];
}
