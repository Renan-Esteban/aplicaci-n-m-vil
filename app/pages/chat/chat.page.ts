import { Component, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { ActivatedRoute } from '@angular/router';
import { PostService } from 'src/app/services/post.service';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { Profile } from 'src/app/models/profile.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ModalController } from '@ionic/angular';
import { CreatepostpageComponent } from 'src/app/pages/homepage/componentes/createpostpage/createpostpage.component'; // replace with the actual path to CreatePostPage
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import 'firebase/compat/firestore'; // Import the firestore module
import firebase from 'firebase/compat/app';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { from } from 'rxjs';


interface Message {
  userId: string;
  // Resto de las propiedades de tus mensajes...
}





@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  messages: any[] = [];
  newMessage: string = '';
  postId: string = '';
  profiles = [];
  profile$: Observable<Profile>;
  currentUserId: string;
  constructor(
    private chatService: ChatService,
    private postService: PostService,
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
  ) {this.postService.postId$.subscribe(postId => {
    this.postId = postId;
    // Ahora puedes utilizar this.postId como el identificador de la publicación en tu lógica de chat.
  });}

  ngOnInit() {
    this.afAuth.currentUser.then(user => {
      this.currentUserId = user.uid;
      this.loadMessages();
    });
    this.afAuth.currentUser.then(user => {
      this.profile$ = this.firestoreService.getUserData(user.uid);
  });
    this.firestore.collection('profiles').valueChanges().subscribe(profiles => {
      this.profiles = profiles;
    });
    this.route.params.subscribe(params => {
      this.postId = params['postId'];
      this.loadMessages();
    });
  }

  loadMessages() {
    this.chatService.getMessages(this.postId).subscribe((messages: any[]) => {
      this.messages = messages.map(message => ({
        ...message,
        myMsg: message.userId === this.currentUserId
      }));
      console.log(this.messages); // Agrega esta línea
    });
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      this.chatService.addMessage(this.postId, this.newMessage).then(() => {
        this.newMessage = '';
      });
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


  

  getUserName(uid: string) {
    const user = this.profiles.find(profile => profile.uid === uid);
    return user ? user.username : 'Usuario desconocido';
  }


}
