import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import 'firebase/compat/firestore'; // Import the firestore module

import { FirestoreService } from './firestore.service';
import { first } from 'rxjs/operators';

export interface Profile {
  uid: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  bio?: string;
  profileImage?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  
  

  constructor(private firestoreService: FirestoreService,private afAuth: AngularFireAuth, private firestore: AngularFirestore) { 
    
  }



  getMessages(postId: string) {
    return this.firestore
      .collection('messages', ref => ref.where('postId', '==', postId).orderBy('timestamp'))
      .valueChanges();
  }

  addMessage(postId: string, message: string) {
    return this.afAuth.currentUser.then(async (user) => {
      const timestamp = new Date().toISOString();
      const profile$ = await this.firestoreService.getUserData(user.uid); // Pasa el uid del usuario a getUserData
      const profile = await profile$.pipe(first()).toPromise() as Profile; // Usa la interfaz Profile para proporcionar un tipo a los datos del perfil
      return this.firestore.collection('messages').add({
        postId,
        message,
        timestamp,
        userId: user?.uid,
        userName: profile?.name, // Guarda el nombre del usuario con cada mensaje
      });
    });
  }

  


  
  






}
