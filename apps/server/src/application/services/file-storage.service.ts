export interface StoreFileInput {
  buffer: Buffer;
  mimeType: string;
  organizationId: string;
}

export interface StoredFile {
  storageKey: string;
}

export interface FileStorageService {
  store(input: StoreFileInput): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
}