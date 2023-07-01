export interface Profile {
    _id: string;
    username: string;
    bio: string;
    imagePath: string;
    followers:string[];
    following:string[];
    followersCount?:number;
    followingCount?:number;
    creator: string;
  }
  