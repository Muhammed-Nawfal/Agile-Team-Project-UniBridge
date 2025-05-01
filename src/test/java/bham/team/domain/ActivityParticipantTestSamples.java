package bham.team.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class ActivityParticipantTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ActivityParticipant getActivityParticipantSample1() {
        return new ActivityParticipant().id(1L);
    }

    public static ActivityParticipant getActivityParticipantSample2() {
        return new ActivityParticipant().id(2L);
    }

    public static ActivityParticipant getActivityParticipantRandomSampleGenerator() {
        return new ActivityParticipant().id(longCount.incrementAndGet());
    }
}
