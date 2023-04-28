import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { MovesComponent } from './moves/moves.component';
import { environment } from '../environments/environment';
import { DataFirebaseService } from './services/data.firebase.service';
import { AuthFirebaseService } from './services/auth.firebase.service';
import { PlayersComponent } from './players/players.component';
import { ChronoComponent } from './chrono/chrono.component';
import { SpectatorsComponent } from './spectators/spectators.component';
import { TimerService } from './services/timer.service';
import { TooltipDirective } from './tooltip/tooltip.directive'

import { NguiOverlayManager } from './tooltip/overlay-manager'

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    PlayersComponent,
    ChronoComponent,
    SpectatorsComponent,
    MovesComponent,
    TooltipDirective
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [AngularFireDatabase, AngularFireAuth, DataFirebaseService, AuthFirebaseService, TimerService, NguiOverlayManager],
  bootstrap: [AppComponent]
})
export class AppModule { }
