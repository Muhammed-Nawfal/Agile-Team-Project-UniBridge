package bham.team.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ActivityMatchTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ActivityMatch getActivityMatchSample1() {
        return new ActivityMatch().id(1L).location("location1");
    }

    public static ActivityMatch getActivityMatchSample2() {
        return new ActivityMatch().id(2L).location("location2");
    }

    public static ActivityMatch getActivityMatchRandomSampleGenerator() {
        return new ActivityMatch().id(longCount.incrementAndGet()).location(UUID.randomUUID().toString());
    }
}
