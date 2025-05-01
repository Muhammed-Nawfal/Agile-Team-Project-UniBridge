import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { FriendsListDetailComponent } from './friends-list-detail.component';

describe('FriendsList Management Detail Component', () => {
  let comp: FriendsListDetailComponent;
  let fixture: ComponentFixture<FriendsListDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendsListDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./friends-list-detail.component').then(m => m.FriendsListDetailComponent),
              resolve: { friendsList: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(FriendsListDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendsListDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load friendsList on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', FriendsListDetailComponent);

      // THEN
      expect(instance.friendsList()).toEqual(expect.objectContaining({ id: 123 }));
    });
  });

  describe('PreviousState', () => {
    it('Should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
