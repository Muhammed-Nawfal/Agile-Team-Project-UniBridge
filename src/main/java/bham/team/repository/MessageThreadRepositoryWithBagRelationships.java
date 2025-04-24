package bham.team.repository;

import bham.team.domain.MessageThread;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface MessageThreadRepositoryWithBagRelationships {
    Optional<MessageThread> fetchBagRelationships(Optional<MessageThread> messageThread);

    List<MessageThread> fetchBagRelationships(List<MessageThread> messageThreads);

    Page<MessageThread> fetchBagRelationships(Page<MessageThread> messageThreads);
}
