export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

const MIME_TYPES: Record<string, MediaType> = {
  // Images
  'image/jpeg': MediaType.IMAGE,
  'image/png': MediaType.IMAGE,
  'image/webp': MediaType.IMAGE,
  'image/gif': MediaType.IMAGE,
  'image/svg+xml': MediaType.IMAGE,
  // Videos
  'video/mp4': MediaType.VIDEO,
  'video/webm': MediaType.VIDEO,
  'video/ogg': MediaType.VIDEO,
  // Audio
  'audio/mpeg': MediaType.AUDIO,
  'audio/wav': MediaType.AUDIO,
  'audio/ogg': MediaType.AUDIO,
  // Documents
  'application/pdf': MediaType.DOCUMENT,
  'application/msword': MediaType.DOCUMENT,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': MediaType.DOCUMENT,
};

export function getMediaType(mimeType: string): MediaType {
  return MIME_TYPES[mimeType] || MediaType.DOCUMENT;
}

export function isImage(mimeType: string): boolean {
  return getMediaType(mimeType) === MediaType.IMAGE;
}

export function isVideo(mimeType: string): boolean {
  return getMediaType(mimeType) === MediaType.VIDEO;
}

export function isAudio(mimeType: string): boolean {
  return getMediaType(mimeType) === MediaType.AUDIO;
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword'];

export const MAX_FILE_SIZES = {
  [MediaType.IMAGE]: 10 * 1024 * 1024, // 10MB
  [MediaType.VIDEO]: 100 * 1024 * 1024, // 100MB
  [MediaType.AUDIO]: 20 * 1024 * 1024, // 20MB
  [MediaType.DOCUMENT]: 20 * 1024 * 1024, // 20MB
};
