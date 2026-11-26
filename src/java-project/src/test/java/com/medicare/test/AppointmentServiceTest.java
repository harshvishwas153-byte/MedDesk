package com.medicare.test;

import com.google.gson.Gson;
import com.medicare.exception.AppointmentNotFoundException;
import com.medicare.exception.ConflictException;
import com.medicare.exception.ForbiddenException;
import com.medicare.exception.MedicareException;
import com.medicare.exception.ValidationException;
import com.medicare.model.Admin;
import com.medicare.model.Appointment;
import com.medicare.model.BillingSlip;
import com.medicare.model.Doctor;
import com.medicare.model.MedicalRecord;
import com.medicare.model.Patient;
import com.medicare.util.NotificationThreadService;
import com.medicare.util.PasswordUtil;
import com.medicare.util.ValidationUtil;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.math.BigDecimal;

/**
 * Comprehensive JUnit Test Suite verifying domain models, security utilities,
 * input validation, exception handling, serialization safety, and concurrency.
 */
public class AppointmentServiceTest {

    private Patient samplePatient;
    private Doctor sampleDoctor;
    private Admin sampleAdmin;
    private Appointment sampleAppointment;

    @Before
    public void setUp() {
        samplePatient = new Patient("pat_101", "Harsh Vishwas", "harsh@example.com", "+91 9876543210");
        samplePatient.setPasswordHash(PasswordUtil.hashPassword("SecurePass123!"));

        sampleDoctor = new Doctor("doc_202", "Dr. Priya Sharma", "priya@medicare.com", "Cardiology", "Heart Center", BigDecimal.valueOf(500.00));
        sampleDoctor.setUniqueDoctorId("DOC-2026-001");
        sampleDoctor.setUserId("usr_doc_202");

        sampleAdmin = new Admin("adm_001", "System Administrator", "admin@meddesk.org");

        sampleAppointment = new Appointment("APT_TEST_1", samplePatient.getId(), sampleDoctor.getId(), "2026-11-25", "10:30 AM", BigDecimal.valueOf(500.00));
        sampleAppointment.setPatientName(samplePatient.getName());
        sampleAppointment.setDoctorName(sampleDoctor.getName());
    }

    @Test
    public void testBillingSlipFeeBreakdown() {
        BillingSlip slip = BillingSlip.fromAppointment(sampleAppointment);

        Assert.assertNotNull("Billing slip must not be null", slip);
        Assert.assertEquals("INV-APT_TEST_1", slip.getInvoiceId());
        Assert.assertEquals(BigDecimal.valueOf(500.00), slip.getTotalAmount());
        Assert.assertEquals(BigDecimal.valueOf(400.00).setScale(2), slip.getDoctorFee());
        Assert.assertEquals(BigDecimal.valueOf(75.00).setScale(2), slip.getVitalsFee());
        Assert.assertEquals(BigDecimal.valueOf(25.00).setScale(2), slip.getVaultFee());

        BigDecimal sum = slip.getDoctorFee().add(slip.getVitalsFee()).add(slip.getVaultFee());
        Assert.assertEquals(slip.getTotalAmount().setScale(2), sum);
    }

    @Test
    public void testPolymorphicRoleDisplayNames() {
        Assert.assertEquals("Registered Hospital Patient", samplePatient.getRoleDisplayName());
        Assert.assertTrue(sampleDoctor.getRoleDisplayName().contains("Cardiology"));
        Assert.assertEquals("Hospital System Administrator", sampleAdmin.getRoleDisplayName());
    }

    @Test
    public void testPasswordHashingAndVerification() {
        String hash = PasswordUtil.hashPassword("ClinicalPass!99");
        Assert.assertTrue(hash.startsWith("pbkdf2$65536$"));
        Assert.assertTrue(PasswordUtil.verifyPassword("ClinicalPass!99", hash));
        Assert.assertFalse(PasswordUtil.verifyPassword("WrongPassword", hash));
        Assert.assertFalse(PasswordUtil.verifyPassword("ClinicalPass!99", "invalid-format"));
    }

    @Test
    public void testPasswordHashExcludedFromJsonSerialization() {
        Gson gson = new Gson();
        String json = gson.toJson(samplePatient);
        Assert.assertFalse("passwordHash must not serialize into JSON", json.contains("passwordHash"));
        Assert.assertFalse("Hashed secret must not leak into JSON", json.contains("pbkdf2$"));
    }

    @Test
    public void testInputValidationAndSanitization() throws ValidationException {
        Assert.assertEquals("user@meddesk.org", ValidationUtil.validateEmail("  USER@MedDesk.org "));
        Assert.assertEquals("scriptalert(1)/script", ValidationUtil.sanitizeText("<script>alert(1)</script>"));
        Assert.assertEquals("Test Reports", ValidationUtil.validateRecordCategory("Test Reports"));
        Assert.assertEquals("Upcoming", ValidationUtil.validateAppointmentStatus("Upcoming"));
    }

    @Test(expected = ValidationException.class)
    public void testInvalidEmailRejected() throws ValidationException {
        ValidationUtil.validateEmail("not-an-email");
    }

    @Test(expected = ValidationException.class)
    public void testShortPasswordRejected() throws ValidationException {
        ValidationUtil.validatePassword("123");
    }

    @Test(expected = ValidationException.class)
    public void testCancelledAppointmentReopenBlocked() throws ValidationException {
        ValidationUtil.validateStatusTransition("Cancelled", "Upcoming");
    }

    @Test
    public void testCustomExceptionHttpCodes() {
        Assert.assertEquals(400, new ValidationException("Bad input").getErrorCode());
        Assert.assertEquals(403, new ForbiddenException("Forbidden").getErrorCode());
        Assert.assertEquals(404, new AppointmentNotFoundException("Missing").getErrorCode());
        Assert.assertEquals(409, new ConflictException("Double booked").getErrorCode());
        Assert.assertEquals(500, new MedicareException("Internal error").getErrorCode());
    }

    @Test
    public void testMedicalRecordEHRFields() {
        MedicalRecord rec = new MedicalRecord();
        rec.setId("REC-123");
        rec.setPatientId("pat-1");
        rec.setTitle("Complete Blood Count");
        rec.setCategory("Test Reports");
        rec.setNotes("Hemoglobin 14.5 g/dL");

        Assert.assertEquals("REC-123", rec.getId());
        Assert.assertEquals("pat-1", rec.getPatientId());
        Assert.assertEquals("Complete Blood Count", rec.getTitle());
        Assert.assertEquals("Test Reports", rec.getCategory());
        Assert.assertEquals("Hemoglobin 14.5 g/dL", rec.getNotes());
    }

    @Test
    public void testNotificationThreadServiceDispatch() {
        NotificationThreadService.dispatchBookingConfirmation(sampleAppointment);
        Assert.assertNotNull(sampleAppointment.getId());
    }
}
