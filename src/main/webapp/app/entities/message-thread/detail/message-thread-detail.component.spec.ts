import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { MessageThreadDetailComponent } from './message-thread-detail.component';

describe('MessageThread Management Detail Component', () => {
  let comp: MessageThreadDetailComponent;
  let fixture: ComponentFixture<MessageThreadDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageThreadDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./message-thread-detail.component').then(m => m.MessageThreadDetailComponent),
              resolve: { messageThread: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(MessageThreadDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageThreadDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load messageThread on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', MessageThreadDetailComponent);

      // THEN
      expect(instance.messageThread()).toEqual(expect.objectContaining({ id: 123 }));
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
