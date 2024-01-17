import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';
import { Profile } from 'src/app/models/profile.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PostService } from 'src/app/services/post.service';
import { ModalController } from '@ionic/angular';
import { CreatepostpageComponent } from 'src/app/pages/homepage/componentes/createpostpage/createpostpage.component'; // replace with the actual path to CreatePostPage
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import 'firebase/compat/firestore'; // Import the firestore module
import firebase from 'firebase/compat/app';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MenuController } from '@ionic/angular';


declare var google: any;

interface Post {
  destination: string;
  patente: string;
  capacidad: number;
  currentCapacity: number;
  driverId: string;
  creatorUid: string;
  price: number;
  mapUrl: string;
  mapImageUrl: string;
}


  @Component({
    selector: 'app-homepage',
    templateUrl: './homepage.page.html',
    styleUrls: ['./homepage.page.scss'],
  })
  export class HomePage implements OnInit {
    profile: Profile;
    name: string;
    profiles: any[] = [];
    isModalOpen = false;
    role: string;
    currentUser: any;
    postId: string;
    profileImageUrl: string;
    postCreated: boolean = false;
    posts: any[]; 
    usersWhoTookTheTrip = [
      { name: 'Usuario 1' },
      { name: 'Usuario 2' },
      // ...
    ];
    private postsSubscription: Subscription;
    constructor(
      private authService: AngularFireAuth,
      private firestore: AngularFirestore,
      private modalController: ModalController,
      private postService: PostService,
      private router: Router,
      private profileService: ProfileService,
      private menu: MenuController,
      private afAuth: AngularFireAuth,
      private storage: AngularFireStorage,
      private navCtrl: NavController
    ) {
      this.authService.currentUser.then(user => {
        this.currentUser = user;
      });
      
    }

    

   

    

  
    
    ngOnInit() {
      this.getProfileImageUrl();
      this.firestore.collection('profiles').valueChanges().subscribe(profiles => {
        this.profiles = profiles;
      });
      this.loadPosts();
      this.afAuth.user.subscribe(user => {
        if (user) {
          this.postsSubscription = this.firestore.collection('posts').snapshotChanges().subscribe(snapshots => {
            // Assign posts to the posts variable
            this.posts = snapshots.map(snapshot => {
              const data = snapshot.payload.doc.data() as {}; // Cast data to an object
              const id = snapshot.payload.doc.id;
              return { id, ...data };
            });
            console.log(this.posts);
    
            this.profileService.getProfile(user.uid).subscribe(profile => {
              this.profile = profile;
              this.role = profile.role;
              this.name = profile.name;
    
              // Any additional logic related to profile data
    
            });
          });
        }
      });
    }

    getCreatorName(post) {
      const profile = this.profiles.find(profile => profile.uid === post.creatorUid);
      return profile ? profile.name : '';
    }

    
    ngOnDestroy(): void {
      if (this.postsSubscription) {
        this.postsSubscription.unsubscribe();
      }
    }
    
    
    
    

    setOpen(isOpen: boolean) {
      this.isModalOpen = isOpen;
    }



    irARegistro() {
      this.router.navigate(['/register']);
    }


   

    signOut() {
      this.afAuth.signOut().then(() => {
        this.router.navigate(['/register']);
      });
    }

    async takeTrip(post) {
          
      if (!post) {
        console.error('No current post to take trip with');
        return;
      }
      // Comprueba si hay suficiente capacidad en el vehículo
      if (post.capacidad <= 0) {
        console.error('No hay suficiente capacidad en el vehículo para más personas');
        return;
      }
    
      // Disminuye la capacidad en 1
      post.capacidad -= 1;
    
      // Busca el documento con el postId que coincide
      const snapshot = await this.firestore.collection('posts').doc(post.postId).get().toPromise();
      if (!snapshot.exists) {
        console.error('No se encontró ningún documento con el postId: ', post.postId);
        return;
      }
    
      // Actualiza el documento que coincide
      snapshot.ref.update({
        capacidad: post.capacidad
      }).then(() => {
        console.log('Capacidad actualizada con éxito');
        this.sendNotificationToDriver(post.driverId);
      }).catch((error) => {
        console.error('Error actualizando capacidad: ', error);
      });
    
      // ...
    
      this.firestore.collection('chats').doc(post.chatId).update({
        uids: firebase.firestore.FieldValue.arrayUnion(this.currentUser.uid)
      }).then(() => {
        console.log('Usuario añadido al chat con éxito');
      }).catch((error) => {
        console.error('Error añadiendo usuario al chat: ', error);
      });
    
      // ...
      this.navCtrl.navigateForward(`/chat/${post.postId}`);
    }
    
    async promptNumberOfPeople(): Promise<number> {
      let numberOfPeople: number;
    
      // Aquí va tu lógica para mostrar un prompt o un modal y obtener el número de personas...
    
      return numberOfPeople;
    }
    
    sendNotificationToDriver(driverId: string) {
      // Use the driverId parameter to send a notification to the driver
      console.log(`Sending notification to driver: ${driverId}`);
    }

    

    private async getChatAndMessages(postId: string) {
      try {
        // Obtén los detalles del chat
        const chatDoc = await this.firestore.collection('chats').doc(postId).get().toPromise();
        const chat = chatDoc.exists ? chatDoc.data() : null;
    
        // Obtén los mensajes para el postId
        const messagesSnapshot = await this.firestore.collection('messages', ref => ref.where('postId', '==', postId)).get().toPromise();
        const messages = messagesSnapshot.docs.map(doc => doc.data());
    
        return { chat, messages };
      } catch (error) {
        console.error('Error al obtener los detalles del chat y los mensajes:', error);
        return { chat: null, messages: [] };
      }
    }
    
    onChatButtonClicked(postId: string) {
      // Navega a la página de chat
      this.router.navigate(['/chat', postId]);
    }

    loadPosts() {
      this.firestore.collection('posts').get().subscribe((querySnapshot) => {
        this.posts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            postId: doc.id,
            ...(typeof data === 'object' ? data : {})
          };
        });
      });
    }
      
  

 
    async openCreatePostModal() {
      const modal = await this.modalController.create({
        component: CreatepostpageComponent
      });
  
      return await modal.present();
    }

    deletePost(postId: string) {
      this.firestore.collection('posts').doc(postId).get().toPromise().then(doc => {
        if (doc.exists) {
          const post = doc.data() as { creatorUid: string };  // Add type assertion here
          if (post.creatorUid === this.currentUser.uid) {
            this.firestore.collection('posts').doc(postId).delete()
              .then(() => console.log('Post deleted'))
              .catch(error => console.error('Error deleting post: ', error));
          } else {
            console.error('You do not have permission to delete this post');
          }
        } else {
          console.error('Post does not exist');
        }
      });
    }

    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    openMenu() {
  this.menu.open();
}

async getProfileImageUrl() {
  try {
    const user = await this.afAuth.currentUser;
    if (user) {
      const userId = user.uid;
      const path = `profile_images/${userId}`;
      const fileRef = this.storage.ref(path);

      fileRef.getDownloadURL().subscribe(
        (url) => {
          this.profileImageUrl = url;
        },
        (error) => {
          console.error('Error al obtener la URL de descarga:', error);
          console.log(this.profileImageUrl);
          // Mantén la imagen predeterminada si hay un error
        }
      );
    }
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
  }
}

    

    

    
    studentsTookTrip(): boolean {
      // Aquí debes implementar la lógica para verificar si los estudiantes tomaron un viaje.
      // Por ejemplo, podrías verificar si la lista de viajes tomados por los estudiantes no está vacía:
      return this.usersWhoTookTheTrip.length > 0;
    }
    
    driverHasPost(): boolean {
      // Aquí debes implementar la lógica para verificar si el conductor tiene un post.
      // Por ejemplo, podrías verificar si el conductor tiene al menos un post en la lista de posts:
      return this.posts.some(post => post.driverId === this.currentUser.uid);
    }

    goBack() {
      this.navCtrl.back();
    }

    
  }