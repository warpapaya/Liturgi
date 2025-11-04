import * as Minio from 'minio'

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'clearline-uploads'
const URL_EXPIRY = 60 * 60 // 1 hour in seconds

export interface UploadResult {
  path: string
  url: string
}

// Ensure bucket exists
export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET_NAME)
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
  }
}

// Generate a pre-signed URL for uploading
export async function getUploadUrl(
  orgId: string,
  folder: 'people' | 'services' | 'groups',
  fileName: string
): Promise<{ uploadUrl: string; path: string }> {
  await ensureBucket()

  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `${orgId}/${folder}/${Date.now()}-${sanitizedFileName}`

  const uploadUrl = await minioClient.presignedPutObject(BUCKET_NAME, path, URL_EXPIRY)

  return { uploadUrl, path }
}

// Generate a pre-signed URL for downloading
export async function getDownloadUrl(path: string): Promise<string> {
  await ensureBucket()
  return minioClient.presignedGetObject(BUCKET_NAME, path, URL_EXPIRY)
}

// Upload a file directly (for server-side uploads)
export async function uploadFile(
  orgId: string,
  folder: 'people' | 'services' | 'groups',
  fileName: string,
  buffer: Buffer,
  contentType?: string
): Promise<UploadResult> {
  await ensureBucket()

  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `${orgId}/${folder}/${Date.now()}-${sanitizedFileName}`

  const metadata = contentType ? { 'Content-Type': contentType } : {}

  await minioClient.putObject(BUCKET_NAME, path, buffer, buffer.length, metadata)

  const url = await getDownloadUrl(path)

  return { path, url }
}

// Delete a file
export async function deleteFile(path: string): Promise<void> {
  await ensureBucket()
  await minioClient.removeObject(BUCKET_NAME, path)
}

// List files in a folder
export async function listFiles(orgId: string, folder: string): Promise<string[]> {
  await ensureBucket()

  const prefix = `${orgId}/${folder}/`
  const objects: string[] = []

  const stream = minioClient.listObjects(BUCKET_NAME, prefix, true)

  return new Promise((resolve, reject) => {
    stream.on('data', (obj) => {
      if (obj.name) objects.push(obj.name)
    })
    stream.on('error', reject)
    stream.on('end', () => resolve(objects))
  })
}

export { minioClient, BUCKET_NAME }
