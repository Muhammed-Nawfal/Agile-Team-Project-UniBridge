import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEvent } from 'app/entities/event/event.model';
import { EventService } from 'app/entities/event/service/event.service';
import { TimeSlotService } from '../service/time-slot.service';
import { ITimeSlot } from '../time-slot.model';
import { TimeSlotFormService } from './time-slot-form.service';

import { TimeSlotUpdateComponent } from './time-slot-update.component';

describe('TimeSlot Management Update Component', () => {
  let comp: TimeSlotUpdateComponent;
  let fixture: ComponentFixture<TimeSlotUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let timeSlotFormService: TimeSlotFormService;
  let timeSlotService: TimeSlotService;
  let eventService: EventService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimeSlotUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(TimeSlotUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TimeSlotUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    timeSlotFormService = TestBed.inject(TimeSlotFormService);
    timeSlotService = TestBed.inject(TimeSlotService);
    eventService = TestBed.inject(EventService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Event query and add missing value', () => {
      const timeSlot: ITimeSlot = { id: 456 };
      const event: IEvent = { id: 8117 };
      timeSlot.event = event;

      const eventCollection: IEvent[] = [{ id: 24302 }];
      jest.spyOn(eventService, 'query').mockReturnValue(of(new HttpResponse({ body: eventCollection })));
      const additionalEvents = [event];
      const expectedCollection: IEvent[] = [...additionalEvents, ...eventCollection];
      jest.spyOn(eventService, 'addEventToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeSlot });
      comp.ngOnInit();

      expect(eventService.query).toHaveBeenCalled();
      expect(eventService.addEventToCollectionIfMissing).toHaveBeenCalledWith(
        eventCollection,
        ...additionalEvents.map(expect.objectContaining),
      );
      expect(comp.eventsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const timeSlot: ITimeSlot = { id: 456 };
      const event: IEvent = { id: 3788 };
      timeSlot.event = event;

      activatedRoute.data = of({ timeSlot });
      comp.ngOnInit();

      expect(comp.eventsSharedCollection).toContain(event);
      expect(comp.timeSlot).toEqual(timeSlot);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSlot>>();
      const timeSlot = { id: 123 };
      jest.spyOn(timeSlotFormService, 'getTimeSlot').mockReturnValue(timeSlot);
      jest.spyOn(timeSlotService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSlot });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeSlot }));
      saveSubject.complete();

      // THEN
      expect(timeSlotFormService.getTimeSlot).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(timeSlotService.update).toHaveBeenCalledWith(expect.objectContaining(timeSlot));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSlot>>();
      const timeSlot = { id: 123 };
      jest.spyOn(timeSlotFormService, 'getTimeSlot').mockReturnValue({ id: null });
      jest.spyOn(timeSlotService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSlot: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeSlot }));
      saveSubject.complete();

      // THEN
      expect(timeSlotFormService.getTimeSlot).toHaveBeenCalled();
      expect(timeSlotService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSlot>>();
      const timeSlot = { id: 123 };
      jest.spyOn(timeSlotService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSlot });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(timeSlotService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareEvent', () => {
      it('Should forward to eventService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(eventService, 'compareEvent');
        comp.compareEvent(entity, entity2);
        expect(eventService.compareEvent).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
