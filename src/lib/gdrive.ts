
'use server';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const BACKUP_FILENAME = 'ss_cargo_backup.json';

async function getFileId(accessToken: string): Promise<string | null> {
    const response = await fetch(`${DRIVE_API_URL}/files?q=name='${BACKUP_FILENAME}' and 'root' in parents and trashed=false&spaces=drive&fields=files(id,name)`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to search for file: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.files.length > 0 ? data.files[0].id : null;
}

async function createFile(accessToken: string, content: string): Promise<any> {
    const metadata = {
        name: BACKUP_FILENAME,
        mimeType: 'application/json',
        parents: ['root'],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));

    const response = await fetch(`${DRIVE_UPLOAD_URL}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create file: ${errorData.error.message}`);
    }

    return response.json();
}

async function updateFile(accessToken: string, fileId: string, content: string): Promise<any> {
    const response = await fetch(`${DRIVE_UPLOAD_URL}/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: content,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update file: ${errorData.error.message}`);
    }

    return response.json();
}

export async function saveToGoogleDrive(accessToken: string, content: string) {
    if (!accessToken) {
        throw new Error('Access token is required.');
    }
    
    try {
        const fileId = await getFileId(accessToken);
        
        if (fileId) {
            // File exists, so update it
            return await updateFile(accessToken, fileId, content);
        } else {
            // File does not exist, create it
            return await createFile(accessToken, content);
        }
    } catch (error) {
        console.error('Error saving to Google Drive:', error);
        throw error;
    }
}
