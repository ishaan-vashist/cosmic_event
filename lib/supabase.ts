import { createClient } from "@supabase/supabase-js";
import type { NeoFavorite } from "@/types/favorite";
import type { Profile } from "@/types/profile";
import type { NEO } from "@/types/neo";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Checks if user is authenticated
 * @returns Promise resolving to boolean indicating auth status
 */
export async function isAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
}

/**
 * Gets the current user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Gets the user profile
 * @returns Profile object or null if not found
 */
export async function getProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return data as Profile | null;
}

/**
 * Updates the user profile
 * @param profile Profile data to update
 * @returns Updated profile or null if error
 */
export async function updateProfile(profile: Partial<Profile>) {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  
  return data as Profile;
}

/**
 * Gets all favorite NEOs for the current user
 * @returns Array of favorite NEOs
 */
export async function getFavorites() {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data } = await supabase
    .from('neo_favorites')
    .select('*')
    .eq('user_id', user.id);
    
  return data as NeoFavorite[] || [];
}

/**
 * Adds a NEO to favorites
 * @param neo The NEO to add to favorites
 * @returns The created favorite or null if error
 */
export async function addFavorite(neo: NEO) {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const favorite: Omit<NeoFavorite, 'created_at'> = {
    user_id: user.id,
    neo_id: neo.id,
    name: neo.name,
    hazardous: neo.hazardous,
    nearest_approach: neo.nearestApproach?.datetime || null,
    avg_diameter_km: neo.avgDiameterKm
  };
  
  const { data, error } = await supabase
    .from('neo_favorites')
    .upsert(favorite)
    .select()
    .single();
    
  if (error) {
    console.error('Error adding favorite:', error);
    return null;
  }
  
  return data as NeoFavorite;
}

/**
 * Removes a NEO from favorites
 * @param neoId The ID of the NEO to remove
 * @returns True if successful, false otherwise
 */
export async function removeFavorite(neoId: string) {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { error } = await supabase
    .from('neo_favorites')
    .delete()
    .match({ user_id: user.id, neo_id: neoId });
    
  return !error;
}

/**
 * Checks if a NEO is in the user's favorites
 * @param neoId The ID of the NEO to check
 * @returns True if favorited, false otherwise
 */
export async function isFavorite(neoId: string) {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('neo_favorites')
    .select('neo_id')
    .eq('user_id', user.id)
    .eq('neo_id', neoId)
    .maybeSingle();
    
  return !!data;
}

/**
 * Signs out the current user
 */
export async function signOut() {
  await supabase.auth.signOut();
}
