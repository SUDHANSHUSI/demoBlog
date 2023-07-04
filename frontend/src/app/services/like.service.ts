import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LikeService {


  private likedPostsKey = 'likedPosts';
  private likedPosts: string[] = [];

  
  constructor() {
     // Retrieve liked posts from local storage on service 
    const storedLikedPosts = localStorage.getItem(this.likedPostsKey);
    if (storedLikedPosts) {
      this.likedPosts = JSON.parse(storedLikedPosts);
    }
  }


    private saveLikedPostsToStorage() {
    // Save liked posts to local storage
    localStorage.setItem(this.likedPostsKey, JSON.stringify(this.likedPosts));
  }


  addLikedPost(postId: string) {
    this.likedPosts.push(postId);
      this.saveLikedPostsToStorage();
  }

  removeLikedPost(postId: string) {
    const index = this.likedPosts.indexOf(postId);
    if (index !== -1) {
      this.likedPosts.splice(index, 1);
       this.saveLikedPostsToStorage();
    }
  }

  isPostLiked(postId: string): boolean {
    return this.likedPosts.includes(postId);
  }

   getLikedPosts(): string[] {
    return this.likedPosts;
  }
}
