package bham.team.domain;

import static bham.team.domain.ActionTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import bham.team.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ActionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Action.class);
        Action action1 = getActionSample1();
        Action action2 = new Action();
        assertThat(action1).isNotEqualTo(action2);

        action2.setId(action1.getId());
        assertThat(action1).isEqualTo(action2);

        action2 = getActionSample2();
        assertThat(action1).isNotEqualTo(action2);
    }
}
