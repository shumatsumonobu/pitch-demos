/**
 * Minimal iconv-lite shim for Cloudflare Workers.
 * Workers 環境では Node.js streams が完全に動作しないため、
 * iconv-lite の streams 読み込みで TypeError が発生する。
 * body-parser → raw-body → iconv-lite の依存チェーンを壊さずに
 * streams 依存だけ回避するための最小スタブ。
 */
const encodings = new Set([
  'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'hex',
  'utf16le', 'ucs2', 'ucs-2', 'latin1', 'iso-8859-1',
]);

export function encodingExists(encoding) {
  return encodings.has(String(encoding).toLowerCase().replace(/[^a-z0-9-]/g, ''));
}

export function getDecoder(encoding) {
  return {
    write(buf) {
      return typeof buf === 'string' ? buf : buf.toString(encoding || 'utf-8');
    },
    end() {
      return '';
    },
  };
}

export function getEncoder(encoding) {
  return {
    write(str) {
      return Buffer.from(str, encoding || 'utf-8');
    },
    end() {
      return Buffer.alloc(0);
    },
  };
}
