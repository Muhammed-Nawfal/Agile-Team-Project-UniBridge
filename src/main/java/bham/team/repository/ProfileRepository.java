package bham.team.repository;

import bham.team.domain.Profile;
import bham.team.domain.enumeration.ActivityType;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    @Query(
        "SELECT DISTINCT profile FROM Profile profile " +
        "LEFT JOIN FETCH profile.user user " +
        "WHERE profile.preferredActivities = :activityType"
    )
    List<Profile> findByPreferredActivity(@Param("activityType") ActivityType activityType);
}
//package bham.team.repository;
//
//import bham.team.domain.Profile;
//import bham.team.domain.enumeration.ActivityType;
//import org.springframework.data.jpa.repository.*;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
///**
// * Spring Data JPA repository for the Profile entity.
// */
//@SuppressWarnings("unused")
//@Repository
//public interface ProfileRepository extends JpaRepository<Profile, Long> {
//
////    @Query("SELECT profile, user.firstName, user.lastName " +
////        "FROM Profile profile " +
////        "JOIN profile.user user " +
////        "WHERE profile.preferredActivities = :activityType ")
////    List<Object[]> findByPreferredActivity(@Param("activityType") ActivityType activityType);
////}
//
//    @Query("SELECT DISTINCT profile FROM Profile profile " +
//        "LEFT JOIN FETCH profile.user user " +
//        "WHERE profile.preferredActivities = :activityType")
//    List<Profile> findByPreferredActivity(@Param("activityType") ActivityType activityType);
//}
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
////    @Query("SELECT DISTINCT profile FROM Profile profile " +
////        "LEFT JOIN FETCH profile.user user " +
////        "WHERE profile.preferredActivities = :activityType " +
////        "AND profile.user IS NOT NULL")
////    List<Profile> findByPreferredActivity(@Param("activityType") ActivityType activityType);
//
//
////}
