package com.medicare.model;

/**
 * Concrete Hospital Administrator Model extending User.
 */
public class Admin extends User {
    private static final long serialVersionUID = 1L;

    private String adminLevel;

    public Admin() {
        super();
        this.role = "ADMIN";
        this.adminLevel = "SYSTEM_ADMIN";
    }

    public Admin(String id, String name, String email) {
        super(id, name, email, "ADMIN");
        this.adminLevel = "SYSTEM_ADMIN";
    }

    @Override
    public String getRoleDisplayName() {
        return "Hospital System Administrator";
    }

    public String getAdminLevel() {
        return adminLevel;
    }

    public void setAdminLevel(String adminLevel) {
        this.adminLevel = adminLevel;
    }
}
