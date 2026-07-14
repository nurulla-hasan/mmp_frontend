'use server';

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

function getDriveClient() {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google Drive credentials are not configured.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

export async function getDriveFolders(parentId?: string) {
  try {
    const drive = getDriveClient();
    const queryParent = parentId || process.env.DRIVE_ROOT_FOLDER_ID;
    
    if (!queryParent) {
      throw new Error("Root folder ID is not configured.");
    }
    
    const response = await drive.files.list({
      q: `'${queryParent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      orderBy: 'name',
    });
    
    return { success: true, folders: response.data.files || [] };
  } catch (error: unknown) {
    console.error("Drive API Error (Folders):", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}

export async function getDriveFiles(folderId: string) {
  try {
    const drive = getDriveClient();
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
      fields: 'files(id, name, thumbnailLink, webContentLink, mimeType, size)',
      orderBy: 'name',
    });
    
    return { success: true, files: response.data.files || [] };
  } catch (error: unknown) {
    console.error("Drive API Error (Files):", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}
