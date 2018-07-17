import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { PostService } from '../post.service';
import { FileUploader, FileSelectDirective, FileUploaderOptions } from 'ng2-file-upload/ng2-file-upload';
import { LoginModalComponent } from '../../users/login-modal/login-modal.component';
import url from '../../url';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit {

  public uploader: FileUploader = new FileUploader({ url: `${url}/posts/post`, itemAlias: 'photo' });

  user: object;
  message: string;
  cordinates: {latitude: number, longitude: number};
  size: any;

  constructor(
    public loginDialog: MatDialog,
    public router: Router,
    private _aS: AuthService,
    private _pS: PostService
  ) { }

  ngOnInit() {
    if (localStorage.user) {
      this.user = JSON.parse(localStorage.user);
    } else {
      this.router.navigate(['/']);
      setTimeout(() => {
        this.openLoginDialog();
      }, 0);
    }
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
  }

  openLoginDialog() {
    this.loginDialog.open(LoginModalComponent, {
      data: {
        readme: 'something if needed'
      }
    });
  }

  getFileSize(file, el) {
    const type = file.type.split('/')[1];
    if (type === 'jpg' || type === 'jpeg' || type === 'png') {
      this.size = file.size;
      console.log('correct');
    } else {
      el.value = null;
      console.log('incorrect file type');
    }
  }
  getCordinates(obj) {
    this.cordinates = obj;
  }
  newPost(el) {
    if (this.size >= 6000000) {
      console.log('too big');
      return;
    } else if (!el) {
      console.log('nothing to send');
      return;
    }
    const id = JSON.parse(localStorage.user)._id;
    if (id) {
      const options: FileUploaderOptions = {};
      const token = localStorage.id_token;
      options.headers = [{ name: 'x-auth-token', value: token }];
      this.uploader.onBuildItemForm = (item, form) => {
        form.append('user', id);
        form.append('description', this.message);
        form.append('longitude', this.cordinates.longitude);
        form.append('latitude', this.cordinates.latitude);
      };
      this.uploader.setOptions(options);
      this.uploader.uploadAll();
      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
        console.log(JSON.parse(response));
      };
    } else {
      console.log('please login');
    }
  }

}
