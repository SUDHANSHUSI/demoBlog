import { Injectable } from '@angular/core';
import { Post } from '../posts/post.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth/auth.service';
const BACKEND_URL = environment.apiUrl + '/posts';
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];

  private postsUpdated = new Subject<Post[]>();
  public err = new BehaviorSubject<any>(null);
  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(
    title: string,
    content: string,
    imgpath: File,
    postDate: Date,
    category: string
  ) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', imgpath, title);
    postData.append('postDate', postDate.toString());
    postData.append('category', category);
    this.http
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        this.err.next(null);
        this.router.navigate(['/']);
      }),
      (err: any) => {
        this.err.next(err);
      };
  }

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(BACKEND_URL)
      .pipe(
        map((postData) => {
          return postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              postDate: post.postDate,
              category: post.category,
              likes: post.likes,
              comments: post.comments,
              likeCount: post.likeCount,
            };
          });
        })
      )
      .subscribe(
        (transformedPosts) => {
          this.err.next(null);

          this.posts = transformedPosts;
          this.postsUpdated.next([...this.posts]);
        },
        (err) => {
          this.err.next(err);
        }
      );
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
      postDate: string;
      category: string;
      likes: string;
      comments: [];
      likeCount: number;
    }>(BACKEND_URL + '/' + id);
  }

  getMyPost(id: string) {
    this.http
      .get<{ message: string; posts: any }>(BACKEND_URL + '/mypost')
      .pipe(
        map((postData) => {
          return postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              postDate: post.postDate,
              category: post.category,
              likes: post.likes,
              comments: post.comments,
              likeCount: post.likeCount,
            };
          });
        })
      )
      .subscribe(
        (transformedPosts) => {
          this.err.next(null);

          this.posts = transformedPosts;
          this.postsUpdated.next([...this.posts]);
        },
        (err) => {
          this.err.next(err);
        }
      );
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    image: File | string,
    category: string
  ) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
      postData.append('category', category);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        category: category,
        creator: '',
        likes: [],
        comments: [],
        likeCount: 0,
      };
    }
    this.http.put(BACKEND_URL + '/' + id, postData).subscribe(
      (response) => {
        this.err.next(null);
        this.router.navigate(['/myposts']);
      },
      (err) => {
        this.err.next(err);
      }
    );
  }

  deletePost(postId: string) {
    this.http.delete(BACKEND_URL + '/' + postId).subscribe(
      (data) => {
        this.err.next(null);
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
        this.toastr.success('Post deleted successfully.', 'Success');
      },
      (e) => {
        this.err.next(e);
      }
    );
  }

  getPostsByCategory(category: string) {
    return this.http.get<{ message: string; posts: Post }>(
      `${BACKEND_URL}/category/${category}`
    );
  }

  getAllCategories() {
    return this.http.get<{ message: string; categories: any[] }>(
      `${BACKEND_URL}/All/categories`
    );
  }

  likePost(
    postId: string
  ): Observable<{ success: boolean; message: string; likeCount: number }> {
    if (!this.authService.getIsAuth()) {
      this.toastr.warning('Please log in to like the post.', 'Login Required');
      return this.http.get<{
        success: boolean;
        message: string;
        likeCount: number;
      }>(`${BACKEND_URL}/${postId}/likes`);
    }
    return this.http.get<{
      success: boolean;
      message: string;
      likeCount: number;
    }>(`${BACKEND_URL}/${postId}/likes`);
  }

  addComment(postId: string, comment: string) {
    if (!this.authService.getIsAuth()) {
      this.toastr.warning('Please log in to add a comment.', 'Login Required');
      return;
    }
    const commentData = { comment };
    this.http
      .post<{ success: boolean; message: string; comment: any }>(
        `${BACKEND_URL}/${postId}/comment`,
        commentData
      )
      .subscribe(
        (responseData) => {
          const updatedPost = this.posts.find((post) => post.id === postId);
          if (updatedPost) {
            updatedPost.comments.unshift(responseData.comment);
            this.postsUpdated.next([...this.posts]);
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }
  searchPosts(searchTerm: string): Observable<Post[]> {
    const queryParams = { q: searchTerm };
    return this.http
      .get<{ message: string; posts: any }>(`${BACKEND_URL}/search/post`, {
        params: queryParams,
      })
      .pipe(
        map((responseData) => {
          return responseData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              postDate: post.postDate,
              category: post.category,
              likes: post.likes,
              comments: post.comments,
              likeCount: post.likeCount,
            };
          });
        })
      );
  }
}
