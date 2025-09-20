-- Migration: add image_url column to books table
ALTER TABLE IF EXISTS books
ADD COLUMN IF NOT EXISTS image_url TEXT;
