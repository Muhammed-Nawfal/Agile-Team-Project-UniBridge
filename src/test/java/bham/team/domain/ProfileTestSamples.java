package bham.team.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ProfileTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Profile getProfileSample1() {
        return new Profile().id(1L).login("login1").firstName("firstName1").lastName("lastName1").courseYear(1L);
    }

    public static Profile getProfileSample2() {
        return new Profile().id(2L).login("login2").firstName("firstName2").lastName("lastName2").courseYear(2L);
    }

    public static Profile getProfileRandomSampleGenerator() {
        return new Profile()
            .id(longCount.incrementAndGet())
            .login(UUID.randomUUID().toString())
            .firstName(UUID.randomUUID().toString())
            .lastName(UUID.randomUUID().toString())
            .courseYear(longCount.incrementAndGet());
    }
}
