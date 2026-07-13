import sharp, { Sharp } from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface ImageSizes {
  thumbnail: { width: 150; height: 150 };
  small: { width: 300; height: null };
  medium: { width: 600; height: null };
  large: { width: 1200; height: null };
}

const IMAGE_SIZES: ImageSizes = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: null },
  medium: { width: 600, height: null },
  large: { width: 1200, height: null },
};

export async function processImage(
  buffer: Buffer,
  options: {
    convertToWebp?: boolean;
    quality?: number;
    sizes?: (keyof ImageSizes)[];
  } = {},
): Promise<{
  original: ProcessedImage;
  variants: Record<string, ProcessedImage>;
}> {
  const { convertToWebp = true, quality = 80, sizes = ['thumbnail', 'small', 'medium'] } = options;

  // Get original image info
  const originalInfo = await sharp(buffer).metadata();

  // Process original
  let originalBuffer = buffer;
  let format = originalInfo.format;

  if (convertToWebp && format !== 'webp') {
    originalBuffer = await sharp(buffer).webp({ quality }).toBuffer();
    format = 'webp';
  }

  const original: ProcessedImage = {
    buffer: originalBuffer,
    width: originalInfo.width,
    height: originalInfo.height,
    format,
    size: originalBuffer.length,
  };

  // Generate variants
  const variants: Record<string, ProcessedImage> = {};

  for (const sizeName of sizes) {
    const sizeConfig = IMAGE_SIZES[sizeName];
    let variantBuffer: Sharp = sharp(buffer).resize({
      width: sizeConfig.width,
      height: sizeConfig.height ?? undefined,
      fit: sizeConfig.height ? 'cover' : 'inside',
      withoutEnlargement: true,
    });

    if (convertToWebp) {
      variantBuffer = variantBuffer.webp({ quality });
    }

    const variantResult = await variantBuffer.toBuffer();
    const variantInfo = await sharp(variantResult).metadata();

    variants[sizeName] = {
      buffer: variantResult,
      width: variantInfo.width,
      height: variantInfo.height,
      format: convertToWebp ? 'webp' : variantInfo.format,
      size: variantResult.length,
    };
  }

  return { original, variants };
}

export async function generateBlurhash(buffer: string): Promise<string> {
  // Placeholder - implement blurhash generation if needed
  return '';
}

export async function getImageMetadata(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    hasAlpha: metadata.hasAlpha,
    density: metadata.density,
  };
}
