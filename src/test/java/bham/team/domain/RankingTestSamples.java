package bham.team.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class RankingTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Ranking getRankingSample1() {
        return new Ranking().id(1L).reviewNumber(1).activityNumber(1);
    }

    public static Ranking getRankingSample2() {
        return new Ranking().id(2L).reviewNumber(2).activityNumber(2);
    }

    public static Ranking getRankingRandomSampleGenerator() {
        return new Ranking()
            .id(longCount.incrementAndGet())
            .reviewNumber(intCount.incrementAndGet())
            .activityNumber(intCount.incrementAndGet());
    }
}
