'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

export async function adminSignUp(email: string, password: string, display_name: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { display_name },
        });

        if (error) {
            if (error.message.includes('already exists')) {
                return { success: true }; // Just act like it succeeded so they can login.
            }
            return { error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        return { error: err.message };
    }
}
