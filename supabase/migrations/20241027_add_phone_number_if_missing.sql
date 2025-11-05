-- Migration: Add phone_number column to user_profiles if it doesn't exist
-- This ensures the table has all required fields

-- Add phone_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN phone_number TEXT;
        COMMENT ON COLUMN user_profiles.phone_number IS 'User phone number';
    END IF;
END $$;

-- Add username column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'username'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN username TEXT UNIQUE;
        COMMENT ON COLUMN user_profiles.username IS 'Unique username for the user';
    END IF;
END $$;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone_number);

-- Function to assign admin role to a user
CREATE OR REPLACE FUNCTION assign_admin_role(user_email TEXT)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    old_role TEXT,
    new_role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_old_role TEXT;
    v_email TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Get user info
    SELECT id, role, user_profiles.email, user_profiles.first_name, user_profiles.last_name
    INTO v_user_id, v_old_role, v_email, v_first_name, v_last_name
    FROM user_profiles
    WHERE user_profiles.email = user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- Update role to admin
    UPDATE user_profiles
    SET role = 'university_admin'::user_role,
        updated_at = NOW()
    WHERE id = v_user_id;

    -- Return the updated user info
    RETURN QUERY
    SELECT 
        v_user_id,
        v_email,
        v_first_name,
        v_last_name,
        v_old_role,
        'university_admin'::TEXT;
END;
$$;

COMMENT ON FUNCTION assign_admin_role IS 'Promote a user to admin role by email. Usage: SELECT * FROM assign_admin_role(''user@example.com'');';

-- Function to change any user role
CREATE OR REPLACE FUNCTION change_user_role(
    user_email TEXT,
    new_role_name TEXT
)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    old_role TEXT,
    new_role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_old_role TEXT;
    v_email TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Validate role
    IF new_role_name NOT IN ('employee', 'hr_staff', 'payroll_officer', 'department_head', 'university_admin', 'system_admin') THEN
        RAISE EXCEPTION 'Invalid role: %. Must be one of: employee, hr_staff, payroll_officer, department_head, university_admin, system_admin', new_role_name;
    END IF;

    -- Get user info
    SELECT id, role, user_profiles.email, user_profiles.first_name, user_profiles.last_name
    INTO v_user_id, v_old_role, v_email, v_first_name, v_last_name
    FROM user_profiles
    WHERE user_profiles.email = user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- Update role
    UPDATE user_profiles
    SET role = new_role_name::user_role,
        updated_at = NOW()
    WHERE id = v_user_id;

    -- Log the change in audit_logs if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        INSERT INTO audit_logs (
            table_name,
            record_id,
            action,
            old_data,
            new_data,
            changed_by
        ) VALUES (
            'user_profiles',
            v_user_id,
            'UPDATE',
            jsonb_build_object('role', v_old_role),
            jsonb_build_object('role', new_role_name),
            v_user_id
        );
    END IF;

    -- Return the updated user info
    RETURN QUERY
    SELECT 
        v_user_id,
        v_email,
        v_first_name,
        v_last_name,
        v_old_role,
        new_role_name::TEXT;
END;
$$;

COMMENT ON FUNCTION change_user_role IS 'Change a user role. Usage: SELECT * FROM change_user_role(''user@example.com'', ''hr_staff'');';

