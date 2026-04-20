package com.fitnessclub.reservation.dto;

import com.fitnessclub.reservation.entity.Booking;
import com.fitnessclub.reservation.entity.BookingStatus;
import com.fitnessclub.reservation.entity.BookingType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class BookingResponse {

    private UUID id;
    private UUID memberId;
    private UUID classSessionId;
    private UUID facilityId;
    private String className;
    private String facilityName;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingType bookingType;
    private BookingStatus status;
    private Integer waitlistPosition;

    public static BookingResponse from(Booking booking) {
        BookingResponse r = new BookingResponse();
        r.id = booking.getId();
        r.memberId = booking.getMemberId();
        r.classSessionId = booking.getClassSessionId();
        r.facilityId = booking.getFacilityId();
        r.slotDate = booking.getSlotDate();
        r.startTime = booking.getStartTime();
        r.endTime = booking.getEndTime();
        r.bookingType = booking.getBookingType();
        r.status = booking.getStatus();
        return r;
    }

    public void setClassName(String className) { this.className = className; }
    public void setFacilityName(String facilityName) { this.facilityName = facilityName; }
    public void setWaitlistPosition(Integer waitlistPosition) { this.waitlistPosition = waitlistPosition; }

    public UUID getId() { return id; }
    public UUID getMemberId() { return memberId; }
    public UUID getClassSessionId() { return classSessionId; }
    public UUID getFacilityId() { return facilityId; }
    public String getClassName() { return className; }
    public String getFacilityName() { return facilityName; }
    public LocalDate getSlotDate() { return slotDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public BookingType getBookingType() { return bookingType; }
    public BookingStatus getStatus() { return status; }
    public Integer getWaitlistPosition() { return waitlistPosition; }
}
