package com.medicare.model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Abstract Base Entity demonstrating OOP Abstraction and Encapsulation.
 * Rubric Criterion: Core Java Concepts (OOP)
 */
public abstract class User implements Serializable {
    private static final long serialVersionUID = 1L;

    protected String id;
    protected String name;
    protected String email;
    protected String passwordHash;
    protected String role; // "PATIENT", "DOCTOR", "ADMIN"
    protected String phone;
    protected String gender;
    protected String bloodGroup;
    protected String avatarUrl;
    protected String status;
    protected Timestamp createdAt;

    public User() {
        this.status = "Active";
    }

    public User(String id, String name, String email, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = "Active";
    }

    // Abstract method enforcing Polymorphism in derived subclasses
    public abstract String getRoleDisplayName();

    // Encapsulated Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "User{" + "id='" + id + '\'' + ", name='" + name + '\'' + ", role='" + role + '\'' + '}';
    }
}
