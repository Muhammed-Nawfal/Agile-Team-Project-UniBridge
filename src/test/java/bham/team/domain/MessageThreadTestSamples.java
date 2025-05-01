package bham.team.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class MessageThreadTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static MessageThread getMessageThreadSample1() {
        return new MessageThread().id(1L).name("name1");
    }

    public static MessageThread getMessageThreadSample2() {
        return new MessageThread().id(2L).name("name2");
    }

    public static MessageThread getMessageThreadRandomSampleGenerator() {
        return new MessageThread().id(longCount.incrementAndGet()).name(UUID.randomUUID().toString());
    }
}
