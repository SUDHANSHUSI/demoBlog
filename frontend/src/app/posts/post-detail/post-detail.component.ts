import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';

import { AuthService } from '../../auth/auth.service';
import { PostService } from '../../services/post.service';
import { Post } from '../post.model';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  isAuth: any;
  isloading = false;
  url!: string;
  error: any;
  postId!: string;
  post!: Post;
  userId!: string;
  userIsAuthenticated!: boolean;
  private authStatusSub!: Subscription;
  profile: any;
  comment: any;
  likedPosts: string[] = [];

  constructor(
    public postsService: PostService,
    public route: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    public profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.url = this.router.url.split('/')[1];

    this.authData();
    this.getErrors();

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.postId = paramMap.get('postId') ?? '';
        if (this.postId) {
          this.getPostById(this.postId);
        }
      }
    });   
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    this.likedPosts = likedPosts;
   }
  

  authData() {
    this.isAuth = this.authService.getIsAuth();
    this.userId = this.authService.getUserId();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }
  getErrors() {
    this.error = null;
    this.postsService.err.subscribe((err) => {
      this.error = err;
      this.isloading = false;
    });
  }

  getPostById(postId: string) {
    this.isloading = true;
    this.postsService.getPost(postId).subscribe(
      (postData) => {
        console.log(postData);
        this.post = {
          id: postData._id,
          title: postData.title,
          content: postData.content,
          imagePath: postData.imagePath,
          creator: postData.creator,
          postDate: postData.postDate,
          category: postData.category,
          likes: [],
          comments: postData.comments,
          likeCount: postData.likes.length,
          isLiked: postData.likes.includes(this.userId),
        };
        this.getPostUserByCreatorId(postData.creator);
        this.isloading = false;
      },
      (e) => {
        this.isloading = false;
        this.error = e;
      }
    );
  }

  updateLikedStatus() {
    if (this.userIsAuthenticated && this.post.likes.includes(this.userId)) {
      this.post.isLiked = true;
    } else {
      this.post.isLiked = false;
    }
  }

  OnDelete(postId: string) {
    this.postsService.deletePost(postId);
  }


  likePost(postId: string) {
    this.postsService.likePost(postId).subscribe(
      () => {
        this.post.isLiked = true;
        this.post.likeCount++;
        this.likedPosts.push(postId);
        this.updateLikedPostsStorage();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  unlikePost(postId: string) {
    this.postsService.unlikePost(postId).subscribe(
      () => {
        this.post.isLiked = false;
        this.post.likeCount--;
        const index = this.likedPosts.indexOf(postId);
        if (index > -1) {
          this.likedPosts.splice(index, 1);
          this.updateLikedPostsStorage();
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }


  updateLikedPostsStorage() {
    localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts));
  }

  toggleLike(postId: string) {
    if (this.post.isLiked) {
      this.unlikePost(postId);
    } else {
      this.likePost(postId);
    }
  }


  onAddComment(postId: string, comment: string) {
    this.postsService.addComment(postId, comment).subscribe(
      (newComment) => {
        this.comment = '';
        this.post.comments.push(newComment.comment);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getPostUserByCreatorId(id: string) {
    this.profileService.getPostUserByCreatorId(id).subscribe(
      (profile) => {
        if (profile.profile) {
          this.profile = profile.profile;
        } else {
        }
      },
      (e) => {
        this.isloading = false;
      }
    );
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
