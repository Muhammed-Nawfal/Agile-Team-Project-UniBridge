package bham.team.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class BookingTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Booking getBookingSample1() {
        return new Booking().id(1L).bookingName("bookingName1").phoneNum("phoneNum1").numOfParticipants(1);
    }

    public static Booking getBookingSample2() {
        return new Booking().id(2L).bookingName("bookingName2").phoneNum("phoneNum2").numOfParticipants(2);
    }

    public static Booking getBookingRandomSampleGenerator() {
        return new Booking()
            .id(longCount.incrementAndGet())
            .bookingName(UUID.randomUUID().toString())
            .phoneNum(UUID.randomUUID().toString())
            .numOfParticipants(intCount.incrementAndGet());
    }
}
