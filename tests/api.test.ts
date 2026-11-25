import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { createApp } from '../server.ts';

interface ApiResponse<T = any> {
  status: number;
  headers: Headers;
  body: T;
}

async function apiJson<T = any>(
  baseUrl: string,
  route: string,
  options: { method?: string; token?: string; body?: unknown } = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const res = await fetch(`${baseUrl}${route}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const body = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, headers: res.headers, body };
}

describe('MedDesk Authoritative Server API & Security Suite', () => {
  let server: http.Server;
  let baseUrl = '';
  let tmpDir = '';

  let adminToken = '';
  let patientAToken = '';
  let patientAId = '';
  let patientBToken = '';
  let doctorToken = '';
  let provisionedDoctorId = '';
  let provisionedDoctorUniqueId = '';
  let provisionedDoctorPassword = '';
  let bookedAppointmentId = '';
  let uploadedRecordId = '';

  before(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'meddesk-test-'));
    const dbPath = path.join(tmpDir, 'db.json');
    const app = createApp({ dbPath, adminPasscode: '' });
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address();
    assert.ok(addr && typeof addr === 'object');
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('serves health check and public bootstrap without exposing PHI', async () => {
    const health = await apiJson(baseUrl, '/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.ok, true);

    const boot = await apiJson(baseUrl, '/api/bootstrap');
    assert.equal(boot.status, 200);
    assert.equal(boot.body.authenticated, false);
    assert.equal(boot.body.adminClaimed, false);
    assert.ok(Array.isArray(boot.body.doctors) && boot.body.doctors.length >= 5);
    assert.equal(boot.body.users, undefined);
    assert.equal(boot.body.appointments, undefined);
    assert.equal(boot.body.records, undefined);
  });

  it('enforces first-run admin setup and prevents duplicate admin claim', async () => {
    const weak = await apiJson(baseUrl, '/api/auth/admin-setup', {
      method: 'POST',
      body: { password: 'short' },
    });
    assert.equal(weak.status, 400);

    const setup = await apiJson(baseUrl, '/api/auth/admin-setup', {
      method: 'POST',
      body: { password: 'AdminStrong!2026', name: 'Chief Administrator' },
    });
    assert.equal(setup.status, 201);
    assert.ok(setup.body.token);
    assert.equal(setup.body.user.role, 'ADMIN');
    assert.equal(setup.body.user.passwordHash, undefined);
    const setCookie = setup.headers.get('set-cookie') || '';
    assert.ok(setCookie.includes('HttpOnly'));
    adminToken = setup.body.token;

    const secondAttempt = await apiJson(baseUrl, '/api/auth/admin-setup', {
      method: 'POST',
      body: { password: 'AnotherPassword123' },
    });
    assert.equal(secondAttempt.status, 409);
  });

  it('rejects unauthenticated access to protected clinical routes', async () => {
    const appts = await apiJson(baseUrl, '/api/appointments');
    assert.equal(appts.status, 401);

    const recs = await apiJson(baseUrl, '/api/records');
    assert.equal(recs.status, 401);

    const addDoc = await apiJson(baseUrl, '/api/doctors', {
      method: 'POST',
      body: { name: 'Dr. Unauthorized' },
    });
    assert.equal(addDoc.status, 401);
  });

  it('registers patients with validation, duplicate protection, and password hash hiding', async () => {
    const invalid = await apiJson(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: { name: 'Bad', email: 'not-an-email', password: '123' },
    });
    assert.equal(invalid.status, 400);

    const regA = await apiJson(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Aarav Sharma',
        email: 'aarav.patient@example.com',
        password: 'PatientPass!2026',
        bloodGroup: 'O+',
      },
    });
    assert.equal(regA.status, 201);
    assert.equal(regA.body.user.role, 'PATIENT');
    assert.equal(regA.body.user.passwordHash, undefined);
    patientAToken = regA.body.token;
    patientAId = regA.body.user.id;

    const duplicate = await apiJson(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Aarav Duplicate',
        email: 'aarav.patient@example.com',
        password: 'PatientPass!2026',
      },
    });
    assert.equal(duplicate.status, 409);

    const regB = await apiJson(baseUrl, '/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Meera Nair',
        email: 'meera.patient@example.com',
        password: 'PatientPass!2026',
      },
    });
    assert.equal(regB.status, 201);
    patientBToken = regB.body.token;
  });

  it('blocks non-admin roles from admin directory & doctor provisioning', async () => {
    const listUsers = await apiJson(baseUrl, '/api/users', { token: patientAToken });
    assert.equal(listUsers.status, 200);
    assert.equal(Array.isArray(listUsers.body), true);
    assert.equal(listUsers.body.length, 1);
    assert.equal(listUsers.body[0].id, patientAId);

    const createUser = await apiJson(baseUrl, '/api/users', {
      method: 'POST',
      token: patientAToken,
      body: { name: 'Bypass User', email: 'bypassuser@meddesk.com', role: 'DOCTOR' },
    });
    assert.equal(createUser.status, 403);

    const addDoc = await apiJson(baseUrl, '/api/doctors', {
      method: 'POST',
      token: patientAToken,
      body: {
        name: 'Dr. Bypass',
        specialty: 'Cardiologist',
        department: 'Cardiology',
        hospital: 'MedDesk',
        email: 'bypass@meddesk.com',
      },
    });
    assert.equal(addDoc.status, 403);
  });

  it('allows admin to provision doctor, reset password, and doctor to log in via uniqueDoctorId', async () => {
    const created = await apiJson(baseUrl, '/api/doctors', {
      method: 'POST',
      token: adminToken,
      body: {
        name: 'Dr. Kavita Reddy',
        specialty: 'Neurologist',
        department: 'Neurology',
        hospital: 'MedDesk Neuro Center',
        experienceYears: 11,
        consultationFee: 750,
        education: 'MBBS, DM (Neurology)',
        about: 'Specialist in stroke care and neuro-diagnostics.',
        email: 'kavita.reddy@meddesk.com',
        uniqueDoctorId: 'DOC-2099',
      },
    });
    assert.equal(created.status, 201);
    assert.ok(created.body.temporaryPassword);
    assert.equal(created.body.doctor.uniqueDoctorId, 'DOC-2099');
    provisionedDoctorId = created.body.doctor.id;
    provisionedDoctorUniqueId = created.body.doctor.uniqueDoctorId;

    const reset = await apiJson(
      baseUrl,
      `/api/doctors/${encodeURIComponent(provisionedDoctorId)}/reset-password`,
      {
        method: 'POST',
        token: adminToken,
        body: {},
      }
    );
    assert.equal(reset.status, 200);
    assert.ok(reset.body.temporaryPassword);
    provisionedDoctorPassword = reset.body.temporaryPassword;

    const docLogin = await apiJson(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: {
        identifier: provisionedDoctorUniqueId,
        password: provisionedDoctorPassword,
        role: 'DOCTOR',
      },
    });
    assert.equal(docLogin.status, 200);
    assert.equal(docLogin.body.user.role, 'DOCTOR');
    doctorToken = docLogin.body.token;
  });

  it('enforces atomic appointment slot locking, server fee, billing slip, and cross-patient isolation', async () => {
    const booking = await apiJson(baseUrl, '/api/appointments', {
      method: 'POST',
      token: patientAToken,
      body: {
        doctorId: provisionedDoctorId,
        date: '2026-12-15',
        time: '10:30 AM',
        reason: 'Recurring migraine evaluation',
        paymentMethod: 'online',
        consultationType: 'In-Clinic',
      },
    });
    assert.equal(booking.status, 201);
    assert.equal(booking.body.appointment.fee, 750);
    assert.equal(booking.body.slip.totalAmount, 750);
    bookedAppointmentId = booking.body.appointment.id;

    // Concurrent / second patient attempt for same slot -> 409 Conflict
    const doubleBook = await apiJson(baseUrl, '/api/appointments', {
      method: 'POST',
      token: patientBToken,
      body: {
        doctorId: provisionedDoctorId,
        date: '2026-12-15',
        time: '10:30 AM',
        reason: 'Same slot conflict check',
      },
    });
    assert.equal(doubleBook.status, 409);

    // Patient B cannot view Patient A's OPD slip or cancel Patient A's appointment
    const slipForbidden = await apiJson(
      baseUrl,
      `/api/slip/${encodeURIComponent(bookedAppointmentId)}`,
      { token: patientBToken }
    );
    assert.equal(slipForbidden.status, 403);

    const cancelForbidden = await apiJson(
      baseUrl,
      `/api/appointments/${encodeURIComponent(bookedAppointmentId)}`,
      {
        method: 'PUT',
        token: patientBToken,
        body: { status: 'Cancelled' },
      }
    );
    assert.equal(cancelForbidden.status, 403);

    // Patient A can fetch own OPD billing slip
    const slipOwn = await apiJson(
      baseUrl,
      `/api/slip/${encodeURIComponent(bookedAppointmentId)}`,
      { token: patientAToken }
    );
    assert.equal(slipOwn.status, 200);
    assert.equal(slipOwn.body.slip.appointmentId, bookedAppointmentId);
  });

  it('allows doctor clinical notes/prescription update and blocks reopening cancelled appointments', async () => {
    const docUpdate = await apiJson(
      baseUrl,
      `/api/appointments/${encodeURIComponent(bookedAppointmentId)}`,
      {
        method: 'PUT',
        token: doctorToken,
        body: {
          notes: 'Neurological exam normal. Advise hydration & sleep hygiene.',
          prescription: 'Sumatriptan 50mg PRN',
          status: 'Completed',
        },
      }
    );
    assert.equal(docUpdate.status, 200);
    assert.equal(docUpdate.body.appointment.status, 'Completed');
    assert.equal(docUpdate.body.appointment.prescription, 'Sumatriptan 50mg PRN');

    // Now test cancellation + slot release on another slot
    const secondBooking = await apiJson(baseUrl, '/api/appointments', {
      method: 'POST',
      token: patientAToken,
      body: {
        doctorId: provisionedDoctorId,
        date: '2026-12-16',
        time: '11:00 AM',
        reason: 'Follow-up review',
      },
    });
    assert.equal(secondBooking.status, 201);
    const secondId = secondBooking.body.appointment.id;

    const cancelled = await apiJson(baseUrl, `/api/appointments/${encodeURIComponent(secondId)}`, {
      method: 'PUT',
      token: patientAToken,
      body: { status: 'Cancelled' },
    });
    assert.equal(cancelled.status, 200);
    assert.equal(cancelled.body.appointment.status, 'Cancelled');

    // Reopening a Cancelled appointment must be rejected
    const reopen = await apiJson(baseUrl, `/api/appointments/${encodeURIComponent(secondId)}`, {
      method: 'PUT',
      token: adminToken,
      body: { status: 'Upcoming' },
    });
    assert.equal(reopen.status, 400);

    // Freed slot can now be booked by Patient B
    const rebooked = await apiJson(baseUrl, '/api/appointments', {
      method: 'POST',
      token: patientBToken,
      body: {
        doctorId: provisionedDoctorId,
        date: '2026-12-16',
        time: '11:00 AM',
        reason: 'New booking on freed slot',
      },
    });
    assert.equal(rebooked.status, 201);
  });

  it('supports EHR medical records CRUD with ownership enforcement', async () => {
    const createdRec = await apiJson(baseUrl, '/api/records', {
      method: 'POST',
      token: patientAToken,
      body: {
        title: 'MRI Brain Screening',
        date: '15 Dec 2026',
        category: 'Test Reports',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        doctorName: 'Dr. Kavita Reddy',
        facility: 'MedDesk Neuro Center',
        notes: 'No acute intracranial abnormality.',
      },
    });
    assert.equal(createdRec.status, 201);
    uploadedRecordId = createdRec.body.record.id;
    assert.equal(createdRec.body.record.patientId, patientAId);

    // Patient B cannot see or delete Patient A's medical record
    const listB = await apiJson(baseUrl, '/api/records', { token: patientBToken });
    assert.equal(listB.status, 200);
    assert.ok(Array.isArray(listB.body));
    assert.equal(
      listB.body.some((r: any) => r.id === uploadedRecordId),
      false
    );

    const delForbidden = await apiJson(
      baseUrl,
      `/api/records/${encodeURIComponent(uploadedRecordId)}`,
      { method: 'DELETE', token: patientBToken }
    );
    assert.equal(delForbidden.status, 403);

    const delOwn = await apiJson(
      baseUrl,
      `/api/records/${encodeURIComponent(uploadedRecordId)}`,
      { method: 'DELETE', token: patientAToken }
    );
    assert.equal(delOwn.status, 200);
  });
});
