import { Component, OnInit } from '@angular/core';
import { DataFirebaseService } from '../services/data.firebase.service';

@Component({
  selector: 'spectators',
  templateUrl: './spectators.component.html',
  styleUrls: ['./spectators.component.css']
})
export class SpectatorsComponent implements OnInit {
  spectators: any;
  constructor(private db: DataFirebaseService) {
    this.spectators = { total:0, online:0 };
  }

  ngOnInit() {
    this.db.getSpectators().subscribe(s => this.spectators = s);
  }
}
