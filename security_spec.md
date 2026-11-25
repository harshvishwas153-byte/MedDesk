# MedDesk Firestore Security Specification

1. **Default Deny**: Any unmatched path is denied (`allow read, write: if false`).
2. **Authentication Gate**: All sensitive patient, appointment, EHR record, consultation, and notification operations require `request.auth != null`.
3. **No Plaintext Credentials in Firestore**: `users` and `doctors` documents must never store `loginPassword` or `passwordHash` fields in client-readable Firestore documents.
4. **Role & Ownership Enforcement**:
   - `users/{userId}`: Readable/updatable by the owning user (`request.auth.uid == userId`), clinical doctors (read-only dossier), or verified admin (`harshvishwas153@gmail.com` or `role == 'ADMIN'`). Public signup can only create `role == 'PATIENT'` with `status == 'Active'`. Role/status escalation is blocked.
   - `doctors/{doctorId}`: Publicly readable for doctor discovery; writable only by Admin (or the assigned doctor for their own clinical bio/fee).
   - `appointments/{appointmentId}`: Readable/writable only by the owning patient (`patientId == request.auth.uid`), the assigned doctor, or Admin.
   - `records/{recordId}`: Readable/creatable only by the owning patient, a verified doctor, or Admin.
   - `consultations/{consultationId}` & `consultation_messages/{messageId}`: Accessible only to authenticated patients (own sessions), doctors, or Admin.
   - `notifications/{notificationId}`: Readable/updatable only by the recipient (`recipientId == request.auth.uid`) or Admin.
   - `doctor_slots/{slotId}`: Readable for booking slot discovery; writable only by Doctor or Admin.
5. **Strict Input Validation**: Required fields, string length bounds, numeric bounds (`fee > 0`), and enum checks are enforced on write operations.
