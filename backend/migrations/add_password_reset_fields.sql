-- Migration: Add password reset fields to nguoidung table
ALTER TABLE nguoidung 
ADD COLUMN resetPasswordToken VARCHAR(255) NULL,
ADD COLUMN resetPasswordExpiry DATETIME NULL;
