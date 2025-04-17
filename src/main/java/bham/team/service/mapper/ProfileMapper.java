package bham.team.service.mapper;

import bham.team.domain.Profile;
import bham.team.service.dto.ProfileDTO;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileMapper {

    @Autowired
    private UserMapper userMapper;

    public ProfileDTO toDto(Profile profile) {
        if (profile == null) {
            return null;
        }

        ProfileDTO profileDTO = new ProfileDTO();
        profileDTO.setId(profile.getId());
        // Map other fields from Profile to ProfileDTO
        // ...

        // Map the user firstName and lastName
        if (profile.getUser() != null) {
            profileDTO.setUserFirstName(profile.getUser().getFirstName());
            profileDTO.setUserLastName(profile.getUser().getLastName());
        }

        return profileDTO;
    }

    public List<ProfileDTO> toDtoList(List<Profile> profiles) {
        return profiles.stream().filter(Objects::nonNull).map(this::toDto).collect(Collectors.toList());
    }

    public Profile toEntity(ProfileDTO profileDTO) {
        if (profileDTO == null) {
            return null;
        }

        Profile profile = new Profile();
        profile.setId(profileDTO.getId());
        // Map other fields...

        return profile;
    }

    public List<Profile> toEntityList(List<ProfileDTO> profileDTOs) {
        return profileDTOs.stream().filter(Objects::nonNull).map(this::toEntity).collect(Collectors.toList());
    }
}
