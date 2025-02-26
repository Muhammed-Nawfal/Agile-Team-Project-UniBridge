package bham.team.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class ActionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Action getActionSample1() {
        return new Action().id(1L);
    }

    public static Action getActionSample2() {
        return new Action().id(2L);
    }

    public static Action getActionRandomSampleGenerator() {
        return new Action().id(longCount.incrementAndGet());
    }
}
