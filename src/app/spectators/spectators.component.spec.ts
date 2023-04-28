import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpectatorsComponent } from './spectators.component';

describe('SpectatorsComponent', () => {
  let component: SpectatorsComponent;
  let fixture: ComponentFixture<SpectatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpectatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpectatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
