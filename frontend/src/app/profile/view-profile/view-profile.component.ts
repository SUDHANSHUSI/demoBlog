import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { Post } from '../../posts/post.model';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../profile.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css'],
})
export class ViewProfileComponent implements OnInit {
  profileId!: string;
  isloading: boolean = false;
  // profile!: Profile;
  profile: any = { followersCount: 0 };
  posts: Post[] = [];
  url: any;
  userId!: string;
  isFollowing: boolean = false;
  showFollowersModal: boolean = false;
  showFollowingModal: boolean = false;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    public route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();

    this.url = this.router.url.split('/')[1];

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('profileId')) {
        this.profileId = paramMap.get('profileId') ?? '';
        this.getProfileByUsername(this.profileId);
        this.getCurrentUseersPost(this.profileId);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  getProfileByUsername(uname: string) {
    this.isloading = true;
    this.profileService.getProfileByUsername(uname).subscribe((profile) => {
      this.profile = profile.profile;
      this.isloading = false;
      this.checkIfFollowing();
    });
  }

  getCurrentUseersPost(uname: string) {
    this.isloading = true;
    this.profileService
      .getMyPost(uname)
      .pipe(
        map((postData) => {
          return postData.post.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              postDate: post.postDate,
            };
          });
        })
      )
      .subscribe((data) => {
        this.isloading = false;
        this.posts = data;
      });
  }

  followProfile() {
    if (!this.isFollowing) {
      if(this.authService.isLoggedIn()){
      this.profileService
        .followProfile(this.profile._id)
        .subscribe((message) => {
          this.toastr.success('successfully followed this profile.', 'Success');
          this.isFollowing = true;
          this.router.navigate(['/profile']);
        });
      }else{
          this.toastr.warning('Please login to follow this profile.', 'Login Required');
      this.router.navigate(['/login']);
      }
    }
  }

  unfollowProfile() {
    if (this.isFollowing) {
      if(this.authService.isLoggedIn()){
      this.profileService
        .unfollowProfile(this.profile._id)
        .subscribe((message) => {
          this.toastr.success(
            'successfully unfollowed this profile.',
            'Success'
          );
          this.isFollowing = false;
          this.router.navigate(['/profile']);
        });
      }
      else{
      this.toastr.warning('Please login to unfollow this profile.', 'Login Required');
      this.router.navigate(['/login']);

      }
    }
  }

  checkIfFollowing() {
    if (this.profile.followers.includes(this.userId)) {
      this.isFollowing = true;
    }
  }

  openFollowersModal() {
    this.showFollowersModal = true;
  }

  openFollowingModal() {
    this.showFollowingModal = true;
  }

  closeFollowersModal() {
    this.showFollowersModal = false;
  }

  closeFollowingModal() {
    this.showFollowingModal = false;
  }
}
