import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileStorageService } from '../../common/services/file-storage.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import {
  getMediaType,
  isImage,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_AUDIO_TYPES,
  MAX_FILE_SIZES,
} from './helpers/file-type.helper';
import { processImage, getImageMetadata } from './helpers/image-processor.helper';
import { MediaType } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private fileStorage: FileStorageService,
  ) {}

  async upload(file: Express.Multer.File, dto: UploadMediaDto, userId: string) {
    // Validate file type
    this.validateFileType(file.mimetype);

    // Validate file size
    this.validateFileSize(file.mimetype, file.size);

    // Upload original file
    const folder = dto.folderId || 'media';
    const { url, key } = await this.fileStorage.uploadFile(file, folder);

    // Process image if applicable
    let thumbnailUrl: string | null = null;
    let width: number | null = null;
    let height: number | null = null;
    let metadata: Record<string, any> = {};

    if (isImage(file.mimetype)) {
      try {
        const processed = await processImage(file.buffer, {
          convertToWebp: true,
          sizes: ['thumbnail', 'small', 'medium'],
        });

        width = processed.original.width;
        height = processed.original.height;
        metadata = await getImageMetadata(file.buffer);

        // Upload thumbnail variant
        if (processed.variants.thumbnail) {
          const thumbKey = `${folder}/thumbnails/${key.split('/').pop()}`;
          const thumbResult = await this.fileStorage.uploadBuffer(
            processed.variants.thumbnail.buffer,
            thumbKey,
            'image/webp',
          );
          thumbnailUrl = thumbResult.url;
        }
      } catch (error) {
        console.error('Image processing failed:', error);
        // Continue without processing
      }
    }

    // Create media record
    const media = await this.prisma.media.create({
      data: {
        originalName: file.originalname,
        fileName: key,
        mimeType: file.mimetype,
        size: file.size,
        width,
        height,
        url,
        thumbnailUrl,
        alt: dto.alt,
        caption: dto.caption,
        credit: dto.credit,
        type: getMediaType(file.mimetype),
        metadata,
        uploaderId: userId,
        articleId: dto.articleId,
        folderId: dto.folderId,
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return media;
  }

  async findAll(query: {
    type?: MediaType;
    articleId?: string;
    folderId?: string;
    page?: number;
    limit?: number;
  }) {
    const { type, articleId, folderId, page = 1, limit = 20 } = query;

    const where: any = {};
    if (type) where.type = type;
    if (articleId) where.articleId = articleId;
    if (folderId) where.folderId = folderId;

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        include: {
          uploader: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data: media,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true },
        },
        article: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async update(id: string, dto: UpdateMediaDto) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return this.prisma.media.update({
      where: { id },
      data: {
        ...(dto.alt !== undefined && { alt: dto.alt }),
        ...(dto.caption !== undefined && { caption: dto.caption }),
        ...(dto.credit !== undefined && { credit: dto.credit }),
        ...(dto.folderId !== undefined && { folderId: dto.folderId }),
      },
    });
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Delete from storage
    try {
      await this.fileStorage.deleteFile(media.fileName);
      if (media.thumbnailUrl) {
        // Extract key from URL and delete thumbnail
        const thumbKey = media.thumbnailUrl.split('/').slice(-2).join('/');
        await this.fileStorage.deleteFile(thumbKey);
      }
    } catch (error) {
      console.error('Failed to delete file from storage:', error);
    }

    // Delete from database
    await this.prisma.media.delete({ where: { id } });

    return { message: 'Media deleted successfully' };
  }

  async getFolders() {
    return this.prisma.mediaFolder.findMany({
      include: {
        _count: {
          select: { media: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createFolder(name: string, parentId?: string) {
    return this.prisma.mediaFolder.create({
      data: { name, parentId },
    });
  }

  private validateFileType(mimeType: string) {
    const allowedTypes = [
      ...ALLOWED_IMAGE_TYPES,
      ...ALLOWED_VIDEO_TYPES,
      ...ALLOWED_AUDIO_TYPES,
      'application/pdf',
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(`File type ${mimeType} is not allowed`);
    }
  }

  private validateFileSize(mimeType: string, size: number) {
    const mediaType = getMediaType(mimeType);
    const maxSize = MAX_FILE_SIZES[mediaType];

    if (size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }
  }
}
