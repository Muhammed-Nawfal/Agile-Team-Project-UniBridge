import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITimeSlot } from 'app/entities/time-slot/time-slot.model';
import { TimeSlotService } from 'app/entities/time-slot/service/time-slot.service';
import { IActivity } from 'app/entities/activity/activity.model';
import { ActivityService } from 'app/entities/activity/service/activity.service';
import { ILocation } from 'app/entities/location/location.model';
import { LocationService } from 'app/entities/location/service/location.service';
import { IProfile } from 'app/entities/profile/profile.model';
import { ProfileService } from 'app/entities/profile/service/profile.service';
import { IBooking } from '../booking.model';
import { BookingService } from '../service/booking.service';
import { BookingFormService } from './booking-form.service';

import { BookingUpdateComponent } from './booking-update.component';

describe('Booking Management Update Component', () => {
  let comp: BookingUpdateComponent;
  let fixture: ComponentFixture<BookingUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let bookingFormService: BookingFormService;
  let bookingService: BookingService;
  let timeSlotService: TimeSlotService;
  let activityService: ActivityService;
  let locationService: LocationService;
  let profileService: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookingUpdateComponent],
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
      .overrideTemplate(BookingUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(BookingUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    bookingFormService = TestBed.inject(BookingFormService);
    bookingService = TestBed.inject(BookingService);
    timeSlotService = TestBed.inject(TimeSlotService);
    activityService = TestBed.inject(ActivityService);
    locationService = TestBed.inject(LocationService);
    profileService = TestBed.inject(ProfileService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call TimeSlot query and add missing value', () => {
      const booking: IBooking = { id: 456 };
      const timeSlots: ITimeSlot = { id: 17150 };
      booking.timeSlots = timeSlots;
      const timeSlot: ITimeSlot = { id: 18288 };
      booking.timeSlot = timeSlot;

      const timeSlotCollection: ITimeSlot[] = [{ id: 7196 }];
      jest.spyOn(timeSlotService, 'query').mockReturnValue(of(new HttpResponse({ body: timeSlotCollection })));
      const additionalTimeSlots = [timeSlots, timeSlot];
      const expectedCollection: ITimeSlot[] = [...additionalTimeSlots, ...timeSlotCollection];
      jest.spyOn(timeSlotService, 'addTimeSlotToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ booking });
      comp.ngOnInit();

      expect(timeSlotService.query).toHaveBeenCalled();
      expect(timeSlotService.addTimeSlotToCollectionIfMissing).toHaveBeenCalledWith(
        timeSlotCollection,
        ...additionalTimeSlots.map(expect.objectContaining),
      );
      expect(comp.timeSlotsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Activity query and add missing value', () => {
      const booking: IBooking = { id: 456 };
      const bookedActivity: IActivity = { id: 2567 };
      booking.bookedActivity = bookedActivity;
      const activity: IActivity = { id: 24941 };
      booking.activity = activity;

      const activityCollection: IActivity[] = [{ id: 26036 }];
      jest.spyOn(activityService, 'query').mockReturnValue(of(new HttpResponse({ body: activityCollection })));
      const additionalActivities = [bookedActivity, activity];
      const expectedCollection: IActivity[] = [...additionalActivities, ...activityCollection];
      jest.spyOn(activityService, 'addActivityToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ booking });
      comp.ngOnInit();

      expect(activityService.query).toHaveBeenCalled();
      expect(activityService.addActivityToCollectionIfMissing).toHaveBeenCalledWith(
        activityCollection,
        ...additionalActivities.map(expect.objectContaining),
      );
      expect(comp.activitiesSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Location query and add missing value', () => {
      const booking: IBooking = { id: 456 };
      const bookingLocation: ILocation = { id: 16771 };
      booking.bookingLocation = bookingLocation;

      const locationCollection: ILocation[] = [{ id: 12348 }];
      jest.spyOn(locationService, 'query').mockReturnValue(of(new HttpResponse({ body: locationCollection })));
      const additionalLocations = [bookingLocation];
      const expectedCollection: ILocation[] = [...additionalLocations, ...locationCollection];
      jest.spyOn(locationService, 'addLocationToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ booking });
      comp.ngOnInit();

      expect(locationService.query).toHaveBeenCalled();
      expect(locationService.addLocationToCollectionIfMissing).toHaveBeenCalledWith(
        locationCollection,
        ...additionalLocations.map(expect.objectContaining),
      );
      expect(comp.locationsSharedCollection).toEqual(expectedCollection);
    });

    it('Should call Profile query and add missing value', () => {
      const booking: IBooking = { id: 456 };
      const creator: IProfile = { id: 7658 };
      booking.creator = creator;

      const profileCollection: IProfile[] = [{ id: 10784 }];
      jest.spyOn(profileService, 'query').mockReturnValue(of(new HttpResponse({ body: profileCollection })));
      const additionalProfiles = [creator];
      const expectedCollection: IProfile[] = [...additionalProfiles, ...profileCollection];
      jest.spyOn(profileService, 'addProfileToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ booking });
      comp.ngOnInit();

      expect(profileService.query).toHaveBeenCalled();
      expect(profileService.addProfileToCollectionIfMissing).toHaveBeenCalledWith(
        profileCollection,
        ...additionalProfiles.map(expect.objectContaining),
      );
      expect(comp.profilesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const booking: IBooking = { id: 456 };
      const timeSlots: ITimeSlot = { id: 21013 };
      booking.timeSlots = timeSlots;
      const timeSlot: ITimeSlot = { id: 3081 };
      booking.timeSlot = timeSlot;
      const bookedActivity: IActivity = { id: 13016 };
      booking.bookedActivity = bookedActivity;
      const activity: IActivity = { id: 4910 };
      booking.activity = activity;
      const bookingLocation: ILocation = { id: 17644 };
      booking.bookingLocation = bookingLocation;
      const creator: IProfile = { id: 17900 };
      booking.creator = creator;

      activatedRoute.data = of({ booking });
      comp.ngOnInit();

      expect(comp.timeSlotsSharedCollection).toContain(timeSlots);
      expect(comp.timeSlotsSharedCollection).toContain(timeSlot);
      expect(comp.activitiesSharedCollection).toContain(bookedActivity);
      expect(comp.activitiesSharedCollection).toContain(activity);
      expect(comp.locationsSharedCollection).toContain(bookingLocation);
      expect(comp.profilesSharedCollection).toContain(creator);
      expect(comp.booking).toEqual(booking);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBooking>>();
      const booking = { id: 123 };
      jest.spyOn(bookingFormService, 'getBooking').mockReturnValue(booking);
      jest.spyOn(bookingService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ booking });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: booking }));
      saveSubject.complete();

      // THEN
      expect(bookingFormService.getBooking).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(bookingService.update).toHaveBeenCalledWith(expect.objectContaining(booking));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBooking>>();
      const booking = { id: 123 };
      jest.spyOn(bookingFormService, 'getBooking').mockReturnValue({ id: null });
      jest.spyOn(bookingService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ booking: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: booking }));
      saveSubject.complete();

      // THEN
      expect(bookingFormService.getBooking).toHaveBeenCalled();
      expect(bookingService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IBooking>>();
      const booking = { id: 123 };
      jest.spyOn(bookingService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ booking });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(bookingService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTimeSlot', () => {
      it('Should forward to timeSlotService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(timeSlotService, 'compareTimeSlot');
        comp.compareTimeSlot(entity, entity2);
        expect(timeSlotService.compareTimeSlot).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareActivity', () => {
      it('Should forward to activityService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(activityService, 'compareActivity');
        comp.compareActivity(entity, entity2);
        expect(activityService.compareActivity).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareLocation', () => {
      it('Should forward to locationService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(locationService, 'compareLocation');
        comp.compareLocation(entity, entity2);
        expect(locationService.compareLocation).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareProfile', () => {
      it('Should forward to profileService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(profileService, 'compareProfile');
        comp.compareProfile(entity, entity2);
        expect(profileService.compareProfile).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
