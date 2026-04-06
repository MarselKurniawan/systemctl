/**
 * External file storage utility
 * Uploads files to storage9018-prev-bhox.bantuanhukumonline.com
 */

const STORAGE_BASE_URL = 'https://storage9018-prev-bhox.bantuanhukumonline.com';
const UPLOAD_ENDPOINT = `${STORAGE_BASE_URL}/upload.php`;

interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

/**
 * Upload a file to external storage
 * @param file - File to upload
 * @param folderId - Folder/category for organization (e.g. consultation ID)
 */
export async function uploadToExternalStorage(
  file: File,
  folderId: string = 'general'
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('property_id', folderId);

  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Upload gagal',
    };
  }
}

export { STORAGE_BASE_URL };
