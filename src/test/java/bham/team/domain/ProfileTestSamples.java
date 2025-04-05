package bham.team.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ProfileTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Profile getProfileSample1() {
        return new Profile()
            .id(1L)
            .courseYear(1L)
            .university("university1")
            .preferredSociety("preferredSociety1")
            .preferredEvents("preferredEvents1");
    }

    public static Profile getProfileSample2() {
        return new Profile()
            .id(2L)
            .courseYear(2L)
            .university("university2")
            .preferredSociety("preferredSociety2")
            .preferredEvents("preferredEvents2");
    }

    public static Profile getProfileRandomSampleGenerator() {
        return new Profile()
            .id(longCount.incrementAndGet())
            .courseYear(longCount.incrementAndGet())
            .university(UUID.randomUUID().toString())
            .preferredSociety(UUID.randomUUID().toString())
            .preferredEvents(UUID.randomUUID().toString());
    }
}
