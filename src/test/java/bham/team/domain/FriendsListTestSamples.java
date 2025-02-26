package bham.team.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class FriendsListTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static FriendsList getFriendsListSample1() {
        return new FriendsList().id(1L);
    }

    public static FriendsList getFriendsListSample2() {
        return new FriendsList().id(2L);
    }

    public static FriendsList getFriendsListRandomSampleGenerator() {
        return new FriendsList().id(longCount.incrementAndGet());
    }
}
