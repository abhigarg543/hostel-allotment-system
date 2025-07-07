import java.util.*;
import java.io.*;


public class HostelAllotmentSystem {
    
    // Data structures for storing information
    private Map<String, Student> students;
    private Map<String, Room> rooms;
    private Map<String, Application> applications;
    private PriorityQueue<Application> allocationQueue;
    
    public HostelAllotmentSystem() {
        students = new HashMap<>();
        rooms = new HashMap<>();
        applications = new HashMap<>();
        allocationQueue = new PriorityQueue<>();
        initializeData();
    }
    
    /**
     * Initialize sample data
     */
    private void initializeData() {
        // Initialize rooms
        createRoom("A101", "A", "Single", "Ground", true);
        createRoom("A102", "A", "Double", "Ground", true);
        createRoom("A103", "A", "Triple", "Ground", true);
        createRoom("B101", "B", "Single", "First", true);
        createRoom("B102", "B", "Double", "First", true);
        createRoom("C101", "C", "Single", "Second", true);
        
        // Initialize students
        registerStudent("2024CS001", "Rahul Kumar", "rahul@iitbhu.ac.in", "Computer Science", 1);
        registerStudent("2024EE001", "Priya Sharma", "priya@iitbhu.ac.in", "Electrical", 1);
        registerStudent("2024ME001", "Amit Patel", "amit@iitbhu.ac.in", "Mechanical", 2);
    }
    
    /**
     * Student authentication
     */
    public boolean authenticateStudent(String email, String password) {
        // In real implementation, this would check against database
        // For demo, using simple validation
        return email.endsWith("@iitbhu.ac.in") && password.length() >= 6;
    }
    
    /**
     * Register a new student
     */
    public boolean registerStudent(String rollNo, String name, String email, String department, int year) {
        if (students.containsKey(rollNo)) {
            return false; // Student already exists
        }
        
        Student student = new Student(Student ID, name, email, department, year);
        students.put(rollNo, student);
        return true;
    }
    
    /**
     * Create a new room
     */
    public boolean createRoom(String roomNumber, String block, String type, String floor, boolean available) {
        if (rooms.containsKey(roomNumber)) {
            return false; // Room already exists
        }
        
        Room room = new Room(roomNumber, block, type, floor, available);
        rooms.put(roomNumber, room);
        return true;
    }
    
    /**
     * Submit hostel application
     */
    public boolean submitApplication(String rollNo, String roomType, String hostelBlock, String phone) {
        Student student = students.get(Student ID);
        if (student == null) {
            return false; // Student not found
        }
        
        // Check if application already exists
        if (applications.containsKey(Student ID)) {
            return false; // Application already submitted
        }
        
        Application application = new Application(student, roomType, hostelBlock, phone);
        applications.put(Student ID, application);
        allocationQueue.offer(application);
        
        return true;
    }
    
    /**
     * Process room allocation using Priority Queue algorithm
     */
    public Map<String, String> processAllocation() {
        Map<String, String> allocations = new HashMap<>();
        
        while (!allocationQueue.isEmpty()) {
            Application application = allocationQueue.poll();
            String allocatedRoom = findBestRoom(application);
            
            if (allocatedRoom != null) {
                allocations.put(application.getStudent().getRollNo(), allocatedRoom);
                rooms.get(allocatedRoom).setAvailable(false);
                application.setAllocatedRoom(allocatedRoom);
            }
        }
        
        return allocations;
    }
    
    /**
     * Find best available room for application
     */
    private String findBestRoom(Application application) {
        String preferredType = application.getRoomType();
        String preferredBlock = application.getHostelBlock();
        
        // First priority: exact match
        for (Room room : rooms.values()) {
            if (room.isAvailable() && 
                room.getType().equals(preferredType) && 
                room.getBlock().equals(preferredBlock)) {
                return room.getRoomNumber();
            }
        }
        
        // Second priority: same type, different block
        for (Room room : rooms.values()) {
            if (room.isAvailable() && room.getType().equals(preferredType)) {
                return room.getRoomNumber();
            }
        }
        
        // Third priority: any available room
        for (Room room : rooms.values()) {
            if (room.isAvailable()) {
                return room.getRoomNumber();
            }
        }
        
        return null; // No room available
    }
    
    /**
     * Get application status
     */
    public String getApplicationStatus(String rollNo) {
        Application application = applications.get(rollNo);
        if (application == null) {
            return "No application found";
        }
        
        if (application.getAllocatedRoom() != null) {
            return "Allocated to Room: " + application.getAllocatedRoom();
        } else {
            return "Pending allocation";
        }
    }
    
