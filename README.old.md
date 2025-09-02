# megaphoneoz_supabase_backend

I am creating a react project integrate with supabase to implement a simple CMS system. This project is for the background of CMS.
It include react, typescript, effect.js, and material 3.
We would have tables like posts, comments which are assosiated with user's id.
The whole pages are more likely same with wordpress but more simple than it.

supabase table
-- ==========================
-- 删除已有表
-- ==========================
drop table if exists comments cascade;
drop table if exists post_images cascade;
drop table if exists posts cascade;

-- ==========================
-- 创建表
-- ==========================

-- 文章表 (带简单分类)
create table posts (
  id bigint generated always as identity primary key,
  author_id uuid references auth.users(id) not null,
  title text not null,
  content text not null,
  excerpt text,
  status varchar(20) default 'publish',
  post_type varchar(20) default 'post',
  cover_image_url text,
  category text,                                     -- 简单分类，直接存文字
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index posts_status_idx on posts(status);
create index posts_type_idx on posts(post_type);
create index posts_category_idx on posts(category);

-- 图片表
create table post_images (
  id bigint generated always as identity primary key,
  post_id bigint references posts(id) on delete cascade not null,
  image_url text not null,
  alt_text text,
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index post_images_post_idx on post_images(post_id);

-- 评论表
create table comments (
  id bigint generated always as identity primary key,
  post_id bigint references posts(id) on delete cascade not null,
  user_id uuid references auth.users(id),
  author_name text,
  author_email text,
  content text not null,
  status varchar(20) default 'approved',
  parent_id bigint references comments(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index comments_post_idx on comments(post_id);
create index comments_status_idx on comments(status);





-- 允许所有人查看
CREATE POLICY "Public read access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-images');

-- 允许认证用户上传
CREATE POLICY "Authenticated upload" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'post-images'
);