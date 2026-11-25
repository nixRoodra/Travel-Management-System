import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FlightClass, TravelMode, TravelRequestStatus } from '../../shared/models/tms-enums.model';
import { CreateTravelRequestPayload, TravelRequestDto } from './travel-request.models';
import { TravelRequestService } from './travel-request.service';

describe('TravelRequestService', () => {
  let service: TravelRequestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TravelRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetches current employee travel requests', () => {
    const mockList: TravelRequestDto[] = [
      {
        id: 1,
        employeeId: 10,
        destination: 'London',
        purpose: 'Client workshop',
        travelMode: TravelMode.Flight,
        flightClass: FlightClass.Economy,
        trainClass: null,
        departureDate: '2026-12-01',
        returnDate: '2026-12-05',
        estimatedCost: 1850,
        status: TravelRequestStatus.Draft,
        createdAtUtc: '2026-11-25T10:00:00Z',
        submittedAtUtc: null,
      },
    ];

    let result: TravelRequestDto[] = [];
    service.getMyRequests().subscribe((res) => (result = res));

    const req = httpMock.expectOne('/api/travelrequests/my-requests');
    expect(req.request.method).toBe('GET');
    req.flush(mockList);

    expect(result).toEqual(mockList);
  });

  it('posts new draft and submits travel request', () => {
    const payload: CreateTravelRequestPayload = {
      destination: 'Berlin',
      purpose: 'Architecture Summit',
      travelMode: TravelMode.Flight,
      flightClass: FlightClass.Business,
      trainClass: null,
      departureDate: '2026-12-10',
      returnDate: '2026-12-13',
      estimatedCost: 2200,
    };

    service.create(payload).subscribe();
    const createReq = httpMock.expectOne('/api/travelrequests');
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body).toEqual(payload);
    createReq.flush({ ...payload, id: 5, employeeId: 10, status: TravelRequestStatus.Draft });

    service.submit(5).subscribe();
    const submitReq = httpMock.expectOne('/api/travelrequests/5/submit');
    expect(submitReq.request.method).toBe('POST');
    submitReq.flush({
      ...payload,
      id: 5,
      employeeId: 10,
      status: TravelRequestStatus.PendingManagerApproval,
    });
  });
});
