package bham.team.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class TimeSlotTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static TimeSlot getTimeSlotSample1() {
        return new TimeSlot().id(1L).startHour(1).endHour(1).capacity(1).remainingCapacity(1);
    }

    public static TimeSlot getTimeSlotSample2() {
        return new TimeSlot().id(2L).startHour(2).endHour(2).capacity(2).remainingCapacity(2);
    }

    public static TimeSlot getTimeSlotRandomSampleGenerator() {
        return new TimeSlot()
            .id(longCount.incrementAndGet())
            .startHour(intCount.incrementAndGet())
            .endHour(intCount.incrementAndGet())
            .capacity(intCount.incrementAndGet())
            .remainingCapacity(intCount.incrementAndGet());
    }
}
