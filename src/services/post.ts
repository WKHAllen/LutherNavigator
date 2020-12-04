import mainDB from "./util";

// Post architecture
export interface Post {
  id: string;
  userID: string;
  content: string;
  imageID: string;
  location: string;
  locationTypeID: number;
  program: string;
  ratingID: string;
  threeWords: string;
  approved: boolean;
  createTime: number;
  editTime: number | null;
}

// Post services
export module PostService {
	
}
