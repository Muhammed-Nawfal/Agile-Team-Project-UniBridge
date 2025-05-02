import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../message-thread.test-samples';

import { MessageThreadFormService } from './message-thread-form.service';

describe('MessageThread Form Service', () => {
  let service: MessageThreadFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageThreadFormService);
  });

  describe('Service methods', () => {
    describe('createMessageThreadFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createMessageThreadFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            isGroup: expect.any(Object),
            name: expect.any(Object),
            createdOn: expect.any(Object),
            updatedOn: expect.any(Object),
            friendChat: expect.any(Object),
            matchChat: expect.any(Object),
            participants: expect.any(Object),
          }),
        );
      });

      it('passing IMessageThread should create a new form with FormGroup', () => {
        const formGroup = service.createMessageThreadFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            isGroup: expect.any(Object),
            name: expect.any(Object),
            createdOn: expect.any(Object),
            updatedOn: expect.any(Object),
            friendChat: expect.any(Object),
            matchChat: expect.any(Object),
            participants: expect.any(Object),
          }),
        );
      });
    });

    describe('getMessageThread', () => {
      it('should return NewMessageThread for default MessageThread initial value', () => {
        const formGroup = service.createMessageThreadFormGroup(sampleWithNewData);

        const messageThread = service.getMessageThread(formGroup) as any;

        expect(messageThread).toMatchObject(sampleWithNewData);
      });

      it('should return NewMessageThread for empty MessageThread initial value', () => {
        const formGroup = service.createMessageThreadFormGroup();

        const messageThread = service.getMessageThread(formGroup) as any;

        expect(messageThread).toMatchObject({});
      });

      it('should return IMessageThread', () => {
        const formGroup = service.createMessageThreadFormGroup(sampleWithRequiredData);

        const messageThread = service.getMessageThread(formGroup) as any;

        expect(messageThread).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IMessageThread should not enable id FormControl', () => {
        const formGroup = service.createMessageThreadFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewMessageThread should disable id FormControl', () => {
        const formGroup = service.createMessageThreadFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
