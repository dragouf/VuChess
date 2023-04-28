import { Component, ViewChild, AfterViewInit, ViewEncapsulation  } from '@angular/core';
import { BoardComponent } from './board/board.component';
import { MovesComponent } from './moves/moves.component';
import { AuthFirebaseService } from './services/auth.firebase.service';
import { User } from '@firebase/auth-types';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/take";

import { ipcRenderer } from 'electron';
import { DataFirebaseService } from './services/data.firebase.service';
import { ChronoComponent } from './chrono/chrono.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
  @ViewChild(BoardComponent)
  private chessboard: BoardComponent;
  private hasJoined: Observable<boolean>;

  constructor(public authService: AuthFirebaseService, public chessService: DataFirebaseService) {
    this.authService.afAuth.authState.subscribe(user => {
        authService.setUserRef();
        if(user != null && user.uid) {
          this.setHasJoined(user);
      }
    });
  }

  ngAfterViewInit() {
    this.chessService.onChessboardUpdated().subscribe(() => {
      if(!this.authService.afAuth.auth.currentUser) {
        return;
      }
      
      this.chessService.isPlaying(this.authService.afAuth.auth.currentUser.uid, this.chessboard.getCurrentColor()).take(1).subscribe(result => {
        ipcRenderer.send('turn-notif', result);
      });
    });
  }

  joinBoard() {
    this.authService.afAuth.authState.take(1).subscribe(user => {
      if(user == null) {
        this.login().then(result => this.chessService.addPlayer(result.uid).then(r => console.log("join", r)));
      } else {
        this.chessService.addPlayer(user.uid).then(r => console.log("join", r));
      }
    });
  }

  flipBoard() {
    this.chessboard.flipBoard();
  }

  resetBoard() {
    this.chessboard.resetBoard();
  }

  login(): Promise<User> {
    const GoogleClientWebApp = {
      client_id: "xxxx.apps.googleusercontent.com",
      client_secret: "xxxx",
      redirect_uri: "https://vuchess-61c10.firebaseapp.com/__/auth/handler",
      authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
      response_type: "token",
      scope: "https://www.googleapis.com/auth/userinfo.profile",
    };

    ipcRenderer.send('start-oauth', GoogleClientWebApp);

    return new Promise((resolve, reject) => {
      ipcRenderer.once('oauth-received', (event, result) => {
        if(!result.success) {
          reject(result);
        } else {
          const credential = firebase.auth.GoogleAuthProvider.credential(null, result.data.access_token);
          return this.authService.afAuth.auth.signInWithCredential(credential).then(user => {
            // write name in db
            this.chessService.setUser(user);

            // update spectators
            this.authService.setUserRef();

            // update is playing observable
            this.setHasJoined(user);

            return user;
          });
        }
      });
    });
  }

  setHasJoined(user) {
    this.hasJoined = this.chessService.hasJoined(user.uid);
  }

  logout() {
    this.authService.afAuth.auth.signOut();
  }

  leaveBoard() {
    this.authService.afAuth.authState.subscribe(user => {
      this.chessService.removePlayer(user.uid);
    });
  }
}
