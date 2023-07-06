import { Component, OnInit, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import { Subscription, map } from 'rxjs';
import { Post } from '../post.model';
import { AuthService } from '../../auth/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../profile/profile.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  private authListenerSubs!: Subscription;
  searchTerm: string = '';
  posts: Post[] = [];
  pTest: any = [];
  checkDiv: boolean = false;
  user: Profile[] = [];
  postbyUser: Profile[] = [];
  categories: any[] = [];
  isloading = false;
  error: any;
  userId!: string;
  private postsSub!: Subscription;
  constructor(
    private ps: PostService,
    private authService: AuthService,
    private profileService: ProfileService,
    private router:Router,
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.getErrors();
    this.getUsers();
    this.isloading = true;
    this.userId = this.authService.getUserId();
    this.ps.getPosts();

    this.postsSub = this.ps.getPostUpdateListener().subscribe(
      (posts: Post[]) => {
        this.isloading = false;
        this.posts = posts;
        this.sortPostByDate(posts);
        this.getPostUserbyCreatorId(this.posts);
        console.log('posts is', this.posts);
      },
      (e) => {
        this.isloading = false;
        this.error = e;
      }
    );

    this.ps.getAllCategories().subscribe(
      (response) => {
        this.categories = response.categories;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  sortPostByDate(post: any) {
    post.sort(
      (a: any, b: any) =>
        new Date(b.postDate).getTime() - new Date(a.postDate).getTime()
    );
  }
  getErrors() {
    this.error = null;
    this.ps.err.subscribe((err) => {
      this.error = err;
      this.isloading = false;
    });
  }

  checkAuth() {
    this.userIsAuthenticated = this.authService.getIsAuth();

    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
  }

  getUsers() {
    this.profileService.getAllUsers().subscribe((user) => {
      this.user = user.profile;
    });
  }

  getPostUserbyCreatorId(post: Post[]) {
    let creatorId = [];
    for (let i in post) {
      creatorId.push(post[i].creator);
    }

    let unique = [...new Set(creatorId)];
    for (let i in unique) {
      this.profileService
        .getPostUserByCreatorId(unique[i])
        .subscribe((user) => {
          this.postbyUser.push(user.profile);
        });
    }
  }

  getPostsByCategory(category: string) {
    this.ps.getPostsByCategory(category).subscribe(
      (response: any) => {
        this.checkDiv = true;
        this.postbyUser = [];
        this.pTest = response.posts;
        this.sortPostByDate(this.posts);
        this.getPostUserbyCreatorId(this.posts);
        console.log(this.posts);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  onSearch(searchTerm: string) {
    this.ps.searchPosts(searchTerm).subscribe((posts) => {
      this.posts = posts;
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }
}
