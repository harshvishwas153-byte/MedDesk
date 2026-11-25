package com.medicare.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
<<<<<<< HEAD
 * Doctor Model extending User, encapsulating specialty, qualifications, schedule, and fee.
=======
 * Doctor Model extending User, encapsulating specialty, qualifications and consultation fee.
>>>>>>> origin/main
 */
public class Doctor extends User {
    private static final long serialVersionUID = 1L;

<<<<<<< HEAD
    private String userId;
=======
>>>>>>> origin/main
    private String specialty;
    private String department;
    private String hospital;
    private double rating;
    private int reviewsCount;
    private BigDecimal consultationFee;
    private int experienceYears;
    private String about;
    private String education;
<<<<<<< HEAD
    private String availabilityStatus;
=======
>>>>>>> origin/main
    private List<String> availableDays;
    private List<String> timeSlots;

    public Doctor() {
        super();
        this.role = "DOCTOR";
<<<<<<< HEAD
        this.availabilityStatus = "AVAILABLE";
=======
>>>>>>> origin/main
        this.availableDays = new ArrayList<>();
        this.timeSlots = new ArrayList<>();
        this.consultationFee = BigDecimal.valueOf(500.00);
    }

    public Doctor(String id, String name, String email, String specialty, String department, BigDecimal fee) {
        super(id, name, email, "DOCTOR");
        this.specialty = specialty;
        this.department = department;
        this.consultationFee = fee;
<<<<<<< HEAD
        this.availabilityStatus = "AVAILABLE";
=======
>>>>>>> origin/main
        this.availableDays = new ArrayList<>();
        this.timeSlots = new ArrayList<>();
    }

    @Override
    public String getRoleDisplayName() {
        return "Attending Medical Specialist (" + this.specialty + ")";
    }

<<<<<<< HEAD
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    // Compatibility aliases matching relational column naming
    public String getSpecialization() { return specialty; }
    public void setSpecialization(String specialization) { this.specialty = specialization; }

=======
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

>>>>>>> origin/main
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(int reviewsCount) { this.reviewsCount = reviewsCount; }

<<<<<<< HEAD
    public int getReviewCount() { return reviewsCount; }
    public void setReviewCount(int reviewCount) { this.reviewsCount = reviewCount; }

=======
>>>>>>> origin/main
    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }

    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

<<<<<<< HEAD
    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

=======
>>>>>>> origin/main
    public List<String> getAvailableDays() { return availableDays; }
    public void setAvailableDays(List<String> availableDays) { this.availableDays = availableDays; }

    public List<String> getTimeSlots() { return timeSlots; }
    public void setTimeSlots(List<String> timeSlots) { this.timeSlots = timeSlots; }
}
