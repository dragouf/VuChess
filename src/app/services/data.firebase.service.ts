import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { CurrentPlayer } from '../models/current.player.enum';
import { User } from '@firebase/auth-types';

@Injectable()
export class DataFirebaseService {
  chessboard: AngularFireObject<any>; // ChessboardState
  players: AngularFireObject<any>;

  constructor(private afDb: AngularFireDatabase) {
    this.chessboard = afDb.object('chessboard');
    this.players = afDb.object('chessboard/players');
  }

  updateChessboardState(fen: string, turn: string) {
    this.chessboard.update({ state: fen });
    this.afDb.object('chessboard/players').update({ current: turn });
  }

  onChessboardUpdated(): Observable<any> {
    return this.chessboard.valueChanges();
  }

  addPlayer(userId: string): Promise<any> {
    return this.afDb.database.ref('chessboard/players').once('value').then((snapshot:any) => {
      const players = snapshot.val();

      if(players.white == "") {
        this.addWhitePlayer(userId);
        return {added: true, side: 'w'};
      } else if(players.black == "") {
        this.addBlackPlayer(userId);
        return {added: true, side: 'b'};
      } else {
        return {added: false, side: ''};
      }
    });
  }

  removePlayer(userId: string): Promise<boolean> {
    return this.afDb.database.ref('chessboard/players').once('value').then((snapshot:any) => {
      const players = snapshot.val();

      if(players.white == userId) {
        this.removeWhitePlayer();
        return true;
      } else if(players.black == userId) {
        this.removeBlackPlayer();
        return true;
      } else {
        return false;
      }
    });
  }

  addWhitePlayer(userId: string) {
    this.afDb.object('chessboard/players').update({ white: userId });
  }

  removeWhitePlayer() {
    this.afDb.object('chessboard/players').update({ white: "" });
  }

  addBlackPlayer(userId: string) {
    this.afDb.object('chessboard/players').update({ black: userId });
  }

  removeBlackPlayer() {
    this.afDb.object('chessboard/players').update({ black: "" });
  }

  setCurrentPlayer(current: CurrentPlayer) {
    this.afDb.object('chessboard/players').update({ current: CurrentPlayer[current].charAt(0) });
  }

  hasJoined(userId: string): Observable<boolean> {
    return this.afDb.object('chessboard/players').valueChanges().map((p:any) => p.white == userId || p.black == userId);
  }

  isPlaying(userId: string, currentColor: CurrentPlayer) {
    return this.afDb.object('chessboard/players').valueChanges().map((p:any) => currentColor == CurrentPlayer.white ? p.white == userId : p.black == userId);
  }

  setUser(user: User) {
    var data = {};
    data[user.uid] = { name: user.displayName, email: user.email };
    this.afDb.object('users').update(data);
  }

  getUser(userId: string): Promise<any> {
    return this.afDb.database.ref('users/' + userId).once('value').then((snapshot:any) => snapshot.val());
  }

  getSpectators(): Observable<any> {
    return this.afDb.list('chessboard/spectators').valueChanges().map((spectators: any) => {
      return { total: spectators.length, online: spectators.filter(s => s.state == 'online').length };
    });
  }

  getGameHistory(): AngularFireList<any> {
    return this.afDb.list('games');
  }
}
