import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import * as Chess from 'chess.js';
import * as Chessboard from 'chessboard.module.js';
import { DataFirebaseService } from '../services/data.firebase.service';
import { AuthFirebaseService } from '../services/auth.firebase.service';
import { ChronoComponent } from '../chrono/chrono.component';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/take";
import { CurrentPlayer } from '../models/current.player.enum';

import { TimerService } from '../services/timer.service'

@Component({
  selector: 'chessboard',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BoardComponent implements OnInit {
  @ViewChild('board') boardElement:ElementRef;
  private squareClass:string = "square-55d63"; // hardcoded css value of chessboard
  private board: Chessboard;
  private game: any;
  private cfg:ChessboardConfig;

  private currentPlayerColor: string = 'w';

  constructor(private chessService: DataFirebaseService, private authService: AuthFirebaseService, private timer: TimerService) {
      this.cfg = {
        draggable: true,
        position: 'start',
        onDragStart: this.onDragStart.bind(this),
        onDrop: this.onDrop.bind(this),
        onSnapEnd: this.onSnapEnd.bind(this)
      };
  }

  flipBoard() {
    this.board.flip();
  }

  resetBoard() {
    this.chessService.isPlaying(this.authService.afAuth.auth.currentUser.uid, this.getCurrentColor()).take(1).subscribe((isPlaying:boolean) => {
      if(isPlaying) {
        this.game.reset()
        this.board.start();
        this.removeHighlight();
        // send data to firebase
        this.updateFirebasePosition();
      }
    });
  }

  updateFirebasePosition() {
    this.chessService.updateChessboardState(this.game.fen(), this.game.turn());
  }

  onDrop(source, target) {
    // see if the move is legal
    var move = this.game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return 'snapback';
  }

  // do not pick up pieces if the game is over
  // only pick up pieces for the side to move
  onDragStart(source, piece, position, orientation) {
    if (this.game.game_over() === true ||
        this.currentPlayerColor != this.game.turn() ||
        (this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  }

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  onSnapEnd() {
    // send data to firebase
    this.updateFirebasePosition();
    // update firebase move history
    let lastPlayedTurns = this.game.history({ verbose: true });
    this.chessService.players.valueChanges().take(1).subscribe((players:any) => {
      lastPlayedTurns.forEach(turn => this.chessService.getGameHistory().push({ white: players.white, black: players.black, turn: turn }));
    });
    // update the board
    this.board.position(this.game.fen());
  }

  updateStatus() {
    var status = '';
    var moveColor = 'White';

    if (this.game.turn() === 'b') {
      moveColor = 'Black';
    }

    // checkmate?
    if (this.game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
    }

    // draw?
    else if (this.game.in_draw() === true) {
      status = 'Game over, drawn position';
    }

    // game still on
    else {
      status = moveColor + ' to move';
      // check?
      if (this.game.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }
    }

    //this.statusEl.html(status);
    //this.fenEl.html(this.game.fen());
    //this.pgnEl.html(this.game.pgn());
  }

  getCurrentColor():CurrentPlayer {
    return this.game.turn() === 'w' ? CurrentPlayer.white : CurrentPlayer.black;
  }
  ngOnInit() {
    this.game = new Chess();
    this.board = Chessboard('board', this.cfg);

    // update come from firebase
    this.chessService.chessboard.valueChanges().subscribe(data => {
      this.game.load(data.state);
      this.board.position(data.state);
      // this.highlightPosition(this.game.history({ verbose: true })[0]);
      this.timer.reset();
    });

    // Display (highlight on the board) last move
    this.chessService.getGameHistory().snapshotChanges(['child_added']).subscribe(actions => {
      actions.forEach(action => {
          let game = action.payload.val();
          this.highlightPosition(game.turn);
      });
    });

    // update current player color to display who is the turn of
    this.authService.afAuth.authState.take(1).subscribe(user => {
      this.chessService.players.valueChanges().subscribe(p => {
        if(user == null)
          this.currentPlayerColor = '';
        else
          this.currentPlayerColor = p.white == user.uid ? 'w' :  p.black == this.authService.afAuth.auth.currentUser.uid ? 'b' : '';
      });
    });

    this.updateStatus();
  }

  removeHighlight() {
    let squares = this.boardElement.nativeElement.querySelectorAll('.' + this.squareClass);
    if(squares)
      squares.forEach(square => square.classList.remove('highlight'));
  }

  highlightPosition(move: any) {
    //{ color: 'w', from: 'e2', to: 'e4', flags: 'b', piece: 'p', san: 'e4' }
    if(!move)
      return;

    this.removeHighlight();

    // if initial position: nothing to show
    if(this.game.fen() === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
      return;

    let squareTo = this.boardElement.nativeElement.querySelector('.square-' + move.to);
    let squareFrom = this.boardElement.nativeElement.querySelector('.square-' + move.from);

    if(squareTo)
      squareTo.classList.add('highlight');
    if(squareFrom)
      squareFrom.classList.add('highlight');
  }

}
