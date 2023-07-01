import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';

import { AuthService } from '../../auth/auth.service';
import { PostService } from '../../services/post.service';
import { Post } from '../post.model';
import { LikeService } from 'src/app/services/like.service';

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
  isLiked: boolean = false;

  constructor(
    public postsService: PostService,
    public route: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    public profileService: ProfileService,
    private likeService: LikeService
  ) {}

  ngOnInit(): void {
    this.url = this.router.url.split('/')[1];

    this.authData();
    this.getErrors();

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.postId = paramMap.get('postId') ?? '';
        if (this.postId) {
          this.initLikedPosts();
          this.isLiked = this.likeService.isPostLiked(this.postId);
          this.getPostById(this.postId);
        }
      }
    });
  }

  private async initLikedPosts() {
    const likedPosts = await this.likeService.getLikedPosts();
    this.isLiked = likedPosts.includes(this.postId);
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
  
  OnDelete(postId: string) {
    this.postsService.deletePost(postId);
  }

  onLike(postId: string) {
    this.postsService.likePost(postId).subscribe(
      (responseData) => {
        if (this.post) {
          this.post.likes = responseData.success
            ? this.post.likes.filter(
                (userId: any) => userId !== responseData.message
              )
            : [...this.post.likes, responseData.message];
          this.post.likeCount = responseData.likeCount;
          this.isLiked = responseData.success ? !this.isLiked : this.isLiked;
        }
        if (responseData.success) {
          if (this.isLiked) {
            this.likeService.addLikedPost(postId);
          } else {
            this.likeService.removeLikedPost(postId);
          }
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  onAddComment(postId: string, comment: string) {
    this.postsService.addComment(postId, comment);
    window.location.reload();
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
