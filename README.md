
## Supabase Storage Policy Configuration

### 1. New policy in Supabase storage to allow users to delete images

**Policy Name:** `allow_authenticated_delete_cover`  
**Policy ID:** `1hys5dx_0`  
**Role:** `authenticated`  
**Condition:** `((bucket_id = 'cover'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text))`

This policy allows authenticated users to delete images from the 'cover' storage bucket.re