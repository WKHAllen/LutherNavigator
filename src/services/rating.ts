import mainDB from "./util";

// Rating architecture
export interface Rating {
  id: number;
  general: number;
  cost: number | null;
  quality: number | null;
  safety: number | null;
  cleanliness: number | null;
  guestServices: number | null;
}

// Rating services
export module RatingService {
	
}
