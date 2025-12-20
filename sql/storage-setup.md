# Supabase Storage Setup

## Create Storage Buckets

To enable file uploads for teacher applications, you need to create storage buckets in Supabase:

### 1. Teacher Photos Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name: `teacher-photos`
5. Make it **Public** (so uploaded photos can be accessed via public URLs)
6. Click **Create bucket**

### 2. Teacher Documents Bucket

1. Click **New bucket** again
2. Name: `teacher-documents`
3. Make it **Public** (so uploaded documents can be accessed via public URLs)
4. Click **Create bucket**

## Storage Policies

After creating the buckets, set up RLS (Row Level Security) policies:

### Teacher Photos Policies

#### Policy 1: Allow authenticated users to upload photos
```sql
CREATE POLICY "Allow authenticated users to upload teacher photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'teacher-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 2: Allow authenticated users to delete their own photos
```sql
CREATE POLICY "Allow authenticated users to delete their own teacher photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'teacher-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 3: Allow public read access to photos
```sql
CREATE POLICY "Allow public read access to teacher photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'teacher-photos');
```

### Teacher Documents Policies

#### Policy 1: Allow authenticated users to upload documents
```sql
CREATE POLICY "Allow authenticated users to upload teacher documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'teacher-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 2: Allow authenticated users to delete their own documents
```sql
CREATE POLICY "Allow authenticated users to delete their own teacher documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'teacher-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

#### Policy 3: Allow public read access to documents
```sql
CREATE POLICY "Allow public read access to teacher documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'teacher-documents');
```

## File Structure

Files are stored with the following structure:

### Teacher Photos
```
teacher-photos/
  └── {userId}/
      └── {timestamp}-{random}.{ext}
```

### Teacher Documents
```
teacher-documents/
  ├── resumes/
  │   └── {userId}/
  │       └── {timestamp}-{random}.{ext}
  └── certificates/
      └── {userId}/
          └── {timestamp}-{random}.{ext}
```

This ensures:
- Each user's files are organized in their own folder
- Files are uniquely named to prevent conflicts
- Easy cleanup if needed
- Documents are organized by type (resumes vs certificates)

