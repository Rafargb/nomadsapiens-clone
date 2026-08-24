import { supabase } from "./supabaseClient";

export async function getSiteSettings() {
  try {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Error fetching settings:", e);
    return null;
  }
}

export async function updateSiteSettings(settings) {
  try {
    const { data, error } = await supabase.from('site_settings').upsert({ id: 1, ...settings }).select();
    if (error) throw error;
    return data[0];
  } catch (e) {
    console.error("Error updating settings:", e);
    throw e;
  }
}
