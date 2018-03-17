export function humanize(str) {
  return str
    .replace(/^[\s_]+|[\s_]+$/g, '')
    .replace(/[_\s]+/g, ' ')
    .replace(/^[a-z]/, function (m) { return m.toUpperCase();});
}

export function getFileName(originName) {
  const name = originName.replace(/\.[^/.]+$/, '');

  return humanize(name);
}

export function getFileSize(bytesSize, decimalPoint) {
  const bytes = bytesSize;

  if (bytes === 0) return '0 Bytes';

  const k = 1000;
  const dm = decimalPoint || 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileFormat(name) {
  const format = (/[.]/.exec(name)) ? /[^.]+$/.exec(name) : 'not identified';

  return format;
}
