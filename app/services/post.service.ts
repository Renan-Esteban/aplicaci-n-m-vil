import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Post } from 'src/app/models/posts.model';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
export interface PostModel {
  uid: string;
  driverId: string;
  chatId: string;
  content: string;
  name: string;
}




@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private firestore: AngularFirestore) { }

  private postIdSubject = new BehaviorSubject<string | null>(null);
  postId$ = this.postIdSubject.asObservable();

  setPostId(postId: string) {
    this.postIdSubject.next(postId);
  }

  private post: any;

  setPost(post: any) {
    this.post = post;
  }

  getPost() {
    return this.post;
  }



  



}


