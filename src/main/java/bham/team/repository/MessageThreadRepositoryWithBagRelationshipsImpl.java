package bham.team.repository;

import bham.team.domain.MessageThread;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class MessageThreadRepositoryWithBagRelationshipsImpl implements MessageThreadRepositoryWithBagRelationships {

    private static final String ID_PARAMETER = "id";
    private static final String MESSAGETHREADS_PARAMETER = "messageThreads";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<MessageThread> fetchBagRelationships(Optional<MessageThread> messageThread) {
        return messageThread.map(this::fetchParticipants);
    }

    @Override
    public Page<MessageThread> fetchBagRelationships(Page<MessageThread> messageThreads) {
        return new PageImpl<>(
            fetchBagRelationships(messageThreads.getContent()),
            messageThreads.getPageable(),
            messageThreads.getTotalElements()
        );
    }

    @Override
    public List<MessageThread> fetchBagRelationships(List<MessageThread> messageThreads) {
        return Optional.of(messageThreads).map(this::fetchParticipants).orElse(Collections.emptyList());
    }

    MessageThread fetchParticipants(MessageThread result) {
        return entityManager
            .createQuery(
                "select messageThread from MessageThread messageThread left join fetch messageThread.participants where messageThread.id = :id",
                MessageThread.class
            )
            .setParameter(ID_PARAMETER, result.getId())
            .getSingleResult();
    }

    List<MessageThread> fetchParticipants(List<MessageThread> messageThreads) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, messageThreads.size()).forEach(index -> order.put(messageThreads.get(index).getId(), index));
        List<MessageThread> result = entityManager
            .createQuery(
                "select messageThread from MessageThread messageThread left join fetch messageThread.participants where messageThread in :messageThreads",
                MessageThread.class
            )
            .setParameter(MESSAGETHREADS_PARAMETER, messageThreads)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
