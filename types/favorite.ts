export type NeoFavorite = {
  user_id: string;
  neo_id: string;
  name: string | null;
  hazardous: boolean | null;
  nearest_approach: string | null;
  avg_diameter_km: number | null;
  created_at: string;
};
