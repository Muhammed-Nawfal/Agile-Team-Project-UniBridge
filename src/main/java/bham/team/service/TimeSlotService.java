package bham.team.service;

import bham.team.domain.Event;
import bham.team.domain.TimeSlot;
import bham.team.domain.enumeration.AvailabilityStatus;
import bham.team.repository.EventRepository;
import bham.team.repository.TimeSlotRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TimeSlotService implements CommandLineRunner {

    private final TimeSlotRepository timeSlotRepository;
    private final EventRepository eventRepository;

    public TimeSlotService(TimeSlotRepository timeSlotRepository, EventRepository eventRepository) {
        this.timeSlotRepository = timeSlotRepository;
        this.eventRepository = eventRepository;
    }

    public void generateTimeSlotsForNextDays(int daysAhead) {
        LocalDate today = LocalDate.now();
        List<Event> allEvents = eventRepository.findAll();

        for (Event event : allEvents) {
            // Skip events that don't have start/end times defined
            if (event.getStartTime() == null || event.getEndTime() == null) {
                continue;
            }

            Integer startTime = event.getStartTime();
            Integer endTime = event.getEndTime();

            // Handle events that span across midnight (endTime < startTime)
            int hourSpan = endTime > startTime ? endTime - startTime : (24 - startTime) + endTime;

            for (int i = 0; i < daysAhead; i++) {
                LocalDate targetDate = today.plusDays(i);

                // Generate time slots for each hour interval
                for (int hour = 0; hour < hourSpan; hour++) {
                    int currentStartHour = (startTime + hour) % 24;
                    int currentEndHour = (currentStartHour + 1) % 24;

                    // If end hour becomes 0 after modulo, it should be represented as 24 (midnight)
                    if (currentEndHour == 0) {
                        currentEndHour = 24;
                    }

                    // Check if a TimeSlot already exists for this specific hour interval
                    boolean exists = timeSlotRepository.existsByDateAndEventAndStartHourAndEndHour(
                        targetDate,
                        event,
                        currentStartHour,
                        currentEndHour
                    );

                    if (!exists) {
                        // Create new TimeSlot for this hour interval
                        TimeSlot timeSlot = new TimeSlot();
                        timeSlot.setDate(targetDate);
                        timeSlot.setStartHour(currentStartHour);
                        timeSlot.setEndHour(currentEndHour);
                        timeSlot.setCapacity(event.getCapacity() != null ? event.getCapacity() : event.getMaxSize());
                        timeSlot.setRemainingCapacity(timeSlot.getCapacity());
                        timeSlot.setStatus(AvailabilityStatus.AVAILABLE);
                        timeSlot.setEvent(event);

                        // Save the new TimeSlot
                        timeSlotRepository.save(timeSlot);
                    }
                }
            }
        }
    }

    @Override
    public void run(String... args) throws Exception {
        // Comment out or remove this pre-generation
        // generateTimeSlotsForNextDays(7);
    }

    // Comment out or remove the scheduled task
    // @Scheduled(cron = "0 0 3 * * ?")
    // public void dailyGenerateTimeSlots() {
    //     generateTimeSlotsForNextDays(90);
    // }

    // Add a new method to create a single time slot
    public TimeSlot createTimeSlotIfNotExists(LocalDate date, Event event, Integer startHour, Integer endHour) {
        // Check if a TimeSlot already exists
        TimeSlot existingSlot = timeSlotRepository.findByDateAndEventAndStartHourAndEndHour(date, event, startHour, endHour).orElse(null);

        if (existingSlot != null) {
            return existingSlot;
        }

        // Create new TimeSlot
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setDate(date);
        timeSlot.setStartHour(startHour);
        timeSlot.setEndHour(endHour);
        timeSlot.setCapacity(event.getCapacity() != null ? event.getCapacity() : event.getMaxSize());
        timeSlot.setRemainingCapacity(timeSlot.getCapacity());
        timeSlot.setStatus(AvailabilityStatus.AVAILABLE);
        timeSlot.setEvent(event);

        // Save and return the new TimeSlot
        return timeSlotRepository.save(timeSlot);
    }
}
