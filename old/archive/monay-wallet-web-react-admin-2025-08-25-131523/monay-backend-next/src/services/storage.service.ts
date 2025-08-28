import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import uniqid from 'uniqid';

interface UploadOptions {
  folder?: string;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

class StorageService {
  private s3Client: S3Client;
  private bucketName: string;
  
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET || 'monay-wallet';
  }
  
  async uploadFile(
    file: Buffer | Uint8Array,
    filename: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<string> {
    try {
      let processedFile = file;
      let finalMimeType = mimeType;
      
      if (mimeType.startsWith('image/') && (options.resize || options.format)) {
        const sharpInstance = sharp(file);
        
        if (options.resize) {
          sharpInstance.resize(options.resize.width, options.resize.height, {
            fit: options.resize.fit || 'cover',
          });
        }
        
        if (options.format) {
          sharpInstance.toFormat(options.format, {
            quality: options.quality || 80,
          });
          finalMimeType = `image/${options.format}`;
          filename = filename.replace(/\.[^/.]+$/, `.${options.format}`);
        }
        
        processedFile = await sharpInstance.toBuffer();
      }
      
      const key = options.folder 
        ? `${options.folder}/${uniqid()}-${filename}`
        : `${uniqid()}-${filename}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: processedFile,
        ContentType: finalMimeType,
        ACL: 'private',
      });
      
      await this.s3Client.send(command);
      
      return key;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file');
    }
  }
  
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file');
    }
  }
  
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }
  
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async uploadProfileImage(file: Buffer, userId: string): Promise<string> {
    const filename = `profile-${userId}.webp`;
    
    return this.uploadFile(file, filename, 'image/webp', {
      folder: 'profiles',
      resize: {
        width: 300,
        height: 300,
        fit: 'cover',
      },
      format: 'webp',
      quality: 85,
    });
  }
  
  async uploadKYCDocument(file: Buffer, userId: string, documentType: string): Promise<string> {
    const filename = `kyc-${documentType}-${userId}-${Date.now()}.webp`;
    
    return this.uploadFile(file, filename, 'image/webp', {
      folder: 'kyc-documents',
      format: 'webp',
      quality: 90,
    });
  }
  
  async uploadTransactionReceipt(file: Buffer, transactionId: string): Promise<string> {
    const filename = `receipt-${transactionId}.pdf`;
    
    return this.uploadFile(file, filename, 'application/pdf', {
      folder: 'receipts',
    });
  }
  
  getPublicUrl(key: string): string {
    const cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL;
    
    if (cloudFrontUrl) {
      return `${cloudFrontUrl}/${key}`;
    }
    
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }
}

export const storageService = new StorageService();
export default storageService;