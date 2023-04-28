import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataFirebaseService } from '../services/data.firebase.service';

@Component({
  selector: 'moves',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './moves.component.html',
  styleUrls: ['./moves.component.css']
})
export class MovesComponent implements OnInit {
  /*{captured:"p", color:"b", flags:"c", from:"c5", piece:"n", san:"Nxd3+", to:"d3", html:''*/
  moves: any[];

  constructor(private db: DataFirebaseService) {
    this.moves = [];
  }

  ngOnInit() {
    this.db.getGameHistory().valueChanges().map(moves => {
      var result = [];

      // and take only last 6 elements
      moves.slice(-6).forEach(move => {
        let m = move.turn;

        let piece = this.pieceToChar(m.piece, m.color);

        let capturedPiece = m.captured ? this.pieceToChar(m.captured, m.color === 'w' ? 'b' : 'w') : '';
        let capturedText = m.captured ? `<span class="captured">${capturedPiece}</span>` : '';
        let colorText = m.color === 'w' ? 'White' : 'Black';

        let capturedPieceName = this.pieceToText(m.captured);
        let pieceName = this.pieceToText(m.piece);

        let capturedTitleText = m.captured ? ` and captured ${capturedPieceName}` : '';
        let flagTitle = this.flagToText(m.flags);
        let title = `${colorText} move ${pieceName} from ${m.from} to ${m.to}${capturedTitleText} (${flagTitle})`

        m['html'] = `${piece}${m.from}${m.to}${capturedText}`;
        m['title'] = title;
        result.push(m);
      });

      return result;
    }).subscribe(moves => this.moves = moves);
  }

  pieceToChar(piece:string, color:string) {
    let char = '';
    switch(piece){
      case 'p': char = color === 'b' ? '&#9823;' : '&#9817;'; break; // pawn
      case 'b': char = color === 'b' ? '&#9821;' : '&#9815;'; break; // bishop
      case 'n': char = color === 'b' ? '&#9822;' : '&#9816;'; break; // knight
      case 'r': char = color === 'b' ? '&#9820;' : '&#9814;'; break; // rook
      case 'q': char = color === 'b' ? '&#9819;' : '&#9813;'; break; // queen
      case 'k': char = color === 'b' ? '&#9818;;' : '&#9812;'; break; // king
    }

    return char;
  }

  pieceToText(piece:string) {
    let char = '';
    switch(piece){
      case 'p': char = 'pawn'; break; // pawn
      case 'b': char = 'bishop'; break; // bishop
      case 'n': char = 'knight'; break; // knight
      case 'r': char = 'rook'; break; // rook
      case 'q': char = 'queen'; break; // queen
      case 'k': char = 'king'; break; // king
    }

    return char;
  }

  flagToText(flag: string) {
    let text = '';
    switch(flag) {
      case 'n': text = 'non-capture'; break;
      case 'b': text = 'pawn push of two squares'; break;
      case 'e': text = 'en passant capture'; break;
      case 'c': text = 'standard capture'; break;
      case 'p': text = 'promotion'; break;
      case 'k': text = 'kingside castling'; break;
      case 'q': text = 'queenside castling'; break;
    }

    return text;
  }
}
