package bham.team.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ChallengeTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Challenge getChallengeSample1() {
        return new Challenge().id(1L).title("title1").points(1);
    }

    public static Challenge getChallengeSample2() {
        return new Challenge().id(2L).title("title2").points(2);
    }

    public static Challenge getChallengeRandomSampleGenerator() {
        return new Challenge().id(longCount.incrementAndGet()).title(UUID.randomUUID().toString()).points(intCount.incrementAndGet());
    }
}
