export interface Post {
  id: string;
  title: string;
  content: string;
  imagePath: string;
  creator: string;
  postDate?: string;
  category:string;
  likes: string[];
  comments: Comment[];
  likeCount: number;
}

export interface Comment {
  user: string;
  comment: string;
}
