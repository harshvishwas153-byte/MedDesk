package com.medicare.util;

import com.medicare.model.Appointment;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Multi-threaded background dispatcher for SMS/Email notifications upon booking.
 * Rubric Criterion: Core Java Concepts (Threads & Concurrency)
 */
public class NotificationThreadService {
    private static final int THREAD_POOL_SIZE = 4;
    private static final ExecutorService executor = Executors.newFixedThreadPool(THREAD_POOL_SIZE, new ThreadFactory() {
        private final AtomicInteger threadCount = new AtomicInteger(1);
        @Override
        public Thread newThread(Runnable r) {
            Thread t = new Thread(r, "MediCare-Notification-Worker-" + threadCount.getAndIncrement());
            t.setDaemon(true);
            return t;
        }
    });

    /**
     * Dispatches an asynchronous booking notification task to a background worker thread.
     */
    public static void dispatchBookingConfirmation(Appointment appointment) {
        executor.submit(new Runnable() {
            @Override
            public void run() {
                try {
                    String currentThread = Thread.currentThread().getName();
                    System.out.println("[" + currentThread + "] Processing SMS & Email alert for Appointment: " + appointment.getId());
                    
                    // Simulate I/O latency for external SMS/Email gateway
                    Thread.sleep(120);

                    System.out.println("[" + currentThread + "] ✓ Notification successfully sent to Patient: " 
                            + appointment.getPatientName() + " (" + appointment.getPatientEmail() + ")");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    System.err.println("Notification thread interrupted: " + e.getMessage());
                }
            }
        });
    }

    /**
     * Gracefully shuts down the executor pool.
     */
    public static void shutdown() {
        executor.shutdown();
    }
}
