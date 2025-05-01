package bham.team.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class EventTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Event getEventSample1() {
        return new Event().id(1L).name("name1").value("value1").minSize(1).maxSize(1).startTime(1).endTime(1).capacity(1);
    }

    public static Event getEventSample2() {
        return new Event().id(2L).name("name2").value("value2").minSize(2).maxSize(2).startTime(2).endTime(2).capacity(2);
    }

    public static Event getEventRandomSampleGenerator() {
        return new Event()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .value(UUID.randomUUID().toString())
            .minSize(intCount.incrementAndGet())
            .maxSize(intCount.incrementAndGet())
            .startTime(intCount.incrementAndGet())
            .endTime(intCount.incrementAndGet())
            .capacity(intCount.incrementAndGet());
    }
}