    /**
     * Get statistics
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        int totalStudents = students.size();
        int totalApplications = applications.size();
        int totalRooms = rooms.size();
        int availableRooms = (int) rooms.values().stream().filter(Room::isAvailable).count();
        int allocatedRooms = totalRooms - availableRooms;
        
        stats.put("totalStudents", totalStudents);
        stats.put("totalApplications", totalApplications);
        stats.put("totalRooms", totalRooms);
        stats.put("availableRooms", availableRooms);
        stats.put("allocatedRooms", allocatedRooms);
        stats.put("occupancyRate", totalRooms > 0 ? (double) allocatedRooms / totalRooms * 100 : 0);
        
        return stats;
    }
    
    /**
     * Save data to file
     */
    public void saveData(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            // Save students
            writer.println("STUDENTS:");
            for (Student student : students.values()) {
                writer.println(student.getRollNo() + "," + student.getName() + "," + 
                             student.getEmail() + "," + student.getDepartment() + "," + 
                             student.getYear());
            }
            
            // Save rooms
            writer.println("ROOMS:");
            for (Room room : rooms.values()) {
                writer.println(room.getRoomNumber() + "," + room.getBlock() + "," + 
                             room.getType() + "," + room.getFloor() + "," + room.isAvailable());
            }
            
            // Save applications
            writer.println("APPLICATIONS:");
            for (Application app : applications.values()) {
                writer.println(app.getStudent().getRollNo() + "," + app.getRoomType() + "," + 
                             app.getHostelBlock() + "," + app.getAllocatedRoom());
            }
        } catch (IOException e) {
            System.err.println("Error saving data: " + e.getMessage());
        }
    }
    
    /**
     * Load data from file
     */
    public void loadData(String filename) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
            String line;
            String section = "";
            
            while ((line = reader.readLine()) != null) {
                if (line.equals("STUDENTS:") || line.equals("ROOMS:") || line.equals("APPLICATIONS:")) {
                    section = line;
                    continue;
                }
                
                String[] parts = line.split(",");
                switch (section) {
                    case "STUDENTS:":
                        if (parts.length >= 5) {
                            registerStudent(parts[0], parts[1], parts[2], parts[3], 
                                          Integer.parseInt(parts[4]));
                        }
                        break;
                    case "ROOMS:":
                        if (parts.length >= 5) {
                            createRoom(parts[0], parts[1], parts[2], parts[3], 
                                     Boolean.parseBoolean(parts[4]));
                        }
                        break;
                    case "APPLICATIONS:":
                        if (parts.length >= 4) {
                            submitApplication(parts[0], parts[1], parts[2], "");
                            if (!parts[3].equals("null")) {
                                applications.get(parts[0]).setAllocatedRoom(parts[3]);
                            }
                        }
                        break;
                }
            }
        } catch (IOException e) {
            System.err.println("Error loading data: " + e.getMessage());
        }
    }
    
    // Main method for testing
    public static void main(String[] args) {
        HostelAllotmentSystem system = new HostelAllotmentSystem();
        
        System.out.println("=== LPU Hostel Allotment System ===");
        System.out.println("Java Backend Implementation");
        System.out.println("=======================================");
        
        // Test authentication
        System.out.println("\nTesting Authentication:");
        System.out.println("Valid login: " + system.authenticateStudent("student@iitbhu.ac.in", "password123"));
        System.out.println("Invalid login: " + system.authenticateStudent("student@iitbhu.ac.in", "wrong"));
        
        // Test application submission
        System.out.println("\nTesting Application Submission:");
        boolean submitted = system.submitApplication("2024CS001", "Single", "A", "1234567890");
        System.out.println("Application submitted: " + submitted);
        
        // Test room allocation
        System.out.println("\nProcessing Room Allocation:");
        Map<String, String> allocations = system.processAllocation();
        System.out.println("Allocations: " + allocations);
        
        // Show statistics
        System.out.println("\nSystem Statistics:");
        Map<String, Object> stats = system.getStatistics();
        for (Map.Entry<String, Object> entry : stats.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // Test application status
        System.out.println("\nApplication Status:");
        System.out.println("2024CS001: " + system.getApplicationStatus("2024CS001"));
    }
}

/**
 * Student class
 */
class Student {
    private String rollNo, name, email, department;
    private int year;
    
    public Student(String rollNo, String name, String email, String department, int year) {
        this.rollNo = rollNo;
        this.name = name;
        this.email = email;
        this.department = department;
        this.year = year;
    }
    
    // Getters
    public String getRollNo() { return rollNo; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getDepartment() { return department; }
    public int getYear() { return year; }
}

/**
 * Room class
 */
class Room {
    private String roomNumber, block, type, floor;
    private boolean available;
    
    public Room(String roomNumber, String block, String type, String floor, boolean available) {
        this.roomNumber = roomNumber;
        this.block = block;
        this.type = type;
        this.floor = floor;
        this.available = available;
    }
    
    // Getters and Setters
    public String getRoomNumber() { return roomNumber; }
    public String getBlock() { return block; }
    public String getType() { return type; }
    public String getFloor() { return floor; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}

/**
 * Application class with priority for allocation
 */
class Application implements Comparable<Application> {
    private Student student;
    private String roomType, hostelBlock, phone, allocatedRoom;
    private int priorityScore;
    
    public Application(Student student, String roomType, String hostelBlock, String phone) {
        this.student = student;
        this.roomType = roomType;
        this.hostelBlock = hostelBlock;
        this.phone = phone;
        this.allocatedRoom = null;
        calculatePriorityScore();
    }
    
    private void calculatePriorityScore() {
        // Higher year students get priority
        int yearScore = student.getYear() * 100;
        
        // Department diversity (optional)
        int deptScore = 50;
        
        this.priorityScore = yearScore + deptScore;
    }
    
    @Override
    public int compareTo(Application other) {
        // Higher priority score comes first
        return Integer.compare(other.priorityScore, this.priorityScore);
    }
    
    // Getters and Setters
    public Student getStudent() { return student; }
    public String getRoomType() { return roomType; }
    public String getHostelBlock() { return hostelBlock; }
    public String getPhone() { return phone; }
    public String getAllocatedRoom() { return allocatedRoom; }
    public void setAllocatedRoom(String allocatedRoom) { this.allocatedRoom = allocatedRoom; }
    public int getPriorityScore() { return priorityScore; }
} 
