import { Component, OnInit } from '@angular/core';
import { DataFirebaseService } from '../services/data.firebase.service';
import { Observable } from 'rxjs/Observable';
import { User } from '@firebase/auth-types';

@Component({
  selector: 'players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  blackPlayer: any;
  whitePlayer: any;
  current: string;

  nobodyPlayer = { uid: '', name: '--', email: '' }
  constructor(private chessService: DataFirebaseService) {
  }

  ngOnInit() {
    this.blackPlayer = this.nobodyPlayer;
    this.whitePlayer = this.nobodyPlayer;

    this.chessService.players.valueChanges().subscribe((players:any) => {
      if(players.white !== '') {
        // retrieve user info
        this.chessService.getUser(players.white).then((r: any) => {
          if(r)
            this.whitePlayer = { uid: players.white, displayName: r.name, name: r.name ? r.name.split(' ')[0] : r.name ? r.name : '[noname]', email: r.email };
          else
            this.whitePlayer = this.nobodyPlayer;
        });
      } else {
        this.whitePlayer = this.nobodyPlayer;
      }

      if(players.black !== '') {
        // retrieve user info
        this.chessService.getUser(players.black).then((r: any) => {
          if(r)
            this.blackPlayer = { uid: players.black, displayName: r.name, name: r.name ? r.name.split(' ')[0] : r.name ? r.name : '[noname]', email: r.email }
          else
            this.blackPlayer = this.nobodyPlayer;
        });
      } else {
        this.blackPlayer = this.nobodyPlayer;
      }

      this.current = players.current;
    });
  }
}
